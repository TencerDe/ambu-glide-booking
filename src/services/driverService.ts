import api from './api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getItems } from './supabaseUtils';

// Use local storage as a fallback when Supabase is not available
const getLocalDrivers = () => {
  const driversJson = localStorage.getItem('drivers');
  return driversJson ? JSON.parse(driversJson) : [];
};

export const driverService = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      // Try to find the driver in Supabase
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('username', credentials.username)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Driver not found');
      }
      
      // Check if driver exists
      if (!drivers) {
        throw new Error('Driver not found');
      }
      
      // Get driver credentials to check password
      const { data: driverCreds, error: credsError } = await supabase
        .from('driver_credentials')
        .select('*')
        .eq('driver_id', drivers.id)
        .single();
        
      if (credsError || !driverCreds) {
        console.error('Credentials error:', credsError);
        throw new Error('Invalid credentials');
      }
      
      // Verify password
      if (driverCreds.password !== credentials.password) {
        throw new Error('Invalid password');
      }
      
      // Set driver data in localStorage for session management
      const token = `driver-${Date.now()}`; // Simple token for demo
      localStorage.setItem('token', token);
      localStorage.setItem('role', 'driver');
      localStorage.setItem('driverId', drivers.id);
      localStorage.setItem('driverData', JSON.stringify(drivers));
      
      return { 
        data: { 
          token, 
          driver: drivers 
        } 
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Fallback to localStorage for demo purposes if Supabase fails
      const localDrivers = getLocalDrivers();
      const driver = localDrivers.find((d: any) => 
        d.username === credentials.username && d.password === credentials.password
      );
      
      if (driver) {
        const token = `driver-${Date.now()}`;
        localStorage.setItem('token', token);
        localStorage.setItem('role', 'driver');
        localStorage.setItem('driverId', driver.id);
        localStorage.setItem('driverData', JSON.stringify(driver));
        return { data: { token, driver } };
      }
      
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  },

  getRideRequests: async () => {
    try {
      // Check if driver is already busy with a ride
      const driverId = localStorage.getItem('driverId');
      if (driverId) {
        // First check if the driver has any ongoing rides
        const { data: ongoingRides, error: ongoingError } = await supabase
          .from('ride_requests')
          .select('*')
          .eq('driver_id', driverId)
          .in('status', ['accepted', 'en_route'])
          .order('created_at', { ascending: false });
          
        if (ongoingRides && ongoingRides.length > 0) {
          // If driver has ongoing rides, don't show new requests
          console.log('Driver has ongoing rides:', ongoingRides);
          return { data: [] };
        }
      }
      
      // Get pending ride requests that don't have a driver assigned
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('status', 'pending')
        .is('driver_id', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ride requests:', error);
        throw error;
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Error in getRideRequests:', error);
      // Fallback to mock data for demo purposes
      return api.get('/api/driver/ride-requests/');
    }
  },

  acceptRide: async (rideId: string) => {
    try {
      console.log('Accepting ride with ID:', rideId);
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }
      
      // First check if the driver is already busy with another ride
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('is_available')
        .eq('id', driverId)
        .maybeSingle();
        
      if (driverError) {
        console.error('Error checking driver status:', driverError);
        throw new Error('Failed to check driver status');
      }
      
      if (driverData && !driverData.is_available) {
        throw new Error('You already have an active ride. Complete it before accepting new rides.');
      }
      
      // Check if the ride is still available with a simpler query
      console.log('Checking if ride is still available...');
      const { data: rideCheck, error: rideCheckError } = await supabase
        .from('ride_requests')
        .select('status, driver_id')
        .eq('id', rideId)
        .maybeSingle();
        
      if (rideCheckError) {
        console.error('Error checking ride status:', rideCheckError);
        throw new Error('Failed to check ride status');
      }
      
      // Check if ride exists and is still pending
      if (!rideCheck) {
        console.error('Ride not found:', rideId);
        throw new Error('This ride is no longer available');
      }
      
      if (rideCheck.status !== 'pending' || rideCheck.driver_id) {
        console.error('Ride already taken:', rideCheck);
        throw new Error('This ride has already been accepted by a driver');
      }
      
      console.log('Ride is available, attempting to accept it...');
      
      // Try to update the ride with driver info
      const { data: rideData, error: rideError } = await supabase
        .from('ride_requests')
        .update({ 
          status: 'accepted',
          driver_id: driverId,
          updated_at: new Date().toISOString()
        })
        .eq('id', rideId)
        .eq('status', 'pending')  // Ensure it's still pending
        .is('driver_id', null)    // Ensure no driver has taken it
        .select('*')
        .maybeSingle();
        
      if (rideError) {
        console.error('Error updating ride status:', rideError);
        throw new Error('Failed to accept ride. Please try again.');
      }
      
      if (!rideData) {
        console.error('No data returned from ride update');
        // Double check if someone else took it in the meantime
        const { data: rideAfterAttempt } = await supabase
          .from('ride_requests')
          .select('status, driver_id')
          .eq('id', rideId)
          .maybeSingle();
          
        if (rideAfterAttempt && rideAfterAttempt.driver_id && rideAfterAttempt.driver_id !== driverId) {
          throw new Error('Another driver accepted this ride while you were trying to accept it');
        } else {
          throw new Error('Failed to accept ride. Please try again.');
        }
      }
      
      console.log('Ride accepted successfully:', rideData);
        
      // Update driver status to 'busy'
      const { data: updatedDriver, error: driverUpdateError } = await supabase
        .from('drivers')
        .update({ is_available: false })
        .eq('id', driverId)
        .select()
        .maybeSingle();
        
      if (driverUpdateError) {
        console.error('Error updating driver status:', driverUpdateError);
        // Don't throw here, as the ride was already accepted
        console.log('Proceeding despite driver status update error');
      } else {
        console.log('Driver status updated to busy:', updatedDriver);
        
        // Update local storage with new driver status
        const currentDriverData = localStorage.getItem('driverData');
        if (currentDriverData) {
          try {
            const driverObj = JSON.parse(currentDriverData);
            driverObj.is_available = false;
            localStorage.setItem('driverData', JSON.stringify(driverObj));
          } catch (e) {
            console.error('Error updating driver data in localStorage:', e);
          }
        }
      }
      
      return { data: { message: 'Ride accepted successfully', ride: rideData } };
    } catch (error: any) {
      console.error('Error in acceptRide:', error);
      throw error;
    }
  },

  getDriverProfile: async () => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }
      
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();
        
      if (error) {
        console.error('Error fetching driver profile:', error);
        throw error;
      }
      
      return { data };
    } catch (error) {
      console.error('Error in getDriverProfile:', error);
      // Fallback to localStorage
      const driverData = localStorage.getItem('driverData');
      return { data: driverData ? JSON.parse(driverData) : null };
    }
  },

  getCurrentRide: async () => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }
      
      // Get the driver's current active ride
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('driver_id', driverId)
        .in('status', ['accepted', 'en_route'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Using maybeSingle instead of single
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" which is not an error
        console.error('Error fetching current ride:', error);
        throw error;
      }
      
      return { data };
    } catch (error: any) {
      console.error('Error in getCurrentRide:', error);
      if (error.code === 'PGRST116') {
        return { data: null }; // No current ride
      }
      throw new Error(error.message || 'Failed to get current ride');
    }
  },

  updateRideStatus: async (rideId: string, status: string, location?: { lat: number, lng: number }) => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }
      
      // Prepare update data
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      // Add location if provided
      if (location) {
        updateData.driver_latitude = location.lat;
        updateData.driver_longitude = location.lng;
      }
      
      // Update the ride status
      const { data, error } = await supabase
        .from('ride_requests')
        .update(updateData)
        .eq('id', rideId)
        .eq('driver_id', driverId) // Ensure this driver owns the ride
        .select();
        
      if (error) {
        console.error('Error updating ride status:', error);
        throw error;
      }
      
      // If the ride is completed, update driver availability
      if (status === 'completed') {
        const { error: driverError } = await supabase
          .from('drivers')
          .update({ is_available: true })
          .eq('id', driverId);
          
        if (driverError) {
          console.error('Error updating driver status:', driverError);
          // Don't throw here as the ride status was already updated
        } else {
          // Update local storage
          const driverDataStr = localStorage.getItem('driverData');
          if (driverDataStr) {
            try {
              const driverData = JSON.parse(driverDataStr);
              driverData.is_available = true;
              localStorage.setItem('driverData', JSON.stringify(driverData));
            } catch (e) {
              console.error('Error updating driver data in localStorage:', e);
            }
          }
        }
      }
      
      return { data };
    } catch (error: any) {
      console.error('Error in updateRideStatus:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverData');
  }
};

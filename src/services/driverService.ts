
import api from './api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getItems, updateItem } from './supabaseUtils';

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
      // Use utility function to fetch ride requests
      const data = await getItems('ride_requests', { status: 'eq.pending' });
      return { data };
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
      
      // Update the ride request in Supabase directly (not using updateItem utility)
      const { data: rideData, error: rideError } = await supabase
        .from('ride_requests')
        .update({ 
          status: 'accepted',
          driver_id: driverId 
        })
        .eq('id', rideId)
        .select();
        
      if (rideError) {
        console.error('Error updating ride status:', rideError);
        throw new Error(rideError.message || 'Failed to accept ride');
      }
      
      console.log('Ride accepted successfully:', rideData);
        
      // Also update driver status to 'busy'
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .update({ is_available: false })
        .eq('id', driverId)
        .select();
        
      if (driverError) {
        console.error('Error updating driver status:', driverError);
        // Don't throw here, as the ride was already accepted
      } else {
        console.log('Driver status updated to busy:', driverData);
      }
      
      return { data: { message: 'Ride accepted successfully', ride: rideData?.[0] } };
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

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverData');
  }
};

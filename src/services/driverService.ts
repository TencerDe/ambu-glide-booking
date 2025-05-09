
import api from './api';
import { supabase } from '@/integrations/supabase/client';
import { rideAcceptanceService } from './rideAcceptanceService';
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
      return await rideAcceptanceService.pollRideRequests();
    } catch (error) {
      console.error('Error in getRideRequests:', error);
      // Fallback to mock data for demo purposes
      return api.get('/api/driver/ride-requests/');
    }
  },

  // Delegate ride acceptance to the new specialized service
  acceptRide: async (rideId: string) => {
    const result = await rideAcceptanceService.acceptRide(rideId);
    if (!result.success) {
      throw new Error(result.message);
    }
    return { data: { message: result.message, ride: result.ride } };
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
        .in('status', ['accepted', 'en_route', 'picked_up'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); 
        
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

  // Delegate ride status updates to the new specialized service
  updateRideStatus: async (rideId: string, status: string, location?: { lat: number, lng: number }) => {
    const result = await rideAcceptanceService.updateRideStatus(rideId, status, location);
    if (!result.success) {
      throw new Error(result.message);
    }
    return { data: { message: result.message } };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverData');
  }
};

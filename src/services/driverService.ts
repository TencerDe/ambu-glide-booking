
import api from './api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      // Use direct fetch for ride_requests since it's not in TypeScript definitions
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/ride_requests?status=eq.pending`, {
        method: 'GET',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch ride requests');
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error in getRideRequests:', error);
      // Fallback to mock data for demo purposes
      return api.get('/api/driver/ride-requests/');
    }
  },

  acceptRide: async (rideId: string) => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }
      
      // Update the ride request using direct fetch
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/ride_requests?id=eq.${rideId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          status: 'accepted',
          driver_id: driverId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept ride');
      }
      
      // Also update driver status to 'busy'
      const { error: driverError } = await supabase
        .from('drivers')
        .update({ is_available: false })
        .eq('id', driverId);
        
      if (driverError) {
        console.error('Error updating driver status:', driverError);
      }
      
      return { data: { message: 'Ride accepted successfully' } };
    } catch (error) {
      console.error('Error in acceptRide:', error);
      // Fallback to API for demo purposes
      return api.post('/api/driver/accept-ride/', { rideId });
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

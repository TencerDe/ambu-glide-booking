
import { supabase } from '@/integrations/supabase/client';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = '/api';

/**
 * Service for driver-related operations
 */
export const driverService = {
  /**
   * Login for a driver
   */
  login: async (username: string, password: string) => {
    try {
      // First try Supabase direct authentication
      console.log('Attempting driver login with username:', username);
      
      // Find the driver by username
      const { data: drivers, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('username', username)
        .limit(1);
      
      if (driverError) {
        console.error('Error finding driver:', driverError);
        return { success: false, error: 'Failed to authenticate' };
      }
      
      if (!drivers || drivers.length === 0) {
        console.log('No driver found with username:', username);
        return { success: false, error: 'Invalid credentials' };
      }
      
      const driver = drivers[0];
      
      // Verify password
      const { data: credentials, error: credentialsError } = await supabase
        .from('driver_credentials')
        .select('*')
        .eq('driver_id', driver.id)
        .single();
      
      if (credentialsError) {
        console.error('Error finding credentials:', credentialsError);
        return { success: false, error: 'Authentication failed' };
      }
      
      if (!credentials || credentials.password !== password) {
        console.log('Invalid password for driver:', username);
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Store driver info in local storage
      localStorage.setItem('token', 'driver-session-token');
      localStorage.setItem('role', 'driver');
      localStorage.setItem('driverId', driver.id);
      localStorage.setItem('driverData', JSON.stringify(driver));
      
      console.log('Driver login successful:', driver.name);
      return { success: true };
      
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  },
  
  /**
   * Logout the driver
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverData');
  },
  
  /**
   * Get the driver profile
   */
  getDriverProfile: async () => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        return { success: false, error: 'Driver not authenticated' };
      }
      
      const { data: driver, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true, data: driver };
    } catch (error: any) {
      console.error('Error getting driver profile:', error);
      return { success: false, error: error.message || 'Failed to get profile' };
    }
  },
  
  /**
   * Get available ride requests
   */
  getRideRequests: async () => {
    try {
      // Try to get from Supabase first for realtime data
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('status', 'pending')
        .is('driver_id', null);
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      return { success: true, data: supabaseData || [] };
    } catch (error: any) {
      console.error('Error getting ride requests:', error);
      return { success: false, error: error.message || 'Failed to get ride requests', data: [] };
    }
  },
  
  /**
   * Get the driver's current ride
   */
  getCurrentRide: async () => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) return { success: false, error: 'Driver not authenticated' };
      
      // Try Supabase first for realtime data
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('driver_id', driverId)
        .in('status', ['accepted', 'en_route', 'picked_up'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      return { success: true, data: supabaseData };
    } catch (error: any) {
      console.error('Error getting current ride:', error);
      return { success: false, error: 'Failed to get current ride', data: null };
    }
  },
  
  /**
   * Accept a ride
   */
  acceptRide: async (rideId: string) => {
    try {
      const driverId = localStorage.getItem('driverId');
        
      if (!driverId) {
        return { success: false, error: 'Driver not authenticated' };
      }
      
      // First check if ride is still available
      const { data: availableRide, error: checkError } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('id', rideId)
        .eq('status', 'pending')
        .is('driver_id', null)
        .single();
      
      if (checkError || !availableRide) {
        return { 
          success: false, 
          error: 'This ride is no longer available', 
          code: 'RIDE_UNAVAILABLE' 
        };
      }
      
      // Update driver availability
      const { error: driverError } = await supabase
        .from('drivers')
        .update({ is_available: false })
        .eq('id', driverId);
      
      if (driverError) {
        throw new Error(`Failed to update driver status: ${driverError.message}`);
      }
      
      // Update the ride
      const { data: updatedRide, error: updateError } = await supabase
        .from('ride_requests')
        .update({ 
          driver_id: driverId, 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', rideId)
        .select()
        .single();
      
      if (updateError) {
        // Rollback driver status
        await supabase
          .from('drivers')
          .update({ is_available: true })
          .eq('id', driverId);
          
        throw new Error(`Failed to update ride: ${updateError.message}`);
      }
      
      // Update driver data in localStorage
      const driverDataStr = localStorage.getItem('driverData');
      if (driverDataStr) {
        try {
          const driverData = JSON.parse(driverDataStr);
          driverData.is_available = false;
          localStorage.setItem('driverData', JSON.stringify(driverData));
        } catch (e) {
          console.error('Error updating driver data in localStorage:', e);
        }
      }
      
      return { 
        success: true, 
        data: { 
          ride: updatedRide,
          message: 'Ride accepted successfully'
        }
      };
    } catch (error: any) {
      console.error('Error accepting ride:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to accept ride'
      };
    }
  },
  
  /**
   * Update ride status
   */
  updateRideStatus: async (rideId: string, status: string, location?: { lat: number, lng: number }) => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        return { success: false, error: 'Driver not authenticated' };
      }
      
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (location) {
        updateData.driver_latitude = location.lat;
        updateData.driver_longitude = location.lng;
      }
      
      const { data: updatedRide, error: updateError } = await supabase
        .from('ride_requests')
        .update(updateData)
        .eq('id', rideId)
        .eq('driver_id', driverId)
        .select();
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // If the ride is completed, update driver status accordingly
      if (status === 'completed') {
        await supabase
          .from('drivers')
          .update({ 
            is_available: true,
            updated_at: new Date().toISOString() 
          })
          .eq('id', driverId);
          
        // Update driver data in localStorage
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
      
      return { 
        success: true, 
        data: updatedRide ? updatedRide[0] : null
      };
    } catch (error: any) {
      console.error('Error updating ride status:', error);
      return { success: false, error: error.message || 'Failed to update ride status' };
    }
  }
};

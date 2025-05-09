
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
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/driver/login/`, { email, password });
      
      if (response.data && response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        localStorage.setItem('role', 'driver');
        
        if (response.data.driver) {
          localStorage.setItem('userId', response.data.driver.user.id);
          localStorage.setItem('driverId', response.data.driver.id);
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      return { success: false, error: errorMessage };
    }
  },
  
  /**
   * Logout the driver
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('driverId');
  },
  
  /**
   * Get the driver profile
   */
  getDriverProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/driver/profile/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to get profile';
      return { success: false, error: errorMessage };
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
      
      try {
        // Fallback to API if Supabase fails
        const response = await axios.get(`${API_URL}/rides/available/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        return { success: true, data: response.data };
      } catch (apiError: any) {
        const errorMessage = apiError.response?.data?.error || 'Failed to get ride requests';
        return { success: false, error: errorMessage, data: [] };
      }
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
        .single();
      
      if (supabaseError && supabaseError.code !== 'PGRST116') { // Not found error is ok
        throw new Error(supabaseError.message);
      }
      
      if (supabaseData) {
        return { success: true, data: supabaseData };
      }
      
      // If no active ride found in Supabase, try the API as backup
      const response = await axios.get(`${API_URL}/driver/current-ride/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return { 
        success: true, 
        data: response.data && Object.keys(response.data).length > 0 ? response.data : null 
      };
    } catch (error: any) {
      if (error.message === 'JSON object requested, multiple (or no) rows returned') {
        // No current ride, which is a valid state
        return { success: true, data: null };
      }
      
      console.error('Error getting current ride:', error);
      return { success: false, error: 'Failed to get current ride', data: null };
    }
  },
  
  /**
   * Accept a ride
   */
  acceptRide: async (rideId: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/driver/accept-ride/`,
        { ride_id: rideId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error accepting ride:', error);
      
      // If API request failed, try direct Supabase update as fallback
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
        
        // Update the ride
        const { data: updatedRide, error: updateError } = await supabase
          .from('ride_requests')
          .update({ 
            driver_id: driverId, 
            status: 'accepted',
            updated_at: new Date().toISOString()
          })
          .eq('id', rideId)
          .select();
        
        if (updateError) {
          throw new Error(updateError.message);
        }
        
        return { 
          success: true, 
          data: { 
            ride: updatedRide ? updatedRide[0] : null,
            message: 'Ride accepted successfully'
          }
        };
      } catch (fallbackError: any) {
        const errorMessage = error.response?.data?.error || 
                             error.response?.data?.message ||
                             'Failed to accept ride';
        
        const errorCode = error.response?.data?.code || 'ERROR';
        
        return { 
          success: false, 
          error: errorMessage,
          code: errorCode
        };
      }
    }
  },
  
  /**
   * Update ride status
   */
  updateRideStatus: async (rideId: string, status: string, location?: { lat: number, lng: number }) => {
    try {
      const payload: any = { status };
      
      if (location) {
        payload.driver_latitude = location.lat;
        payload.driver_longitude = location.lng;
      }
      
      const response = await axios.put(
        `${API_URL}/rides/update-status/${rideId}/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating ride status:', error);
      
      // Try Supabase update as fallback
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
              updated_at: new Date().toISOString() 
            })
            .eq('id', driverId);
        }
        
        return { 
          success: true, 
          data: updatedRide ? updatedRide[0] : null
        };
      } catch (fallbackError: any) {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message ||
                            'Failed to update ride status';
        
        return { success: false, error: errorMessage };
      }
    }
  }
};


import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Constants for configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const POLLING_INTERVAL = 2000;

/**
 * A dedicated service for ride acceptance with multiple fallback mechanisms
 */
export const rideAcceptanceService = {
  /**
   * Accept a ride with retry logic and transaction handling
   */
  acceptRide: async (rideId: string): Promise<{ success: boolean; message: string; ride?: any }> => {
    const driverId = localStorage.getItem('driverId');
    if (!driverId) {
      return { success: false, message: 'Driver not authenticated' };
    }

    // Function for a single attempt
    const attemptAccept = async (): Promise<any> => {
      console.log(`Attempting to accept ride ${rideId}`);

      // 1. Check if driver is already busy
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('is_available')
        .eq('id', driverId)
        .single();

      if (driverError) {
        throw new Error('Failed to check driver status');
      }

      if (!driverData.is_available) {
        throw new Error('You already have an active ride');
      }

      // 2. Check if ride is still available
      const { data: rideData, error: rideError } = await supabase
        .from('ride_requests')
        .select('status, driver_id')
        .eq('id', rideId)
        .single();

      if (rideError) {
        throw new Error('Failed to check ride status');
      }

      if (!rideData) {
        throw new Error('Ride not found');
      }

      if (rideData.status !== 'pending' || rideData.driver_id) {
        throw new Error('This ride is no longer available');
      }

      // 3. Update driver status to unavailable (claim exclusivity)
      const { error: updateDriverError } = await supabase
        .from('drivers')
        .update({ is_available: false })
        .eq('id', driverId);

      if (updateDriverError) {
        throw new Error('Failed to update driver status');
      }

      try {
        // 4. Update the ride with driver info - CRITICAL FIX: Add Prefer header
        const { data: updatedRide, error: updateRideError } = await supabase
          .from('ride_requests')
          .update({
            status: 'accepted',
            driver_id: driverId,
            updated_at: new Date().toISOString()
          })
          .eq('id', rideId)
          .eq('status', 'pending')
          .is('driver_id', null)
          .select()
          .single();

        if (updateRideError || !updatedRide) {
          // Rollback driver status
          await supabase
            .from('drivers')
            .update({ is_available: true })
            .eq('id', driverId);

          throw new Error('Failed to accept ride');
        }

        // Update local storage with new driver status
        const driverDataStr = localStorage.getItem('driverData');
        if (driverDataStr) {
          try {
            const driverObj = JSON.parse(driverDataStr);
            driverObj.is_available = false;
            localStorage.setItem('driverData', JSON.stringify(driverObj));
          } catch (e) {
            console.error('Error updating driver data in localStorage:', e);
          }
        }

        console.log('Ride accepted successfully:', updatedRide);
        return updatedRide;
      } catch (error) {
        // Rollback driver status on any error
        await supabase
          .from('drivers')
          .update({ is_available: true })
          .eq('id', driverId);
        throw error;
      }
    };

    // Implementation with retries
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt + 1} of ${MAX_RETRIES}`);
          toast.info(`Retry attempt ${attempt + 1}...`);
          // Increasing delay for each retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
        }

        const ride = await attemptAccept();
        return { 
          success: true, 
          message: 'Ride accepted successfully',
          ride 
        };
      } catch (error: any) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        if (attempt === MAX_RETRIES - 1) {
          // This was the last attempt
          return { 
            success: false, 
            message: error.message || 'Failed to accept ride after multiple attempts'
          };
        }
      }
    }

    return {
      success: false,
      message: 'Failed to accept ride after multiple attempts. Please try again later.'
    };
  },

  /**
   * Update ride status with fallback mechanism
   */
  updateRideStatus: async (
    rideId: string, 
    status: string, 
    location?: { lat: number, lng: number }
  ): Promise<{ success: boolean; message: string }> => {
    const driverId = localStorage.getItem('driverId');
    
    if (!driverId) {
      return { success: false, message: 'Driver not authenticated' };
    }
    
    try {
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
        .eq('driver_id', driverId)
        .select();
        
      if (error) {
        throw error;
      }
      
      // If the ride is completed, update driver availability
      if (status === 'completed') {
        await supabase
          .from('drivers')
          .update({ is_available: true })
          .eq('id', driverId);
        
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
      
      return { success: true, message: `Ride status updated to ${status}` };
    } catch (error: any) {
      console.error('Error updating ride status:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update ride status' 
      };
    }
  },

  /**
   * Poll for ride requests
   */
  pollRideRequests: async () => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (driverId) {
        // Check if driver has any ongoing rides first
        const { data: ongoingRides } = await supabase
          .from('ride_requests')
          .select('*')
          .eq('driver_id', driverId)
          .in('status', ['accepted', 'en_route'])
          .order('created_at', { ascending: false });
          
        if (ongoingRides && ongoingRides.length > 0) {
          return { data: [], hasActiveRide: true, activeRide: ongoingRides[0] };
        }
      }
      
      // Get pending ride requests using direct API for more reliable results
      const response = await fetch(
        "https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?status=eq.pending&driver_id=is.null&select=*",
        {
          method: "GET",
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ride requests: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { data: data || [], hasActiveRide: false };
    } catch (error) {
      console.error('Error polling ride requests:', error);
      return { data: [], hasActiveRide: false };
    }
  },

  /**
   * Direct API method to accept a ride (fallback for when Supabase client fails)
   */
  directAcceptRide: async (rideId: string): Promise<{ success: boolean; message: string; ride?: any }> => {
    const driverId = localStorage.getItem('driverId');
    if (!driverId) {
      return { success: false, message: 'Driver not authenticated' };
    }
    
    try {
      // 1. First, check and update driver status
      const checkDriverResponse = await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/drivers?id=eq.${driverId}&select=is_available`,
        {
          method: "GET",
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      if (!checkDriverResponse.ok) {
        throw new Error('Failed to check driver status');
      }
      
      const driverData = await checkDriverResponse.json();
      if (!driverData.length || !driverData[0].is_available) {
        return { success: false, message: 'You already have an active ride' };
      }
      
      // 2. Check if ride is still available
      const checkRideResponse = await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?id=eq.${rideId}&status=eq.pending&driver_id=is.null&select=*`,
        {
          method: "GET",
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Prefer": "resolution=merge-duplicates"
          }
        }
      );
      
      if (!checkRideResponse.ok) {
        throw new Error('Failed to check ride status');
      }
      
      const rideData = await checkRideResponse.json();
      if (!rideData.length) {
        return { success: false, message: 'This ride is no longer available' };
      }
      
      // 3. Update driver status to unavailable
      await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/drivers?id=eq.${driverId}`,
        {
          method: "PATCH",
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            is_available: false
          })
        }
      );
      
      // 4. Update the ride with driver info
      const updateRideResponse = await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?id=eq.${rideId}`,
        {
          method: "PATCH",
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify({
            status: "accepted",
            driver_id: driverId,
            updated_at: new Date().toISOString()
          })
        }
      );
      
      if (!updateRideResponse.ok) {
        // Rollback driver status
        await fetch(
          `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/drivers?id=eq.${driverId}`,
          {
            method: "PATCH",
            headers: {
              "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify({
              is_available: true
            })
          }
        );
        throw new Error('Failed to update ride');
      }
      
      const updatedRide = await updateRideResponse.json();
      
      // Update local storage with new driver status
      const driverDataStr = localStorage.getItem('driverData');
      if (driverDataStr) {
        try {
          const driverObj = JSON.parse(driverDataStr);
          driverObj.is_available = false;
          localStorage.setItem('driverData', JSON.stringify(driverObj));
        } catch (e) {
          console.error('Error updating driver data in localStorage:', e);
        }
      }
      
      return { 
        success: true, 
        message: 'Ride accepted successfully',
        ride: updatedRide[0] 
      };
    } catch (error: any) {
      console.error('Error in directAcceptRide:', error);
      return {
        success: false,
        message: error.message || 'Failed to accept ride'
      };
    }
  }
};

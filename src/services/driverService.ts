
// Simple and robust service for driver operations
// Using direct API calls instead of complex library calls for reliability

const SUPABASE_URL = "https://lavfpsnvwyzpilmgkytj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo";

export const driverService = {
  // Basic login function
  login: async (credentials: { username: string; password: string }) => {
    try {
      // Check if driver exists
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/drivers?username=eq.${encodeURIComponent(credentials.username)}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }

      const drivers = await response.json();
      if (!drivers || drivers.length === 0) {
        throw new Error('Driver not found');
      }

      const driver = drivers[0];
      
      // Check password (in a real app this would be securely hashed)
      const credsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/driver_credentials?driver_id=eq.${driver.id}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!credsResponse.ok) {
        throw new Error('Failed to verify credentials');
      }
      
      const creds = await credsResponse.json();
      if (!creds || creds.length === 0 || creds[0].password !== credentials.password) {
        throw new Error('Invalid password');
      }
      
      // Login successful - store session data
      const token = `driver-${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('role', 'driver');
      localStorage.setItem('driverId', driver.id);
      localStorage.setItem('driverData', JSON.stringify(driver));
      
      return { data: { token, driver } };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  // Get available ride requests
  getRideRequests: async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/ride_requests?status=eq.pending&driver_id=is.null&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ride requests');
      }

      const rides = await response.json();
      return { data: rides || [] };
    } catch (error: any) {
      console.error('Error getting ride requests:', error);
      return { data: [] };
    }
  },

  // Accept a ride - COMPLETELY REFACTORED to use direct REST API with proper headers
  acceptRide: async (rideId: string) => {
    try {
      console.log(`Accepting ride ${rideId} - using direct API calls`);
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }

      // STEP 1: Check if driver is available
      const driverResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/drivers?id=eq.${driverId}&select=is_available`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      
      if (!driverResponse.ok) {
        throw new Error('Failed to check driver status');
      }
      
      const driverData = await driverResponse.json();
      if (!driverData.length || !driverData[0].is_available) {
        throw new Error('You already have an active ride');
      }
      
      // STEP 2: Check if ride is still available (using single=true for exact results)
      const rideResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/ride_requests?id=eq.${rideId}&status=eq.pending&driver_id=is.null&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Accept': 'application/vnd.pgrst.object+json' // Important! Gets a single object
          }
        }
      );

      // Check if ride was found
      if (rideResponse.status === 406) {
        throw new Error('This ride is no longer available');
      }
      
      if (!rideResponse.ok) {
        throw new Error(`Failed to check ride status: ${rideResponse.statusText}`);
      }
      
      const rideData = await rideResponse.json();
      if (!rideData || !rideData.id) {
        throw new Error('This ride is no longer available');
      }
      
      // STEP 3: Mark driver as busy
      const updateDriverResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/drivers?id=eq.${driverId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            is_available: false
          })
        }
      );
      
      if (!updateDriverResponse.ok) {
        throw new Error('Failed to update driver status');
      }
      
      // STEP 4: Update ride with driver info
      const updateRideResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/ride_requests?id=eq.${rideId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            status: 'accepted',
            driver_id: driverId,
            updated_at: new Date().toISOString()
          })
        }
      );
      
      if (!updateRideResponse.ok) {
        // Rollback driver status
        await fetch(
          `${SUPABASE_URL}/rest/v1/drivers?id=eq.${driverId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY, 
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_available: true })
          }
        );
        throw new Error(`Failed to update ride: ${updateRideResponse.statusText}`);
      }
      
      const updatedRide = await updateRideResponse.json();
      
      // Update driver data in localStorage
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
      return { success: true, data: { message: 'Ride accepted successfully', ride: updatedRide[0] } };
    } catch (error: any) {
      console.error('Error accepting ride:', error);
      return { success: false, error: error.message || 'Failed to accept ride' };
    }
  },

  // Get driver profile
  getDriverProfile: async () => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/drivers?id=eq.${driverId}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Accept': 'application/vnd.pgrst.object+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch driver profile');
      }
      
      const driver = await response.json();
      return { data: driver };
    } catch (error: any) {
      console.error('Error getting driver profile:', error);
      
      // Fallback to localStorage
      const driverData = localStorage.getItem('driverData');
      return { data: driverData ? JSON.parse(driverData) : null };
    }
  },

  // Get current active ride
  getCurrentRide: async () => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/ride_requests?driver_id=eq.${driverId}&or=(status.eq.accepted,status.eq.en_route,status.eq.picked_up)&order=created_at.desc&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch current ride');
      }
      
      const rides = await response.json();
      return { data: rides && rides.length > 0 ? rides[0] : null };
    } catch (error: any) {
      console.error('Error getting current ride:', error);
      return { data: null };
    }
  },

  // Update ride status
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
      
      // Update ride status
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/ride_requests?id=eq.${rideId}&driver_id=eq.${driverId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updateData)
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update ride status');
      }
      
      // If ride is completed, update driver availability
      if (status === 'completed') {
        await fetch(
          `${SUPABASE_URL}/rest/v1/drivers?id=eq.${driverId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              is_available: true,
              status: 'AVAILABLE'
            })
          }
        );
        
        // Update local storage
        const driverDataStr = localStorage.getItem('driverData');
        if (driverDataStr) {
          try {
            const driverData = JSON.parse(driverDataStr);
            driverData.is_available = true;
            driverData.status = 'AVAILABLE';
            localStorage.setItem('driverData', JSON.stringify(driverData));
          } catch (e) {
            console.error('Error updating driver data in localStorage:', e);
          }
        }
      }
      
      return { success: true, data: { message: `Ride status updated to ${status}` } };
    } catch (error: any) {
      console.error('Error updating ride status:', error);
      return { success: false, error: error.message || 'Failed to update ride status' };
    }
  },

  // New: Update driver availability status
  updateDriverStatus: async (status: string) => {
    try {
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }
      
      // Check if driver has active rides before setting to AVAILABLE
      if (status === 'AVAILABLE') {
        const activeRidesResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/ride_requests?driver_id=eq.${driverId}&or=(status.eq.accepted,status.eq.en_route,status.eq.picked_up)`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Accept': 'application/json'
            }
          }
        );
        
        if (!activeRidesResponse.ok) {
          throw new Error('Failed to check active rides');
        }
        
        const activeRides = await activeRidesResponse.json();
        if (activeRides && activeRides.length > 0) {
          return { 
            success: false, 
            error: 'Cannot set status to Available while you have active rides' 
          };
        }
      }
      
      // Update driver status
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/drivers?id=eq.${driverId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status,
            is_available: status === 'AVAILABLE'
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update driver status');
      }
      
      // Update driver data in localStorage
      const driverDataStr = localStorage.getItem('driverData');
      if (driverDataStr) {
        try {
          const driverObj = JSON.parse(driverDataStr);
          driverObj.status = status;
          driverObj.is_available = status === 'AVAILABLE';
          localStorage.setItem('driverData', JSON.stringify(driverObj));
        } catch (e) {
          console.error('Error updating driver data in localStorage:', e);
        }
      }
      
      return { success: true, data: { message: `Status updated to ${status}` } };
    } catch (error: any) {
      console.error('Error updating driver status:', error);
      return { success: false, error: error.message || 'Failed to update driver status' };
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverData');
  }
};

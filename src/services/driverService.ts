
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

  // Simplified ride acceptance method that uses a direct approach
  acceptRide: async (rideId: string) => {
    try {
      console.log(`Beginning ride acceptance process for ride ${rideId}`);
      const driverId = localStorage.getItem('driverId');
      
      if (!driverId) {
        throw new Error('Driver not authenticated');
      }
      
      // First, check if driver is available
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('is_available')
        .eq('id', driverId)
        .single();
        
      if (driverError || !driverData) {
        throw new Error('Failed to verify driver availability');
      }
      
      if (!driverData.is_available) {
        throw new Error('You already have an active ride');
      }
      
      // Check ride availability using a direct REST call to avoid content negotiation issues
      const checkRideResponse = await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?id=eq.${rideId}&status=eq.pending&select=*`,
        {
          method: "GET",
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Content-Type": "application/json",
            "Accept": "application/vnd.pgrst.object+json"
          }
        }
      );
      
      if (!checkRideResponse.ok) {
        throw new Error(`Failed to check ride availability: ${checkRideResponse.statusText}`);
      }
      
      const rideData = await checkRideResponse.json();
      if (!rideData || rideData.length === 0) {
        throw new Error('This ride is no longer available');
      }
      
      // Set driver as unavailable
      const updateDriverResponse = await fetch(
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
      
      if (!updateDriverResponse.ok) {
        throw new Error(`Failed to update driver status: ${updateDriverResponse.statusText}`);
      }
      
      // Update ride with driver info - critical fix to use the right content negotiation
      const updateRideResponse = await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?id=eq.${rideId}`,
        {
          method: "PATCH",
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Content-Type": "application/json",
            "Accept": "application/vnd.pgrst.object+json",
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
        // Rollback driver availability
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
        throw new Error(`Failed to update ride: ${updateRideResponse.statusText}`);
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
      
      console.log('Ride accepted successfully:', updatedRide);
      return { data: { message: 'Ride accepted successfully', ride: updatedRide } };
    } catch (error: any) {
      console.error('Error accepting ride:', error);
      throw new Error(error.message || 'Failed to accept ride');
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
      
      // Get the driver's current active ride using direct API call for reliability
      const response = await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?driver_id=eq.${driverId}&or=(status.eq.accepted,status.eq.en_route,status.eq.picked_up)&order=created_at.desc&limit=1`,
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
        throw new Error(`Failed to fetch current ride: ${response.statusText}`);
      }
      
      const rides = await response.json();
      return { data: rides && rides.length > 0 ? rides[0] : null };
    } catch (error: any) {
      console.error('Error in getCurrentRide:', error);
      throw new Error(error.message || 'Failed to get current ride');
    }
  },

  // Direct implementation for updating ride status without relying on a separate service
  updateRideStatus: async (rideId: string, status: string, location?: { lat: number, lng: number }) => {
    const driverId = localStorage.getItem('driverId');
    
    if (!driverId) {
      throw new Error('Driver not authenticated');
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
      
      // Update ride status using direct API call
      const response = await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?id=eq.${rideId}&driver_id=eq.${driverId}`,
        {
          method: "PATCH",
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify(updateData)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update ride status: ${response.statusText}`);
      }
      
      // If ride is completed, update driver availability
      if (status === 'completed') {
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
      
      return { data: { message: `Ride status updated to ${status}` } };
    } catch (error: any) {
      console.error('Error updating ride status:', error);
      throw new Error(error.message || 'Failed to update ride status');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverData');
  }
};

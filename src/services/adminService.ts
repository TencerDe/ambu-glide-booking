import api from './api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const adminService = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      const response = await api.post('/api/admin/login/', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', 'admin');
      }
      
      return response;
    } catch (error) {
      console.error('API error in admin login:', error);
      
      // Mock successful login for development without backend
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const mockToken = 'mock-admin-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('role', 'admin');
        
        return {
          data: {
            token: mockToken,
            admin: {
              id: '1',
              email: 'admin@example.com',
              username: 'admin'
            }
          },
          status: 200,
          statusText: 'OK (Mocked)',
          headers: {},
          config: {},
        };
      }
      
      throw error;
    }
  },

  createDriver: async (driverData: {
    name: string;
    username: string;
    password: string;
    email?: string;
    phoneNumber?: string;
    aadhaarNumber?: string;
    licenseNumber?: string;
    address?: string;
    vehicleNumber?: string;
  }) => {
    try {
      console.log('Creating driver with Supabase:', driverData);
      
      // First check if the username is already taken
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('id')
        .eq('username', driverData.username)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the "not found" error
        console.error('Error checking for existing driver:', checkError);
        throw new Error('Failed to check if username exists');
      }
      
      if (existingDriver) {
        throw new Error(`Driver with username ${driverData.username} already exists`);
      }
      
      // Insert the new driver
      const { data: driver, error } = await supabase
        .from('drivers')
        .insert([
          {
            name: driverData.name,
            username: driverData.username,
            phone_number: driverData.phoneNumber,
            license_number: driverData.licenseNumber,
            aadhaar_number: driverData.aadhaarNumber,
            address: driverData.address,
            vehicle_number: driverData.vehicleNumber,
            is_available: true
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating driver:', error);
        throw new Error('Failed to create driver: ' + error.message);
      }
      
      // Add driver credentials
      const { error: credError } = await supabase
        .from('driver_credentials')
        .insert([
          {
            driver_id: driver.id,
            password: driverData.password
          }
        ]);
        
      if (credError) {
        console.error('Error creating driver credentials:', credError);
        
        // Rollback driver creation if credentials fail
        await supabase
          .from('drivers')
          .delete()
          .eq('id', driver.id);
          
        throw new Error('Failed to create driver credentials');
      }
      
      return { data: driver };
    } catch (error: any) {
      console.error('Error in createDriver:', error);
      
      // If it's a Supabase error or our custom error, pass it through
      if (error.message) {
        throw new Error(error.message);
      }
      
      // Otherwise, provide a generic error
      throw new Error('Failed to create driver');
    }
  },

  updateDriver: async (driverId: string, driverData: {
    name?: string;
    phoneNumber?: string;
    licenseNumber?: string;
    address?: string;
    vehicleNumber?: string;
    is_available?: boolean;
  }) => {
    try {
      console.log('Updating driver with Supabase:', driverId, driverData);
      
      const { data, error } = await supabase
        .from('drivers')
        .update({
          name: driverData.name,
          phone_number: driverData.phoneNumber,
          license_number: driverData.licenseNumber,
          address: driverData.address,
          vehicle_number: driverData.vehicleNumber,
          is_available: driverData.is_available,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating driver:', error);
        throw new Error('Failed to update driver');
      }
      
      return { data };
    } catch (error) {
      console.error('Error in updateDriver:', error);
      throw error;
    }
  },
  
  deleteDriver: async (driverId: string) => {
    try {
      console.log('Deleting driver with Supabase:', driverId);
      
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);
        
      if (error) {
        console.error('Error deleting driver:', error);
        throw new Error('Failed to delete driver');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteDriver:', error);
      throw error;
    }
  },

  viewRides: async () => {
    try {
      return await api.get('/api/admin/view-rides/');
    } catch (error) {
      console.error('API error when fetching rides:', error);
      
      // Return mock data if API fails
      const mockRides = [
        {
          id: '123456',
          name: 'John Patient',
          address: '123 Patient St, City',
          ambulanceType: 'Emergency',
          vehicleType: 'Advanced Life Support',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          id: '123457',
          name: 'Jane Patient',
          address: '456 Health Ave, Town',
          ambulanceType: 'Non-Emergency',
          vehicleType: 'Basic Life Support',
          status: 'accepted',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          driver: {
            id: '1',
            name: 'Sachin Bisht',
          }
        }
      ];
      
      return {
        data: mockRides,
        status: 200,
        statusText: 'OK (Mocked)',
        headers: {},
        config: {},
      };
    }
  },
  
  viewDrivers: async () => {
    try {
      console.log('Fetching drivers from Supabase');
      
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching drivers:', error);
        throw new Error('Failed to fetch drivers');
      }
      
      // Format the drivers to match our expected structure
      const formattedDrivers = drivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        username: driver.username,
        is_available: driver.is_available,
        phoneNumber: driver.phone_number,
        licenseNumber: driver.license_number,
        aadhaarNumber: driver.aadhaar_number,
        address: driver.address,
        vehicleNumber: driver.vehicle_number
      }));
      
      return { data: formattedDrivers };
    } catch (error) {
      console.error('Error in viewDrivers:', error);
      
      // Fallback to localStorage if Supabase fails
      try {
        const storedDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
        return {
          data: storedDrivers,
          status: 200,
          statusText: 'OK (from localStorage)',
          headers: {},
          config: {},
        };
      } catch (fallbackError) {
        console.error('Fallback to localStorage failed:', fallbackError);
        
        // If all else fails, return an empty array
        return {
          data: [],
          status: 200,
          statusText: 'OK (empty fallback)',
          headers: {},
          config: {},
        };
      }
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};

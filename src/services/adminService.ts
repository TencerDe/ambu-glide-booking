
import { supabase } from '@/integrations/supabase/client';

interface Driver {
  id?: string;
  name: string;
  username: string;
  is_available: boolean;
  phoneNumber?: string;
  licenseNumber?: string;
  aadhaarNumber?: string;
  address?: string;
  vehicleNumber?: string;
  password?: string; // Added password field
}

// Use local storage as a fallback when Supabase is not available
const getLocalDrivers = () => {
  const driversJson = localStorage.getItem('drivers');
  return driversJson ? JSON.parse(driversJson) : [];
};

const saveLocalDrivers = (drivers: any[]) => {
  localStorage.setItem('drivers', JSON.stringify(drivers));
};

export const adminService = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      // For demo purposes, check if credentials are admin/admin
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const token = `admin-${Date.now()}`;
        localStorage.setItem('token', token);
        localStorage.setItem('role', 'admin');
        return { data: { token } };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  viewRides: async () => {
    try {
      // Get ride requests from Supabase
      const { data, error } = await supabase
        .from('ride_requests')
        .select(`
          *,
          driver:driver_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching rides:', error);
        throw error;
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Error in viewRides:', error);
      
      // Fallback to mock data for demo
      return {
        data: [
          {
            id: 'r1',
            name: 'John Doe',
            address: '123 Main St',
            ambulanceType: 'With Medical Assistance',
            vehicleType: 'Van',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            id: 'r2',
            name: 'Jane Smith',
            address: '456 Oak Ave',
            ambulanceType: 'Without Medical Assistance',
            vehicleType: 'Mini Bus',
            status: 'accepted',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            driver: { id: 'd1', name: 'Driver 1' }
          }
        ]
      };
    }
  },

  viewDrivers: async () => {
    try {
      // Get drivers from Supabase
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching drivers:', error);
        throw error;
      }
      
      return { 
        data: data.map(d => ({
          id: d.id,
          name: d.name,
          username: d.username,
          is_available: d.is_available,
          phoneNumber: d.phone_number,
          licenseNumber: d.license_number,
          aadhaarNumber: d.aadhaar_number,
          address: d.address,
          vehicleNumber: d.vehicle_number
        })) || [] 
      };
    } catch (error) {
      console.error('Error in viewDrivers:', error);
      
      // Fallback to localStorage for demo purposes
      return { data: getLocalDrivers() };
    }
  },

  addDriver: async (driverData: Driver) => {
    try {
      // First, insert the driver into the drivers table
      const { data, error } = await supabase
        .from('drivers')
        .insert([{
          name: driverData.name,
          username: driverData.username,
          is_available: driverData.is_available,
          phone_number: driverData.phoneNumber,
          license_number: driverData.licenseNumber,
          aadhaar_number: driverData.aadhaarNumber,
          address: driverData.address,
          vehicle_number: driverData.vehicleNumber
        }])
        .select();
      
      if (error) {
        console.error('Error adding driver:', error);
        throw error;
      }
      
      // Then, store the driver credentials
      if (data && data[0] && driverData.password) {
        const { error: credError } = await supabase
          .from('driver_credentials')
          .insert([{
            driver_id: data[0].id,
            password: driverData.password
          }]);
        
        if (credError) {
          console.error('Error adding driver credentials:', credError);
          throw credError;
        }
      }
      
      return { data: data && data[0] };
    } catch (error) {
      console.error('Error in addDriver:', error);
      
      // Fallback to localStorage for demo purposes
      const drivers = getLocalDrivers();
      const newDriver = {
        ...driverData,
        id: `d${Date.now()}`,
        created_at: new Date().toISOString()
      };
      drivers.push(newDriver);
      saveLocalDrivers(drivers);
      return { data: newDriver };
    }
  },

  updateDriver: async (driverData: Driver) => {
    try {
      // Update driver information
      const { error } = await supabase
        .from('drivers')
        .update({
          name: driverData.name,
          username: driverData.username,
          is_available: driverData.is_available,
          phone_number: driverData.phoneNumber,
          license_number: driverData.licenseNumber,
          aadhaar_number: driverData.aadhaarNumber,
          address: driverData.address,
          vehicle_number: driverData.vehicleNumber
        })
        .eq('id', driverData.id);
      
      if (error) {
        console.error('Error updating driver:', error);
        throw error;
      }
      
      // If password is provided, update the driver's password
      if (driverData.password && driverData.password.trim() !== '') {
        // Check if driver credentials exist
        const { data: existingCreds, error: checkError } = await supabase
          .from('driver_credentials')
          .select('*')
          .eq('driver_id', driverData.id);
        
        if (checkError) {
          console.error('Error checking driver credentials:', checkError);
          throw checkError;
        }
        
        // If credentials exist, update them
        if (existingCreds && existingCreds.length > 0) {
          const { error: updateError } = await supabase
            .from('driver_credentials')
            .update({ password: driverData.password })
            .eq('driver_id', driverData.id);
          
          if (updateError) {
            console.error('Error updating driver credentials:', updateError);
            throw updateError;
          }
        } else {
          // If credentials don't exist, insert them
          const { error: insertError } = await supabase
            .from('driver_credentials')
            .insert([{
              driver_id: driverData.id,
              password: driverData.password
            }]);
          
          if (insertError) {
            console.error('Error inserting driver credentials:', insertError);
            throw insertError;
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in updateDriver:', error);
      
      // Fallback to localStorage for demo purposes
      const drivers = getLocalDrivers();
      const index = drivers.findIndex((d: any) => d.id === driverData.id);
      if (index !== -1) {
        drivers[index] = {
          ...drivers[index],
          ...driverData,
          updated_at: new Date().toISOString()
        };
        saveLocalDrivers(drivers);
      }
      return { success: true };
    }
  },

  deleteDriver: async (driverId: string) => {
    try {
      // First delete driver credentials
      const { error: credError } = await supabase
        .from('driver_credentials')
        .delete()
        .eq('driver_id', driverId);
      
      if (credError) {
        console.error('Error deleting driver credentials:', credError);
        // Continue with driver deletion even if credentials deletion fails
      }
      
      // Then delete the driver
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);
      
      if (error) {
        console.error('Error deleting driver:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteDriver:', error);
      
      // Fallback to localStorage for demo purposes
      const drivers = getLocalDrivers();
      const filteredDrivers = drivers.filter((d: any) => d.id !== driverId);
      saveLocalDrivers(filteredDrivers);
      return { success: true };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};


import api from './api';

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
    // Format the data according to the backend expectations
    const formattedData = {
      first_name: driverData.name.split(' ')[0],
      last_name: driverData.name.split(' ').slice(1).join(' ') || '',
      username: driverData.username,
      email: driverData.email || `${driverData.username}@example.com`,
      password: driverData.password,
      phone_number: driverData.phoneNumber,
      license_number: driverData.licenseNumber,
      vehicle_number: driverData.vehicleNumber,
      aadhaar_number: driverData.aadhaarNumber,
      address: driverData.address,
    };
    
    console.log('Formatted driver data:', formattedData);
    
    try {
      // Try to use the API first
      const response = await api.post('/api/admin/create-driver/', formattedData);
      return response;
    } catch (error) {
      console.error('API error when creating driver:', error);
      
      // Fallback: Store driver in localStorage if API fails
      const storedDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
      
      // Check if username already exists
      const driverExists = storedDrivers.some((driver: any) => driver.username === driverData.username);
      if (driverExists) {
        const error = new Error(`Driver with username ${driverData.username} already exists`);
        throw error;
      }
      
      const newDriver = {
        id: Date.now().toString(),
        name: driverData.name,
        username: driverData.username,
        email: formattedData.email,
        is_available: true,
        phoneNumber: driverData.phoneNumber,
        licenseNumber: driverData.licenseNumber,
        aadhaarNumber: driverData.aadhaarNumber,
        address: driverData.address,
        vehicleNumber: driverData.vehicleNumber,
      };
      
      storedDrivers.push(newDriver);
      localStorage.setItem('drivers', JSON.stringify(storedDrivers));
      
      // Also store driver credentials for login
      const driverCredentials = JSON.parse(localStorage.getItem('driverCredentials') || '{}');
      driverCredentials[driverData.username] = {
        password: driverData.password,
        driverId: newDriver.id
      };
      localStorage.setItem('driverCredentials', JSON.stringify(driverCredentials));
      
      // Return a mock response
      return {
        data: newDriver,
        status: 200,
        statusText: 'OK (Mocked)',
        headers: {},
        config: {},
      };
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
      const response = await api.get('/api/admin/drivers/');
      return response;
    } catch (error) {
      console.error('API error when fetching drivers:', error);
      
      // Return drivers from localStorage if API fails
      const storedDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
      
      if (storedDrivers.length === 0) {
        // Return some mock data if no drivers in localStorage
        const mockDrivers = [
          { 
            id: '1', 
            name: 'Sachin Bisht', 
            username: 'sachin', 
            is_available: true,
            phoneNumber: '9876543210',
            licenseNumber: 'DL8755671yu77',
            aadhaarNumber: '123456789012',
            address: 'jawli Village, Loni',
            vehicleNumber: 'UP14EN7476'
          }
        ];
        
        return {
          data: mockDrivers,
          status: 200,
          statusText: 'OK (Mocked)',
          headers: {},
          config: {},
        };
      }
      
      return {
        data: storedDrivers,
        status: 200,
        statusText: 'OK (Mocked)',
        headers: {},
        config: {},
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};

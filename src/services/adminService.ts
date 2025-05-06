
import api from './api';

export const adminService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/api/admin/login/', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'admin');
    }
    
    return response;
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
      username: driverData.username, // Add username field
      email: driverData.email || `${driverData.username}@example.com`,
      password: driverData.password,
      phone_number: driverData.phoneNumber,
      license_number: driverData.licenseNumber,
      vehicle_number: driverData.vehicleNumber,
      aadhaar_number: driverData.aadhaarNumber, // Add aadhaar number
      address: driverData.address, // Add address
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
      return {
        data: [
          {
            id: '123456',
            name: 'John Patient',
            address: '123 Patient St, City',
            ambulanceType: 'Emergency',
            vehicleType: 'Advanced Life Support',
            status: 'pending',
            createdAt: new Date().toISOString(),
          }
        ],
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

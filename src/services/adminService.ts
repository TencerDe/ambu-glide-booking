
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
      email: driverData.email || `${driverData.username}@example.com`,
      password: driverData.password,
      phone_number: driverData.phoneNumber,
      license_number: driverData.licenseNumber,
      vehicle_number: driverData.vehicleNumber,
      // Add other fields as needed by the API
    };
    
    console.log('Formatted driver data:', formattedData);
    return api.post('/api/admin/create-driver/', formattedData);
  },

  viewRides: async () => {
    return api.get('/api/admin/view-rides/');
  },
  
  viewDrivers: async () => {
    return api.get('/api/admin/drivers/');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};

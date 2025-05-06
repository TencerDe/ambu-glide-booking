
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
    return api.post('/api/admin/create-driver/', driverData);
  },

  viewRides: async () => {
    return api.get('/api/admin/view-rides/');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};

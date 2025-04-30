
import api from './api';

export const userService = {
  signup: async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => {
    const { confirmPassword, ...data } = userData;
    return api.post('/api/user/signup/', data);
  },

  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/api/user/login/', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'user');
    }
    
    return response;
  },

  getProfile: async () => {
    return api.get('/api/user/profile/');
  },

  bookRide: async (bookingData: {
    name: string;
    address: string;
    age: number;
    ambulanceType: string;
    vehicleType: string;
    notes?: string;
  }) => {
    return api.post('/api/book-ride/', bookingData);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};

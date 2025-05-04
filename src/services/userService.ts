
import api from './api';

export const userService = {
  googleLogin: async (userData: {
    name: string;
    email: string;
    photoUrl?: string;
  }) => {
    // In a real app, this would validate the Google token with the backend
    // For now, we'll just return the user data
    return { data: { token: 'dummy-token', user: userData } };
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
    localStorage.removeItem('user');
  }
};

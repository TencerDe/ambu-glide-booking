
import api from './api';

export const driverService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/api/driver/login/', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'driver');
    }
    
    return response;
  },

  getRideRequests: async () => {
    return api.get('/api/driver/ride-requests/');
  },

  acceptRide: async (rideId: string) => {
    return api.post('/api/driver/accept-ride/', { rideId });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};

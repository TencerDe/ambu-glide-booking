
import api from './api';

// Define profile data type for TypeScript
interface ProfileData {
  bloodGroup?: string;
  age?: number;
  preferredHospital?: string;
  healthIssues?: string[];
}

export const userService = {
  googleLogin: async (userData: {
    name: string;
    email: string;
    photoUrl?: string;
    token?: string;
  }) => {
    // In a real app, we would validate the token with the backend
    // For now, we'll just return the user data
    return { data: { token: userData.token || 'google-token', user: userData } };
  },

  getProfile: async () => {
    return api.get('/api/user/profile/');
  },

  updateProfile: async (profileData: ProfileData) => {
    // In a real app, we would send this to the backend
    // For now, we'll just return the updated profile data
    return { data: profileData };
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

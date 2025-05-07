
import api from './api';
import { supabase } from '@/integrations/supabase/client';

// Define profile data type for TypeScript
interface ProfileData {
  bloodGroup?: string;
  age?: number;
  preferredHospital?: string;
  healthIssues?: string[];
}

// Define booking data type
interface BookingData {
  name: string;
  address: string;
  age: number;
  ambulanceType: string;
  vehicleType: string;
  notes?: string;
  hospital?: string;
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

  bookRide: async (bookingData: BookingData) => {
    try {
      // Fixed charge of 5000 rupees for testing
      const charge = 5000;
      
      // Create a ride request in Supabase
      const { data, error } = await supabase
        .from('ride_requests')
        .insert([
          {
            name: bookingData.name,
            address: bookingData.address,
            age: bookingData.age,
            ambulance_type: bookingData.ambulanceType,
            vehicle_type: bookingData.vehicleType,
            notes: bookingData.notes || '',
            hospital: bookingData.hospital || 'Not specified',
            status: 'pending',
            charge: charge,
            latitude: 0, // These should be replaced with actual coordinates
            longitude: 0,
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) {
        console.error('Error booking ride:', error);
        throw error;
      }
      
      return { data };
    } catch (error) {
      console.error('Error in bookRide:', error);
      // Fallback to the API for demo purposes
      return api.post('/api/book-ride/', bookingData);
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  }
};

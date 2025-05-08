
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
      
      // Create a ride request using custom fetch instead of Supabase client
      // since the ride_requests table is not in the TypeScript definitions
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/ride_requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify([{
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
        }])
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error booking ride:', errorData);
        throw new Error('Failed to book ride');
      }
      
      const data = await response.json();
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

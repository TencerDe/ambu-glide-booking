
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const initTestDriver = async () => {
  try {
    console.log('Creating test driver...');
    
    // Check if test driver already exists
    const { data: existingDriver } = await supabase
      .from('drivers')
      .select('*')
      .eq('username', 'testdriver')
      .single();
      
    if (existingDriver) {
      console.log('Test driver already exists, skipping creation');
      return existingDriver;
    }
    
    // Create a new user for the driver
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: 'testdriver@example.com',
      password: 'test123456',
      options: {
        data: {
          full_name: 'Test Driver',
          user_type: 'DRIVER'
        }
      }
    });
    
    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`);
    }
    
    if (!userData.user) {
      throw new Error('No user data returned');
    }
    
    // Create driver record
    // Remove the 'vehicle_model' field that's causing the error
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .insert({
        user_id: userData.user.id,
        name: 'Test Driver',
        username: 'testdriver',
        phone_number: '9876543210',
        vehicle_number: 'DL-01-AB-1234',
        status: 'AVAILABLE',
        is_available: true
      })
      .select()
      .single();
      
    if (driverError) {
      throw new Error(`Failed to create driver: ${driverError.message}`);
    }
    
    console.log('Test driver created successfully:', driverData);
    return driverData;
    
  } catch (error: any) {
    console.error('Error creating test driver:', error);
    toast.error('Failed to create test driver');
    throw error;
  }
};

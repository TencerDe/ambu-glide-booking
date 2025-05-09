
import { supabase } from '@/integrations/supabase/client';

/**
 * Initialize a test driver account in the database
 */
export const initTestDriver = async () => {
  try {
    console.log("Creating test driver...");
    
    // Check if driver already exists
    const { data: existingDrivers } = await supabase
      .from('drivers')
      .select('*')
      .eq('username', 'driver1');
    
    if (existingDrivers && existingDrivers.length > 0) {
      console.log("Test driver already exists:", existingDrivers[0].id);
      return existingDrivers[0];
    }
    
    // Create driver
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .insert([
        {
          name: 'Test Driver',
          username: 'driver1',
          phone_number: '1234567890',
          license_number: 'DL12345',
          vehicle_number: 'MH-01-AB-1234',
          vehicle_model: 'Ambulance Type A',
          is_available: true
        }
      ])
      .select();
    
    if (driverError || !driver || driver.length === 0) {
      throw new Error(`Failed to create driver: ${driverError?.message || 'Unknown error'}`);
    }
    
    // Create driver credentials
    const { error: credentialsError } = await supabase
      .from('driver_credentials')
      .insert([
        {
          driver_id: driver[0].id,
          password: 'password123'
        }
      ]);
    
    if (credentialsError) {
      // Cleanup the driver if credentials creation fails
      await supabase.from('drivers').delete().eq('id', driver[0].id);
      throw new Error(`Failed to create credentials: ${credentialsError.message}`);
    }
    
    console.log("Test driver created successfully:", driver[0].id);
    console.log("Username: driver1");
    console.log("Password: password123");
    
    return driver[0];
  } catch (error) {
    console.error("Error creating test driver:", error);
    return null;
  }
};

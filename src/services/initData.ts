
import { adminService } from './adminService';
import { supabase } from '@/integrations/supabase/client';

// Function to initialize a test driver
export const initializeTestDriver = async () => {
  try {
    const testDriver = {
      name: 'Sachin Bisht',
      username: 'sachin',
      password: '123456',
      aadhaarNumber: '123456789012',
      licenseNumber: 'Dl8755671yu77',
      address: 'jawli Village, Loni',
      vehicleNumber: 'UP14EN7476',
      phoneNumber: '9876543210',
    };

    console.log('Checking if test driver exists in Supabase...');
    
    // Check if driver already exists in Supabase
    const { data: existingDriver, error: checkError } = await supabase
      .from('drivers')
      .select('id')
      .eq('username', testDriver.username)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the "not found" error
      console.error('Error checking for test driver:', checkError);
      return false;
    }
    
    if (existingDriver) {
      console.log('Test driver already exists in Supabase');
      return true;
    }
    
    console.log('Test driver not found. Creating in Supabase...');
    
    try {
      await adminService.createDriver(testDriver);
      console.log('Test driver created successfully in Supabase');
      return true;
    } catch (error) {
      console.error('Failed to create test driver in Supabase:', error);
      
      // Fallback to localStorage if Supabase fails
      console.log('Checking localStorage fallback...');
      const storedDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
      const driverExists = storedDrivers.some((driver: any) => driver.username === testDriver.username);
      
      if (!driverExists) {
        console.log('Creating test driver in localStorage...');
        storedDrivers.push({
          id: Date.now().toString(),
          name: testDriver.name,
          username: testDriver.username,
          email: `${testDriver.username}@example.com`,
          is_available: true,
          phoneNumber: testDriver.phoneNumber,
          licenseNumber: testDriver.licenseNumber,
          aadhaarNumber: testDriver.aadhaarNumber,
          address: testDriver.address,
          vehicleNumber: testDriver.vehicleNumber,
        });
        
        localStorage.setItem('drivers', JSON.stringify(storedDrivers));
        
        // Store credentials for login
        const driverCredentials = JSON.parse(localStorage.getItem('driverCredentials') || '{}');
        driverCredentials[testDriver.username] = {
          password: testDriver.password,
          driverId: storedDrivers[storedDrivers.length - 1].id
        };
        localStorage.setItem('driverCredentials', JSON.stringify(driverCredentials));
        
        console.log('Test driver created successfully in localStorage');
      } else {
        console.log('Test driver already exists in localStorage');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing test driver:', error);
    return false;
  }
};

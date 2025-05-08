
import { supabase } from "@/integrations/supabase/client";

// Sample test driver data
const TEST_DRIVER = {
  name: "Test Driver",
  username: "driver1",
  password: "password",
  is_available: true,
  phone_number: "1234567890",
  license_number: "LICX12345",
  vehicle_number: "VEH2023"
};

// Function to initialize a test driver for demonstration purposes
export const initializeTestDriver = async () => {
  console.info("Checking if test driver exists in Supabase...");
  
  try {
    // Check if the test driver already exists (by username)
    const { data: existingDriver, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('username', TEST_DRIVER.username)
      .maybeSingle();
    
    // If driver already exists, nothing to do
    if (existingDriver) {
      console.info("Test driver already exists in Supabase.");
      return;
    }
    
    console.info("Test driver not found. Creating in Supabase...");
    
    // Insert the driver into the drivers table
    const { data: newDriver, error: driverError } = await supabase
      .from('drivers')
      .insert([{
        name: TEST_DRIVER.name,
        username: TEST_DRIVER.username,
        is_available: TEST_DRIVER.is_available,
        phone_number: TEST_DRIVER.phone_number,
        license_number: TEST_DRIVER.license_number,
        vehicle_number: TEST_DRIVER.vehicle_number
      }])
      .select();
    
    if (driverError || !newDriver || newDriver.length === 0) {
      throw new Error(driverError?.message || "Failed to create driver");
    }
    
    // Insert the credentials
    const { error: credError } = await supabase
      .from('driver_credentials')
      .insert([{
        driver_id: newDriver[0].id,
        password: TEST_DRIVER.password
      }]);
    
    if (credError) {
      throw new Error(credError.message);
    }
    
    console.info("Successfully created test driver in Supabase!");
  } catch (error) {
    console.error("Failed to create test driver in Supabase:", error);
    
    // Fallback to localStorage if Supabase fails
    console.info("Checking localStorage fallback...");
    const driversJson = localStorage.getItem('drivers');
    const drivers = driversJson ? JSON.parse(driversJson) : [];
    
    const existingLocalDriver = drivers.find((d: any) => d.username === TEST_DRIVER.username);
    
    if (!existingLocalDriver) {
      const newLocalDriver = {
        ...TEST_DRIVER,
        id: `d${Date.now()}`,
        created_at: new Date().toISOString()
      };
      drivers.push(newLocalDriver);
      localStorage.setItem('drivers', JSON.stringify(drivers));
      console.info("Created test driver in localStorage.");
    } else {
      console.info("Test driver already exists in localStorage");
    }
  }
};

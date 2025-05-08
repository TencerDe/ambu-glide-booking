
import { supabase } from "@/integrations/supabase/client";
import { adminService } from "./adminService";

// Sample test driver data
const TEST_DRIVER = {
  name: "Test Driver",
  username: "driver1",
  password: "password",
  is_available: true,
  phoneNumber: "1234567890",
  licenseNumber: "LICX12345",
  vehicleNumber: "VEH2023"
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
    
    // Use the adminService to add the driver
    await adminService.addDriver({
      name: TEST_DRIVER.name,
      username: TEST_DRIVER.username,
      is_available: TEST_DRIVER.is_available,
      phoneNumber: TEST_DRIVER.phoneNumber,
      licenseNumber: TEST_DRIVER.licenseNumber,
      vehicleNumber: TEST_DRIVER.vehicleNumber,
      password: TEST_DRIVER.password
    });
    
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

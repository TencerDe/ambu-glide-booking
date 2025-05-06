
import { adminService } from './adminService';

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
      phoneNumber: '9876543210', // Added a default phone number
    };

    console.log('Initializing test driver:', testDriver);
    
    // Check if driver already exists in localStorage
    const storedDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    const driverExists = storedDrivers.some((driver: any) => driver.username === testDriver.username);
    
    if (!driverExists) {
      console.log('Creating test driver...');
      await adminService.createDriver(testDriver);
      console.log('Test driver created successfully');
    } else {
      console.log('Test driver already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing test driver:', error);
    return false;
  }
};


import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/adminService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import DriverManagement from '@/components/admin/DriverManagement';
import RideRequests from '@/components/admin/RideRequests';

// Define proper interfaces for the data
interface RideRequest {
  id: string;
  name: string;
  address: string;
  ambulanceType: string;
  vehicleType: string;
  status: string;
  createdAt: string;
  driver?: {
    id: string;
    name: string;
  };
}

interface Driver {
  id: string;
  name: string;
  username: string;
  is_available: boolean;
  phoneNumber?: string;
  licenseNumber?: string;
  aadhaarNumber?: string;
  address?: string;
  vehicleNumber?: string;
}

const AdminDashboard = () => {
  const [rides, setRides] = useState<RideRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { logout } = useAuth();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const ridesResponse = await adminService.viewRides();
      
      // Make sure we're mapping the API response to our RideRequest type
      if (Array.isArray(ridesResponse.data)) {
        const formattedRides = ridesResponse.data.map((item: any) => ({
          id: item.id || '',
          name: item.name || '',
          address: item.address || '',
          ambulanceType: item.ambulance_type || '',
          vehicleType: item.vehicle_type || '',
          status: item.status || '',
          createdAt: item.created_at || '',
          driver: item.driver ? {
            id: item.driver.id || '',
            name: item.driver.name || ''
          } : undefined
        }));
        setRides(formattedRides);
      }
      
      try {
        const driversResponse = await adminService.viewDrivers();
        setDrivers(driversResponse.data);
      } catch (driverError) {
        console.error('Error fetching drivers:', driverError);
        toast.error('Failed to load driver data');
        setDrivers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminService.logout();
    logout();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-24 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <Button 
                variant="outline" 
                className="flex items-center gap-2" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
            
            <DriverManagement 
              drivers={drivers} 
              loading={loading} 
              onDriversChanged={fetchData} 
            />
            
            <div className="mt-12">
              <RideRequests rides={rides} loading={loading} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;

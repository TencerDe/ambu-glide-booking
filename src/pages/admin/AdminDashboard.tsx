
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminService } from '@/services/adminService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Calendar, Clock, MapPin, Phone, Car, FileText, IdCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useForm } from 'react-hook-form';

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

interface DriverFormData {
  name: string;
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  aadhaarNumber: string;
  licenseNumber: string;
  address: string;
  vehicleNumber: string;
}

const AdminDashboard = () => {
  const [rides, setRides] = useState<RideRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { logout } = useAuth();
  
  const [newDriver, setNewDriver] = useState<DriverFormData>({
    name: '',
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    aadhaarNumber: '',
    licenseNumber: '',
    address: '',
    vehicleNumber: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ridesResponse = await adminService.viewRides();
        setRides(ridesResponse.data);
        
        try {
          // Try to fetch real drivers data
          const driversResponse = await adminService.viewDrivers();
          setDrivers(driversResponse.data);
        } catch (driverError) {
          console.error('Error fetching drivers:', driverError);
          // Fallback to dummy data if API fails
          setDrivers([
            { 
              id: '1', 
              name: 'John Driver', 
              username: 'john_driver', 
              is_available: true,
              phoneNumber: '9876543210',
              licenseNumber: 'DL12345678',
              aadhaarNumber: '123456789012',
              address: '123 Driver St, City',
              vehicleNumber: 'MH01AB1234'
            },
            { 
              id: '2', 
              name: 'Sarah Driver', 
              username: 'sarah_driver', 
              is_available: false,
              phoneNumber: '9876543211',
              licenseNumber: 'DL87654321',
              aadhaarNumber: '987654321098',
              address: '456 Driver Ave, Town',
              vehicleNumber: 'MH02CD5678'
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDriverInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // For Aadhaar number, only allow numerical input
    if (name === 'aadhaarNumber' && !/^\d*$/.test(value)) {
      return;
    }
    
    setNewDriver({
      ...newDriver,
      [name]: value,
    });
  };

  const handleCreateDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newDriver.name || !newDriver.username || !newDriver.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validation for Aadhaar number (12 digits)
    if (newDriver.aadhaarNumber && newDriver.aadhaarNumber.length !== 12) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return;
    }
    
    try {
      setIsSubmittingDriver(true);
      console.log('Submitting driver data:', newDriver);
      const response = await adminService.createDriver(newDriver);
      console.log('Create driver response:', response);
      toast.success('Driver created successfully');
      setDialogOpen(false);
      
      // Reset form
      setNewDriver({
        name: '',
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
        aadhaarNumber: '',
        licenseNumber: '',
        address: '',
        vehicleNumber: ''
      });
      
      // Refresh the drivers list
      try {
        const driversResponse = await adminService.viewDrivers();
        setDrivers(driversResponse.data);
      } catch (driverError) {
        console.error('Error fetching updated drivers:', driverError);
      }
      
    } catch (error: any) {
      console.error('Error creating driver:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.response?.data?.error ||
                         'Failed to create driver';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingDriver(false);
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
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Drivers</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-bg btn-animate">Add New Driver</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Create Driver Account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateDriver} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={newDriver.name}
                          onChange={handleDriverInputChange}
                          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username *
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={newDriver.username}
                            onChange={handleDriverInputChange}
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password *
                          </label>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={newDriver.password}
                            onChange={handleDriverInputChange}
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={newDriver.email}
                            onChange={handleDriverInputChange}
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={newDriver.phoneNumber}
                            onChange={handleDriverInputChange}
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700">
                            Aadhaar Number * (12 digits)
                          </label>
                          <input
                            type="text"
                            id="aadhaarNumber"
                            name="aadhaarNumber"
                            value={newDriver.aadhaarNumber}
                            onChange={handleDriverInputChange}
                            maxLength={12}
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                            License Number *
                          </label>
                          <input
                            type="text"
                            id="licenseNumber"
                            name="licenseNumber"
                            value={newDriver.licenseNumber}
                            onChange={handleDriverInputChange}
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Address *
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          value={newDriver.address}
                          onChange={handleDriverInputChange}
                          rows={3}
                          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        ></textarea>
                      </div>
                      
                      <div>
                        <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                          Vehicle Number *
                        </label>
                        <input
                          type="text"
                          id="vehicleNumber"
                          name="vehicleNumber"
                          value={newDriver.vehicleNumber}
                          onChange={handleDriverInputChange}
                          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          className="gradient-bg btn-animate"
                          disabled={isSubmittingDriver}
                        >
                          {isSubmittingDriver ? 'Creating...' : 'Create Driver'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : drivers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver Info</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                                <div className="text-xs text-gray-500">@{driver.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 mr-1" /> 
                              {driver.phoneNumber}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {driver.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-500">
                              <FileText className="h-4 w-4 mr-1" /> 
                              {driver.licenseNumber}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <IdCard className="h-4 w-4 mr-1" />
                              {driver.aadhaarNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-500">
                              <Car className="h-4 w-4 mr-1" /> 
                              {driver.vehicleNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              driver.is_available 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {driver.is_available ? 'Available' : 'Unavailable'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="mr-2">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-50">
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No drivers registered yet.</p>
                </div>
              )}
            </div>
            
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Ride Requests</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : rides.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Ambulance Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Driver</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rides.map((ride) => (
                        <TableRow key={ride.id}>
                          <TableCell className="text-sm text-gray-500">
                            {ride.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900">{ride.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {ride.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(ride.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(ride.createdAt).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {ride.ambulanceType}<br />
                            <span className="text-xs">{ride.vehicleType}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ride.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : ride.status === 'accepted'
                                ? 'bg-blue-100 text-blue-800'
                                : ride.status === 'en route'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {ride.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {ride.driver ? ride.driver.name : 'Unassigned'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No ride requests found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;


import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminService } from '@/services/adminService';
import { User, Phone, FileText, IdCard, Car } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

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

interface DriverManagementProps {
  drivers: Driver[];
  loading: boolean;
  onDriversChanged: () => void;
}

const DriverManagement: React.FC<DriverManagementProps> = ({ drivers, loading, onDriversChanged }) => {
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  
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
  
  const [editDriver, setEditDriver] = useState<Partial<Driver>>({});

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
  
  const handleEditDriverInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setEditDriver({
      ...editDriver,
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
      onDriversChanged();
      
    } catch (error: any) {
      console.error('Error creating driver:', error);
      const errorMessage = error.message || 'Failed to create driver';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingDriver(false);
    }
  };
  
  const handleUpdateDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentDriver || !editDriver) {
      toast.error('No driver selected for updating');
      return;
    }
    
    try {
      setIsSubmittingDriver(true);
      console.log('Updating driver data:', editDriver);
      await adminService.updateDriver(currentDriver.id, editDriver);
      toast.success('Driver updated successfully');
      setEditDialogOpen(false);
      
      // Reset form
      setEditDriver({});
      setCurrentDriver(null);
      
      // Refresh the drivers list
      onDriversChanged();
      
    } catch (error: any) {
      console.error('Error updating driver:', error);
      const errorMessage = error.message || 'Failed to update driver';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingDriver(false);
    }
  };
  
  const handleDeleteDriver = async (driverId: string) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) {
      return;
    }
    
    try {
      console.log('Deleting driver:', driverId);
      await adminService.deleteDriver(driverId);
      toast.success('Driver deleted successfully');
      
      // Refresh the drivers list
      onDriversChanged();
      
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      const errorMessage = error.message || 'Failed to delete driver';
      toast.error(errorMessage);
    }
  };
  
  const openEditDialog = (driver: Driver) => {
    setCurrentDriver(driver);
    setEditDriver({
      name: driver.name,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      address: driver.address,
      vehicleNumber: driver.vehicleNumber,
      is_available: driver.is_available
    });
    setEditDialogOpen(true);
  };

  return (
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => openEditDialog(driver)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 border-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteDriver(driver.id)}
                    >
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Driver: {currentDriver?.name}</DialogTitle>
          </DialogHeader>
          {currentDriver && (
            <form onSubmit={handleUpdateDriver} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editDriver.name || ''}
                  onChange={handleEditDriverInputChange}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit-phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="edit-phoneNumber"
                  name="phoneNumber"
                  value={editDriver.phoneNumber || ''}
                  onChange={handleEditDriverInputChange}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="edit-licenseNumber" className="block text-sm font-medium text-gray-700">
                  License Number
                </label>
                <input
                  type="text"
                  id="edit-licenseNumber"
                  name="licenseNumber"
                  value={editDriver.licenseNumber || ''}
                  onChange={handleEditDriverInputChange}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="edit-vehicleNumber" className="block text-sm font-medium text-gray-700">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  id="edit-vehicleNumber"
                  name="vehicleNumber"
                  value={editDriver.vehicleNumber || ''}
                  onChange={handleEditDriverInputChange}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="edit-address"
                  name="address"
                  value={editDriver.address || ''}
                  onChange={handleEditDriverInputChange}
                  rows={3}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-is_available"
                  name="is_available"
                  checked={editDriver.is_available ?? currentDriver.is_available}
                  onChange={(e) => setEditDriver({...editDriver, is_available: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-is_available" className="ml-2 block text-sm text-gray-900">
                  Available for rides
                </label>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="gradient-bg btn-animate"
                  disabled={isSubmittingDriver}
                >
                  {isSubmittingDriver ? 'Updating...' : 'Update Driver'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverManagement;

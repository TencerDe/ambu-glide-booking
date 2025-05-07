
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, PencilIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { adminService } from '@/services/adminService';

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
  password?: string; // Added for form handling
}

interface DriverManagementProps {
  drivers: Driver[];
  loading: boolean;
  onDriversChanged: () => void;
}

const DriverManagement: React.FC<DriverManagementProps> = ({ 
  drivers, 
  loading, 
  onDriversChanged 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<Driver>({
    id: '',
    name: '',
    username: '',
    is_available: true,
    phoneNumber: '',
    licenseNumber: '',
    aadhaarNumber: '',
    address: '',
    vehicleNumber: '',
    password: '', // Added password field
  });

  const resetFormData = () => {
    setFormData({
      id: '',
      name: '',
      username: '',
      is_available: true,
      phoneNumber: '',
      licenseNumber: '',
      aadhaarNumber: '',
      address: '',
      vehicleNumber: '',
      password: '', // Reset password too
    });
  };

  const handleAddDriver = () => {
    setCurrentDriver(null);
    resetFormData();
    setIsDialogOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setCurrentDriver(driver);
    setFormData({
      ...driver,
      password: '', // Don't prefill password on edit
    });
    setIsDialogOpen(true);
  };

  const handleDeletePrompt = (driver: Driver) => {
    setDriverToDelete(driver);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox for is_available
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.name || !formData.username) {
        toast.error('Name and username are required');
        return;
      }
      
      // For new driver, password is required
      if (!currentDriver && !formData.password) {
        toast.error('Password is required for new drivers');
        return;
      }
      
      if (currentDriver) {
        // Update existing driver
        await adminService.updateDriver({
          ...formData,
          id: currentDriver.id
        });
        toast.success('Driver updated successfully');
      } else {
        // Add new driver
        await adminService.addDriver(formData);
        toast.success('Driver added successfully');
      }
      
      setIsDialogOpen(false);
      onDriversChanged();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error('Failed to save driver');
    }
  };

  const handleDelete = async () => {
    if (!driverToDelete) return;
    
    try {
      await adminService.deleteDriver(driverToDelete.id);
      toast.success('Driver deleted successfully');
      setIsDeleteDialogOpen(false);
      onDriversChanged();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Failed to delete driver');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Driver Management</h2>
        <Button onClick={handleAddDriver} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add Driver
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : drivers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">License Number</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{driver.name}</td>
                  <td className="px-4 py-3">{driver.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      driver.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {driver.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{driver.phoneNumber || '-'}</td>
                  <td className="px-4 py-3">{driver.licenseNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 mr-1"
                      onClick={() => handleEditDriver(driver)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => handleDeletePrompt(driver)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No drivers found. Add your first driver using the button above.</p>
        </div>
      )}
      
      {/* Add/Edit Driver Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
            <DialogDescription>
              {currentDriver 
                ? 'Update the driver information below'
                : 'Fill in the details to add a new driver'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username *
                </label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {/* Password field - always show for new drivers, optional for edits */}
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password {currentDriver ? '(Leave blank to keep current)' : '*'}
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!currentDriver}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="licenseNumber" className="text-sm font-medium">
                  License Number
                </label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="aadhaarNumber" className="text-sm font-medium">
                  Aadhaar Number
                </label>
                <Input
                  id="aadhaarNumber"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="vehicleNumber" className="text-sm font-medium">
                  Vehicle Number
                </label>
                <Input
                  id="vehicleNumber"
                  name="vehicleNumber"
                  value={formData.vehicleNumber || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="is_available" className="text-sm font-medium">
                  Available for duty
                </label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentDriver ? 'Update' : 'Add'} Driver
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the driver "{driverToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverManagement;

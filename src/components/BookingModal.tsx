
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { userService } from '@/services/userService';

interface BookingModalProps {
  onClose: () => void;
  onBookingSuccess: () => void;
  address: string;
}

interface FormData {
  name: string;
  address: string;
  age: string; // Keeping age as string in the form data
  ambulanceType: string;
  vehicleType: string;
  notes: string;
  hospital: string; // Added hospital field
}

// List of hospitals for selection
const HOSPITALS = [
  "Apollo Hospital",
  "AIIMS Hospital",
  "Max Healthcare",
  "Fortis Hospital",
  "Manipal Hospital",
  "Medanta Hospital",
  "Narayana Health",
  "Columbia Asia Hospital",
  "Other"
];

const BookingModal: React.FC<BookingModalProps> = ({ onClose, onBookingSuccess, address }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: address || '', // Initialize with the address from props
    age: '',
    ambulanceType: 'With Medical Assistance',
    vehicleType: 'Van',
    notes: '',
    hospital: '', // Initialize hospital field
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Update address when prop changes
  useEffect(() => {
    if (address) {
      setFormData(prevData => ({
        ...prevData,
        address
      }));
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.address || !formData.age || !formData.hospital) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const ageNumber = Number(formData.age);
    if (isNaN(ageNumber) || ageNumber <= 0) {
      toast.error('Age must be a valid number');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Ensure consistent location storage
      const locationString = localStorage.getItem('currentLocation');
      if (locationString) {
        try {
          const location = JSON.parse(locationString);
          // Store the location in both keys to ensure it's found
          const locationData = {
            lat: location.lat,
            lng: location.lng
          };
          
          localStorage.setItem('userLocation', JSON.stringify(locationData));
          console.log('Stored location data before booking:', locationData);
        } catch (error) {
          console.warn('Failed to parse location from localStorage:', error);
        }
      } else {
        console.warn('No location data found in localStorage before booking');
      }
      
      // Convert age to number for the API call
      const response = await userService.bookRide({
        ...formData,
        age: ageNumber,
      });
      
      toast.success('Ambulance booked successfully! Your request has been submitted.');
      
      // Call the onBookingSuccess callback to update the parent component
      onBookingSuccess();
    } catch (error: any) {
      console.error('Error booking ambulance:', error);
      toast.error(error.message || 'Failed to book ambulance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Book an Ambulance</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age *
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          {/* Added Hospital Selection */}
          <div>
            <label htmlFor="hospital" className="block text-sm font-medium text-gray-700">
              Hospital *
            </label>
            <select
              id="hospital"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="" disabled>Select a hospital</option>
              {HOSPITALS.map((hospital) => (
                <option key={hospital} value={hospital}>
                  {hospital}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Fixed charge of ₹5,000 for ambulance service
            </p>
          </div>
          
          <div>
            <label htmlFor="ambulanceType" className="block text-sm font-medium text-gray-700">
              Ambulance Type *
            </label>
            <select
              id="ambulanceType"
              name="ambulanceType"
              value={formData.ambulanceType}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="With Medical Assistance">With Medical Assistance</option>
              <option value="Without Medical Assistance">Without Medical Assistance</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
              Vehicle Type *
            </label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Van">Van</option>
              <option value="Mini Bus">Mini Bus</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 gradient-bg text-white btn-animate"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Booking...' : 'Book Now (₹5,000)'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

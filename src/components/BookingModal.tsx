
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService } from '@/services/userService';

interface BookingModalProps {
  onClose: () => void;
  onBookingSuccess: (rideId: string) => void;
  address: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ onClose, onBookingSuccess, address }) => {
  const [name, setName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [ambulanceType, setAmbulanceType] = useState('Basic');
  const [vehicleType, setVehicleType] = useState('Regular');
  const [hospital, setHospital] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!patientAge.trim() || isNaN(parseInt(patientAge))) {
      toast.error('Please enter a valid age');
      return;
    }
    
    try {
      setLoading(true);
      
      // Ensure location data is properly saved in localStorage
      const locationData = localStorage.getItem('currentLocation');
      if (locationData) {
        // Also save under 'userLocation' key for redundancy
        localStorage.setItem('userLocation', locationData);
      }
      
      const bookingData = {
        name,
        address,
        age: parseInt(patientAge),
        ambulanceType,
        vehicleType,
        notes: notes.trim() || undefined,
        hospital: hospital.trim() || undefined
      };
      
      const response = await userService.bookRide(bookingData);
      
      toast.success('Ambulance booking request sent!');
      
      // Pass the ride ID to the parent component
      if (response.data && response.data.id) {
        onBookingSuccess(response.data.id);
      } else {
        toast.error('No ride ID returned from server');
        onClose();
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to book ambulance');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Book Ambulance</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Patient Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter patient name" 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="age">Patient Age</Label>
            <Input 
              id="age" 
              value={patientAge} 
              onChange={(e) => setPatientAge(e.target.value)} 
              placeholder="Enter age" 
              type="number" 
              min="0"
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="address">Pick-up Address</Label>
            <Textarea 
              id="address" 
              value={address} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>
          
          <div>
            <Label htmlFor="ambulanceType">Ambulance Type</Label>
            <Select value={ambulanceType} onValueChange={setAmbulanceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select ambulance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Advanced">Advanced Life Support</SelectItem>
                <SelectItem value="ICU">Mobile ICU</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Medium">Medium Capacity</SelectItem>
                <SelectItem value="Large">Large Capacity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="hospital">Hospital (Optional)</Label>
            <Input 
              id="hospital" 
              value={hospital} 
              onChange={(e) => setHospital(e.target.value)} 
              placeholder="Preferred hospital name" 
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Any special instructions or medical information" 
            />
          </div>
          
          <div className="flex gap-4 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-1/2" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-1/2 gradient-bg btn-animate"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Booking...
                </span>
              ) : 'Request Ambulance'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

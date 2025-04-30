
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface FormData {
  name: string;
  address: string;
  age: string; // Keeping age as string in the form data
  ambulanceType: string;
  vehicleType: string;
  notes: string;
}

const initialFormData: FormData = {
  name: '',
  address: '',
  age: '',
  ambulanceType: 'With Medical Assistance',
  vehicleType: 'Van',
  notes: '',
};

const BookingModal = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.address || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const ageNumber = Number(formData.age);
    if (isNaN(ageNumber) || ageNumber <= 0) {
      toast.error('Age must be a valid number');
      return;
    }
    
    // In a real app, this would send data to the backend
    // For now, we'll just log and show a success message
    console.log('Booking data:', formData);
    toast.success('Ambulance booked successfully!');
    
    // Close modal and reset form
    const modal = document.getElementById('booking-modal') as HTMLDialogElement;
    if (modal) modal.close();
    setFormData(initialFormData);
  };

  const closeModal = () => {
    const modal = document.getElementById('booking-modal') as HTMLDialogElement;
    if (modal) modal.close();
    setFormData(initialFormData);
  };

  return (
    <dialog id="booking-modal" className="modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Book an Ambulance</h2>
          <Button variant="ghost" size="icon" onClick={closeModal}>
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
              onClick={closeModal}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 gradient-bg text-white btn-animate"
            >
              Book Now
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default BookingModal;

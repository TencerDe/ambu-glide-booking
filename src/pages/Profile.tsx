
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { User, Calendar, MapPin, Phone, Mail, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

// Mock data for booking history
const bookingHistory = [
  {
    id: 'B001',
    date: '2025-04-28',
    time: '14:30',
    ambulanceType: 'With Medical Assistance',
    vehicleType: 'Van',
    status: 'Completed',
  },
  {
    id: 'B002',
    date: '2025-04-15',
    time: '09:45',
    ambulanceType: 'Without Medical Assistance',
    vehicleType: 'Mini Bus',
    status: 'Completed',
  },
];

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
  };

  const openBookingModal = () => {
    const modal = document.getElementById('booking-modal') as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-24 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Profile Card */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 gradient-bg">
                  <div className="flex justify-center">
                    {user.photoUrl ? (
                      <img 
                        src={user.photoUrl} 
                        alt={user.name} 
                        className="w-24 h-24 rounded-full border-4 border-white"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                        <User className="w-12 h-12 text-primary" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-center text-white mt-4">
                    {user.name}
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 pb-6">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Booking History */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Booking History
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Booking ID</th>
                        <th className="py-3 px-4 text-left">Date & Time</th>
                        <th className="py-3 px-4 text-left">Ambulance Type</th>
                        <th className="py-3 px-4 text-left">Vehicle Type</th>
                        <th className="py-3 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingHistory.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">{booking.id}</td>
                          <td className="py-4 px-4">{booking.date} at {booking.time}</td>
                          <td className="py-4 px-4">{booking.ambulanceType}</td>
                          <td className="py-4 px-4">{booking.vehicleType}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookingHistory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                            No booking history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button
                    className="gradient-bg btn-animate"
                    onClick={openBookingModal}
                  >
                    Book New Ambulance
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;

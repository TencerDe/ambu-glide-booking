
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { driverService } from '@/services/driverService';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bell, Clock, MapPin, Calendar, User, DollarSign, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface RideRequest {
  id: string;
  name: string;
  address: string;
  age: number;
  ambulance_type: string;
  vehicle_type: string;
  notes?: string;
  created_at: string;
  status: string;
  hospital: string;
  charge: number;
  latitude?: number;
  longitude?: number;
}

const DriverDashboard = () => {
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch initial ride requests and driver profile on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get driver profile
        const profileResponse = await driverService.getDriverProfile();
        setDriverProfile(profileResponse.data);
        
        // Get ride requests
        const rideResponse = await driverService.getRideRequests();
        setRideRequests(rideResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set up real-time subscription for ride requests
  useEffect(() => {
    // Subscribe to changes in the ride_requests table
    const channel = supabase
      .channel('ride-requests-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ride_requests',
          filter: 'status=eq.pending'
        }, 
        (payload) => {
          console.log('New ride request received:', payload);
          const newRide = payload.new as RideRequest;
          
          // Add the new ride request to the state
          setRideRequests(current => [newRide, ...current]);
          
          // Show notification
          toast.info('New ride request received!', {
            description: `From: ${newRide.address}`
          });
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ride_requests'
        },
        (payload) => {
          console.log('Ride request updated:', payload);
          const updatedRide = payload.new as RideRequest;
          
          // If the ride was accepted by another driver, remove it from the list
          if (updatedRide.status !== 'pending') {
            setRideRequests(current => 
              current.filter(ride => ride.id !== updatedRide.id)
            );
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check if user is authenticated as driver
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'driver') {
      navigate('/driver/login');
    }
  }, [navigate]);

  const handleAcceptRide = async (rideId: string) => {
    try {
      await driverService.acceptRide(rideId);
      
      // Update the local state
      setRideRequests(prev => prev.filter(ride => ride.id !== rideId));
      
      toast.success('Ride accepted successfully!');
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error('Failed to accept ride');
    }
  };

  const handleLogout = () => {
    driverService.logout();
    logout();
    navigate('/driver/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-24 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
                {driverProfile && (
                  <p className="text-gray-600">Welcome, {driverProfile.name}</p>
                )}
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
            
            {/* Driver Information */}
            {driverProfile && (
              <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold mb-3">Driver Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{driverProfile.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${driverProfile.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {driverProfile.is_available ? 'Available' : 'Busy'}
                    </p>
                  </div>
                  {driverProfile.phone_number && (
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{driverProfile.phone_number}</p>
                    </div>
                  )}
                  {driverProfile.license_number && (
                    <div>
                      <p className="text-sm text-gray-500">License Number</p>
                      <p className="font-medium">{driverProfile.license_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <h2 className="flex items-center text-xl font-semibold mb-4">
                <Bell className="mr-2 h-5 w-5" />
                New Ride Requests
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : rideRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rideRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-lg flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {request.name}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{request.address}</span>
                        </p>
                        <p className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          <span>Hospital: {request.hospital}</span>
                        </p>
                        <p className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </p>
                        <p className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{new Date(request.created_at).toLocaleTimeString()}</span>
                        </p>
                        <p className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span className="font-medium">₹{request.charge.toLocaleString()}</span>
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm mb-1">
                          <span className="font-medium">Ambulance Type:</span> {request.ambulance_type}
                        </p>
                        <p className="text-sm mb-1">
                          <span className="font-medium">Vehicle Type:</span> {request.vehicle_type}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Age:</span> {request.age}
                        </p>
                        {request.notes && (
                          <p className="text-sm mt-2">
                            <span className="font-medium">Notes:</span> {request.notes}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        className="w-full mt-4 gradient-bg btn-animate"
                        onClick={() => handleAcceptRide(request.id)}
                      >
                        Accept Ride (₹{request.charge.toLocaleString()})
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No new ride requests available at the moment.</p>
                  <p className="text-gray-500 text-sm mt-2">New requests will appear here automatically.</p>
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

export default DriverDashboard;

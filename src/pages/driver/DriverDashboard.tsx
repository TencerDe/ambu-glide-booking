
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { driverService } from '@/services/driverService';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bell, Clock, MapPin, Calendar, User, DollarSign, Building, Check, X, Navigation } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { driverNotificationsSocket, useWebSocket } from '@/services/websocketService';

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

const MAX_ACCEPT_ATTEMPTS = 5;

const DriverDashboard = () => {
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [acceptingRide, setAcceptingRide] = useState<string | null>(null);
  const [acceptAttempts, setAcceptAttempts] = useState<{[key: string]: number}>({});
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [currentRide, setCurrentRide] = useState<any>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const driverId = localStorage.getItem('driverId');

  // Fetch initial ride requests and driver profile on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get driver profile
        const profileResponse = await driverService.getDriverProfile();
        setDriverProfile(profileResponse.data);
        
        // Check for current active ride
        const currentRideResponse = await driverService.getCurrentRide();
        if (currentRideResponse.data) {
          setCurrentRide(currentRideResponse.data);
        }
        
        // Only get ride requests if driver doesn't have an active ride
        if (!currentRideResponse.data) {
          const rideResponse = await driverService.getRideRequests();
          setRideRequests(rideResponse.data);
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

  // Handle WebSocket messages for driver notifications
  const handleDriverMessage = useCallback((data: any) => {
    console.log('Driver notification received:', data);
    
    if (data.type === 'new_ride_request' && data.ride && !currentRide) {
      // Add the new ride request to the top of the list
      setRideRequests(current => {
        // Check if this ride is already in the list
        const exists = current.some(ride => ride.id === data.ride.id);
        if (exists) return current;
        return [data.ride, ...current];
      });
      
      // Show notification
      toast.info('New ride request received!', {
        description: `From: ${data.ride.address}`
      });
    }
  }, [currentRide]);
  
  // Use WebSocket hook for driver notifications
  const { sendMessage, isConnected, connect } = useWebSocket(
    driverNotificationsSocket,
    handleDriverMessage,
    (status) => {
      console.log('WebSocket status:', status);
      // Reconnect on disconnection
      if (status === 'disconnected' && driverId) {
        setTimeout(() => connect(driverId), 2000);
      }
    },
    driverId || undefined
  );

  // Set up real-time subscription for ride requests
  useEffect(() => {
    // Don't subscribe if driver has a current ride
    if (currentRide) return;
    
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
          
          // Only add to list if driver doesn't have a current ride
          if (!currentRide) {
            // Add the new ride request to the state
            setRideRequests(current => {
              // Check if this ride is already in the list
              const exists = current.some(ride => ride.id === newRide.id);
              if (exists) return current;
              return [newRide, ...current];
            });
            
            // Show notification
            toast.info('New ride request received!', {
              description: `From: ${newRide.address}`
            });
          }
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
          
          // If this is driver's current ride and it was updated
          if (currentRide && currentRide.id === updatedRide.id) {
            setCurrentRide(updatedRide);
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription on component unmount or when current ride changes
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRide]);

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
      setAcceptingRide(rideId); // Set the ID of the ride being accepted
      
      // Track number of attempts for this specific ride
      const currentAttempts = acceptAttempts[rideId] || 0;
      setAcceptAttempts(prev => ({
        ...prev,
        [rideId]: currentAttempts + 1
      }));
      
      // Display toast message showing attempt
      if (currentAttempts > 0) {
        toast.info(`Attempting to accept ride (Attempt ${currentAttempts + 1})...`);
      } else {
        toast.info('Accepting ride...');
      }
      
      // Send a status update via WebSocket before accepting
      sendMessage({
        type: 'status_update',
        status: 'BUSY'
      });
      
      // Wait a short time for WebSocket message to go through
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Now try to accept the ride
      const response = await driverService.acceptRide(rideId);
      console.log('Accept ride response:', response);
      
      // Update the local state - remove all pending rides and set current ride
      setRideRequests([]);
      setCurrentRide(response.data.ride);
      
      // Update driver profile to reflect busy status
      if (driverProfile) {
        setDriverProfile({
          ...driverProfile,
          is_available: false
        });
      }
      
      toast.success('Ride accepted successfully!');
      
      // Reset attempt counter for this ride
      setAcceptAttempts(prev => ({
        ...prev,
        [rideId]: 0
      }));
      
      setAcceptingRide(null);
    } catch (error: any) {
      console.error('Error accepting ride:', error);
      
      const attempts = acceptAttempts[rideId] || 0;
      
      if (attempts < MAX_ACCEPT_ATTEMPTS - 1) {
        toast.error(`Failed to accept ride: ${error.message}. Retrying...`);
        
        // Automatically retry after a short delay
        setTimeout(() => {
          if (acceptingRide === rideId) { // Only retry if the user hasn't clicked to accept another ride
            handleAcceptRide(rideId);
          }
        }, 1000 + (attempts * 500)); // Increasing delay with each retry
      } else {
        toast.error(`Failed to accept ride after multiple attempts: ${error.message}`);
        
        // Reset accepting state and attempts after max retries
        setAcceptAttempts(prev => ({
          ...prev,
          [rideId]: 0
        }));
        setAcceptingRide(null);
        
        // Trigger a refresh of the ride requests
        const refreshRides = async () => {
          try {
            const rideResponse = await driverService.getRideRequests();
            setRideRequests(rideResponse.data);
          } catch (refreshError) {
            console.error('Error refreshing ride requests:', refreshError);
          }
        };
        
        refreshRides();
      }
    }
  };
  
  const handleUpdateRideStatus = async (status: string) => {
    if (!currentRide) return;
    
    try {
      // Get current position for location updates
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude };
            
            const response = await driverService.updateRideStatus(currentRide.id, status, location);
            
            if (status === 'en_route') {
              toast.success('Status updated: On the way to pickup');
            } else if (status === 'picked_up') {
              toast.success('Status updated: Patient picked up');
            } else if (status === 'completed') {
              toast.success('Ride completed successfully!');
              // Clear current ride and fetch new requests
              setCurrentRide(null);
              const rideResponse = await driverService.getRideRequests();
              setRideRequests(rideResponse.data);
            }
            
            // Update current ride state if not completed
            if (status !== 'completed') {
              setCurrentRide({
                ...currentRide,
                status,
                driver_latitude: latitude,
                driver_longitude: longitude
              });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            toast.error('Failed to get your current location');
          }
        );
      } else {
        // If geolocation is not available, update without location
        const response = await driverService.updateRideStatus(currentRide.id, status);
        
        if (status === 'completed') {
          toast.success('Ride completed successfully!');
          // Clear current ride and fetch new requests
          setCurrentRide(null);
          const rideResponse = await driverService.getRideRequests();
          setRideRequests(rideResponse.data);
        } else {
          // Update current ride state
          setCurrentRide({
            ...currentRide,
            status
          });
        }
      }
    } catch (error: any) {
      console.error('Error updating ride status:', error);
      toast.error(error.message || 'Failed to update ride status');
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
                
                {!isConnected && (
                  <div className="mt-4 p-2 bg-amber-50 text-amber-700 rounded-md text-sm flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    <span>Using offline mode. Some features might be delayed.</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Current Ride (if any) */}
            {currentRide && (
              <div className="mb-8">
                <h2 className="flex items-center text-xl font-semibold mb-4">
                  <Bell className="mr-2 h-5 w-5" />
                  Current Ride
                </h2>
                
                <div className="border rounded-lg p-5 shadow-sm bg-blue-50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-lg flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {currentRide.name}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {currentRide.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{currentRide.address}</span>
                    </p>
                    {currentRide.hospital && (
                      <p className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        <span>Hospital: {currentRide.hospital}</span>
                      </p>
                    )}
                    <p className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="font-medium">₹{currentRide.charge?.toLocaleString()}</span>
                    </p>
                    
                    <div>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Ambulance Type:</span> {currentRide.ambulance_type}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Patient Age:</span> {currentRide.age}
                      </p>
                      {currentRide.notes && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Notes:</span> {currentRide.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {currentRide.status === 'accepted' && (
                      <Button
                        onClick={() => handleUpdateRideStatus('en_route')}
                        className="flex items-center gap-2 flex-grow"
                      >
                        <Navigation className="h-4 w-4" />
                        Start Journey
                      </Button>
                    )}
                    
                    {currentRide.status === 'en_route' && (
                      <Button
                        onClick={() => handleUpdateRideStatus('picked_up')}
                        className="flex items-center gap-2 flex-grow"
                      >
                        <Check className="h-4 w-4" />
                        Patient Picked Up
                      </Button>
                    )}
                    
                    {currentRide.status === 'picked_up' && (
                      <Button
                        onClick={() => handleUpdateRideStatus('completed')}
                        className="flex items-center gap-2 flex-grow"
                      >
                        <Check className="h-4 w-4" />
                        Complete Ride
                      </Button>
                    )}
                    
                    {/* Call button for all statuses */}
                    <Button
                      variant="outline"
                      onClick={() => window.open(`tel:${currentRide.phone || '911'}`)}
                      className="flex items-center gap-2"
                    >
                      Call Patient
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Ride Requests (only show if no current ride) */}
            {!currentRide && (
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
                          disabled={acceptingRide === request.id}
                        >
                          {acceptingRide === request.id ? (
                            <span className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Processing...
                            </span>
                          ) : (
                            `Accept Ride (₹${request.charge.toLocaleString()})`
                          )}
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
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DriverDashboard;

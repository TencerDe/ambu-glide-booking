
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { driverService } from '@/services/driverService';
import { driverNotificationsSocket, useWebSocket } from '@/services/websocketService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bell, Clock, MapPin, Calendar, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RideRequest {
  id: string;
  name: string;
  address: string;
  age: number;
  ambulanceType: string;
  vehicleType: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'en_route' | 'completed';
}

const DriverDashboard = () => {
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [socketStatus, setSocketStatus] = useState<string>('disconnected');
  const { logout } = useAuth();

  // Handle WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    if (message.type === 'new_ride_request') {
      toast.info('New ride request received!');
      
      // Add the new request to the state
      setRideRequests(prev => [message.ride_request, ...prev]);
    } else if (message.type === 'ride_accepted') {
      // Remove the accepted ride from the list for other drivers
      setRideRequests(prev => prev.filter(ride => ride.id !== message.ride_id));
      toast.info(`Ride #${message.ride_id.slice(0, 8)} has been accepted by another driver`);
    }
  };

  // Setup WebSocket connection
  useWebSocket(
    driverNotificationsSocket,
    handleWebSocketMessage,
    (status) => setSocketStatus(status)
  );

  // Fetch initial ride requests on component mount
  useEffect(() => {
    const fetchRideRequests = async () => {
      try {
        setLoading(true);
        const response = await driverService.getRideRequests();
        setRideRequests(response.data);
      } catch (error) {
        console.error('Error fetching ride requests:', error);
        toast.error('Failed to load ride requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRideRequests();
  }, []);

  const handleAcceptRide = async (rideId: string) => {
    try {
      await driverService.acceptRide(rideId);
      
      // Update the local state
      setRideRequests(prev => prev.filter(ride => ride.id !== rideId));
      
      toast.success('Ride accepted successfully!');
      
      // Notify WebSocket about the acceptance
      driverNotificationsSocket.sendMessage({
        type: 'accept_ride',
        ride_id: rideId
      });
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error('Failed to accept ride');
    }
  };

  const handleLogout = () => {
    driverService.logout();
    logout();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-24 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  socketStatus === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    socketStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {socketStatus === 'connected' ? 'Online' : 'Offline'}
                </span>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
            
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
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </p>
                        <p className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{new Date(request.createdAt).toLocaleTimeString()}</span>
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm mb-1">
                          <span className="font-medium">Ambulance Type:</span> {request.ambulanceType}
                        </p>
                        <p className="text-sm mb-1">
                          <span className="font-medium">Vehicle Type:</span> {request.vehicleType}
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
                        Accept Ride
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

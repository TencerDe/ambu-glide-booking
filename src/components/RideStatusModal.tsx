
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, PhoneCall, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { userRideSocket, useWebSocket } from '@/services/websocketService';
import { supabase } from '@/integrations/supabase/client';

interface RideStatusModalProps {
  onClose: () => void;
  rideId: string;
  initialStatus?: string;
}

const RideStatusModal: React.FC<RideStatusModalProps> = ({ 
  onClose, 
  rideId,
  initialStatus = 'pending' 
}) => {
  const [status, setStatus] = useState<string>(initialStatus);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState<boolean>(false);
  const userId = localStorage.getItem('userId');
  
  // Setup WebSocket connection for realtime updates
  const { isConnected } = useWebSocket(
    userRideSocket,
    (message) => {
      console.log('Received WebSocket message:', message);
      
      if (message.type === 'ride_status_update' && message.ride && message.ride.id === rideId) {
        console.log('Ride status update:', message.ride);
        
        // Update status if changed
        if (message.ride.status !== status) {
          const newStatus = message.ride.status;
          setStatus(newStatus);
          
          // Show toast notification
          if (newStatus === 'ACCEPTED') {
            toast.success('A driver has accepted your ride!');
          } else if (newStatus === 'EN_ROUTE') {
            toast.success('Your driver is on the way!');
          } else if (newStatus === 'PICKED_UP') {
            toast.success('You have been picked up!');
          }
        }
        
        // Fetch driver info if available and not already loaded
        if ((message.ride.status === 'ACCEPTED' || 
             message.ride.status === 'EN_ROUTE' || 
             message.ride.status === 'PICKED_UP') && 
            message.ride.driver && !driverInfo) {
          fetchDriverInfo(message.ride.driver.id);
        }
      }
    },
    (status) => {
      console.log('WebSocket connection status:', status);
      if (status === 'error' || status === 'disconnected') {
        // If WebSocket fails, fall back to polling
        console.log('WebSocket connection failed, falling back to polling');
      }
    },
    userId || undefined
  );
  
  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format elapsed time
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Function to check ride status via direct API call (fallback)
  const checkRideStatus = useCallback(async () => {
    if (!rideId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('id', rideId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        console.log('Ride status check result:', data);
        
        // Update status if changed
        if (data.status !== status) {
          console.log(`Ride status changed from ${status} to ${data.status}`);
          setStatus(data.status);
          
          // Show toast notification on status change
          if (data.status === 'accepted') {
            toast.success('A driver has accepted your ride!');
          } else if (data.status === 'en_route') {
            toast.success('Your driver is on the way!');
          } else if (data.status === 'picked_up') {
            toast.success('You have been picked up!');
          }
        }
        
        // Check if we need to fetch driver info
        if ((data.status === 'accepted' || data.status === 'en_route' || data.status === 'picked_up') && 
            data.driver_id && !driverInfo) {
          fetchDriverInfo(data.driver_id);
        }
      }
    } catch (error: any) {
      console.error('Error checking ride status:', error);
      setError('Failed to update ride status. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [rideId, status, driverInfo]);
  
  // Function to fetch driver information
  const fetchDriverInfo = async (driverId: string) => {
    console.log(`Fetching driver info for driver ID: ${driverId}`);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        console.log('Driver info received:', data);
        setDriverInfo(data);
        toast.success(`Your driver ${data.name} is on the way!`);
      }
    } catch (error) {
      console.error('Error fetching driver info:', error);
      // Don't set an error state here, as this is not critical
    }
  };
  
  // Function to cancel ride
  const handleCancel = async () => {
    if (status !== 'pending') {
      toast.error('Cannot cancel ride at this stage');
      return;
    }
    
    try {
      setIsLoading(true);
      toast.loading('Cancelling ride...', {
        id: 'cancel-ride'
      });
      
      const { error } = await supabase
        .from('ride_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', rideId);
      
      if (error) throw error;
      
      toast.dismiss('cancel-ride');
      toast.success('Ride cancelled successfully');
      setStatus('cancelled');
    } catch (error: any) {
      console.error('Error cancelling ride:', error);
      toast.dismiss('cancel-ride');
      toast.error('Failed to cancel ride. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    setForceRefresh(prev => !prev);
    checkRideStatus();
    toast.info('Refreshing ride status...');
  };
  
  // Initialize on mount
  useEffect(() => {
    // Check status immediately
    checkRideStatus();
  }, [checkRideStatus]);
  
  // Fallback to polling if WebSocket is not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        checkRideStatus();
      }, status === 'pending' ? 3000 : 5000); // More frequent when pending
      
      return () => clearInterval(interval);
    }
  }, [isConnected, checkRideStatus, status]);
  
  // Get descriptive status text
  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Waiting for a driver to accept your ride';
      case 'accepted':
        return 'A driver has accepted your ride and is on the way';
      case 'en_route':
        return 'Driver is on the way to pick you up';
      case 'picked_up':
        return 'You have been picked up';
      case 'completed':
        return 'Your ride has been completed';
      case 'cancelled':
        return 'This ride has been cancelled';
      default:
        return 'Unknown status';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Ride Status</h2>
        
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 mr-1 mt-0.5" />
              <div>
                <p>{error}</p>
                <p className="text-xs mt-1">Connection issue detected. We'll keep trying.</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh} 
              className="ml-2 mt-2 text-xs"
            >
              Retry Now
            </Button>
          </div>
        )}
        
        {!isConnected && status !== 'cancelled' && status !== 'completed' && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs rounded">
            <p className="flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Realtime updates unavailable - using fallback mode
            </p>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" /> Elapsed: {formatElapsedTime()}
            </span>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full 
              ${status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                status === 'accepted' ? 'bg-blue-100 text-blue-800' : 
                status === 'en_route' ? 'bg-purple-100 text-purple-800' : 
                status === 'cancelled' ? 'bg-red-100 text-red-800' :
                status === 'picked_up' ? 'bg-indigo-100 text-indigo-800' :
                'bg-green-100 text-green-800'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          <p className="text-sm text-center mb-3">{getStatusText()}</p>
          
          <div className="bg-gray-50 border rounded-lg p-4 mb-4">
            {status === 'pending' ? (
              <div className="flex flex-col items-center py-4">
                <div className="animate-pulse flex space-x-4 mb-4">
                  <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <p className="text-gray-600">Looking for a nearby driver...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few minutes</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualRefresh} 
                  className="mt-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Refreshing...' : 'Refresh Status'}
                </Button>
              </div>
            ) : status === 'cancelled' ? (
              <div className="text-center py-4">
                <p className="text-red-600 font-medium">This ride has been cancelled</p>
                <p className="text-sm text-gray-500 mt-1">You can request a new ride from the home page</p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Driver Information:</h3>
                {driverInfo ? (
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {driverInfo.name}</p>
                    {driverInfo.phone_number && (
                      <p><span className="font-medium">Phone:</span> {driverInfo.phone_number}</p>
                    )}
                    {driverInfo.vehicle_number && (
                      <p><span className="font-medium">Vehicle:</span> {driverInfo.vehicle_number}</p>
                    )}
                    <p className="text-green-600 mt-2">
                      {status === 'accepted' && "Driver is on the way to your location"}
                      {status === 'en_route' && "Driver is en route to pick you up"}
                      {status === 'picked_up' && "You have been picked up"}
                      {status === 'completed' && "Ride has been completed"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                    <p className="text-gray-600">Loading driver information...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between gap-4">
          {status === 'pending' && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Cancel Request'}
            </Button>
          )}
          
          {driverInfo?.phone_number && status !== 'pending' && status !== 'cancelled' && (
            <Button 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open(`tel:${driverInfo?.phone_number || '108'}`)}
            >
              <PhoneCall className="h-4 w-4" /> Contact Driver
            </Button>
          )}
          
          <Button
            variant={status === 'pending' ? 'default' : 'outline'}
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideStatusModal;

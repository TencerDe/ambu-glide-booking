import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Ambulance } from 'lucide-react';
import { toast } from 'sonner';
import { userRideSocket, useWebSocket } from '@/services/websocketService';

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
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollingInterval, setPollingInterval] = useState<number>(3000); // Start with 3 seconds
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Handle WebSocket messages for ride status updates
  const handleRideMessage = (data: any) => {
    console.log('Ride status update received via WebSocket:', data);
    try {
      if (data.type === 'ride_status_update' && data.ride?.id === rideId) {
        setStatus(data.ride.status);
        
        if (data.ride.status === 'accepted' && data.ride.driver) {
          setDriverInfo(data.ride.driver);
          toast.success('A driver has accepted your ride!');
        }
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };
  
  // Use WebSocket hook with more robust error handling
  const { sendMessage, isConnected } = useWebSocket(
    userRideSocket,
    handleRideMessage,
    (status) => {
      console.log('WebSocket status:', status);
      // If disconnected, increase polling frequency
      if (status === 'disconnected' || status === 'error') {
        setPollingInterval(1500); // Poll more frequently when WebSocket is down
      } else if (status === 'connected') {
        setPollingInterval(3000); // Back to normal when connected
        setRetryCount(0); // Reset retry count when connection is established
      }
    },
    localStorage.getItem('userId') || undefined
  );
  
  // Check ride status from database on component mount and periodically
  useEffect(() => {
    const checkRideStatus = async () => {
      try {
        console.log('Checking ride status for ride ID:', rideId);
        setIsPolling(true);
        
        const response = await fetch(
          `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?id=eq.${rideId}&select=*`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Ride status data received:', data);
        
        if (data && data.length > 0) {
          const rideData = data[0];
          console.log('Current status:', status, 'New status:', rideData.status);
          
          // Only update if status has changed
          if (rideData.status !== status) {
            setStatus(rideData.status);
            
            if (rideData.status === 'accepted' && rideData.driver_id) {
              console.log('Ride accepted, getting driver info');
              fetchDriverInfo(rideData.driver_id);
            }
          } else if (rideData.status === 'accepted' && !driverInfo && rideData.driver_id) {
            // If already accepted but no driver info, fetch it
            fetchDriverInfo(rideData.driver_id);
          }
        }
        
        // Reset retry count on successful API call
        setRetryCount(0);
      } catch (error) {
        console.error('Error in checkRideStatus:', error);
        // Increment retry count on failure
        setRetryCount(prev => prev + 1);
        
        // If too many failures in a row, show an error
        if (retryCount > 5) {
          toast.error('Having trouble connecting to the server. Please check your internet connection.');
        }
      } finally {
        setIsPolling(false);
      }
    };
    
    // Helper function to fetch driver info
    const fetchDriverInfo = async (driverId: string) => {
      try {
        console.log('Fetching driver info for driver ID:', driverId);
        const response = await fetch(
          `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/drivers?id=eq.${driverId}&select=*`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const driverData = await response.json();
        
        if (driverData && driverData.length > 0) {
          console.log('Driver info received:', driverData[0]);
          setDriverInfo(driverData[0]);
          toast.success('A driver has accepted your ride!');
        }
      } catch (error) {
        console.error('Error fetching driver info:', error);
      }
    };
    
    // Check status immediately
    checkRideStatus();
    
    // Dynamic polling based on connection state and whether we have a driver
    const interval = setInterval(checkRideStatus, 
      isConnected ? pollingInterval : Math.max(1000, pollingInterval / 2));
    
    return () => clearInterval(interval);
  }, [rideId, status, driverInfo, pollingInterval, isConnected, retryCount]);
  
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
  
  const handleCancel = () => {
    // Try WebSocket first, fallback to direct API call
    try {
      const cancelSuccessful = sendMessage({
        type: 'cancel_ride',
        ride_id: rideId
      });
      
      // If WebSocket failed, use direct API
      if (!cancelSuccessful) {
        console.log('WebSocket unavailable, cancelling ride via API...');
        cancelViaAPI();
      }
      
      toast.info('Ride cancellation requested');
      onClose();
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast.error('Failed to cancel ride. Please try again.');
      // Try the API anyway as a last resort
      cancelViaAPI();
    }
  };
  
  const cancelViaAPI = async () => {
    try {
      await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?id=eq.${rideId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: 'cancelled'
          })
        }
      );
      console.log('Ride cancelled via API');
    } catch (error) {
      console.error('Error cancelling ride via API:', error);
    }
  };
  
  // Connection status indicator component
  const ConnectionStatus = () => {
    if (isConnected) {
      return null; // Don't show anything when connected
    }
    
    return (
      <div className="text-amber-500 text-xs flex items-center mb-2">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
        Using backup connection
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Ride Status</h2>
        
        <ConnectionStatus />
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" /> Elapsed time: {formatElapsedTime()}
            </span>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full 
              ${status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                status === 'accepted' ? 'bg-blue-100 text-blue-800' : 
                status === 'en_route' ? 'bg-purple-100 text-purple-800' : 
                status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
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
                    <p className="text-green-600 mt-2">Driver is on the way to your location</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                    <p className="text-gray-600">Driver information loading...</p>
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
            >
              Cancel Request
            </Button>
          )}
          
          {driverInfo?.phone_number && status !== 'pending' && status !== 'cancelled' && (
            <Button 
              className="w-full"
              onClick={() => window.open(`tel:${driverInfo?.phone_number || '108'}`)}
            >
              Contact Driver
            </Button>
          )}
          
          <Button
            variant={status === 'pending' ? 'default' : 'outline'}
            className="w-full"
            onClick={onClose}
          >
            {status === 'pending' ? 'Close' : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideStatusModal;

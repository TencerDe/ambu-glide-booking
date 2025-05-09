
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Ambulance, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';

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
  const [lastChecked, setLastChecked] = useState<number>(Date.now());
  const [forceRefresh, setForceRefresh] = useState<boolean>(false);
  
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

  // Connect to WebSocket for real-time updates if available
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    // Try to connect to WebSocket
    try {
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}/ws/user/${userId}/ride-status/` 
        : `ws://localhost:8000/ws/user/${userId}/ride-status/`;
        
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('WebSocket connected for ride updates');
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'ride_status_update' && data.ride && data.ride.id === rideId) {
            console.log('Received WebSocket update for ride:', data.ride);
            
            // Update status if changed
            if (data.ride.status !== status) {
              setStatus(data.ride.status);
              
              // Show toast notification
              if (data.ride.status === 'accepted') {
                toast.success('A driver has accepted your ride!', { id: 'ride-accepted' });
              }
            }
            
            // Fetch driver info if needed
            if ((data.ride.status === 'accepted' || data.ride.status === 'en_route' || 
                data.ride.status === 'picked_up') && data.ride.driver_id && !driverInfo) {
              fetchDriverInfo(data.ride.driver_id);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Will fall back to polling
      };
      
      return () => {
        socket.close();
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      // Will fall back to polling
    }
  }, [rideId, status]);

  // Function to check ride status with improved reliability
  const checkRideStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?id=eq.${rideId}&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'Prefer': 'return=representation'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setLastChecked(Date.now());
      
      if (data && data.length > 0) {
        const rideData = data[0];
        
        console.log('Ride status check result:', rideData);
        
        // Update status if changed
        if (rideData.status !== status) {
          console.log(`Ride status changed from ${status} to ${rideData.status}`);
          setStatus(rideData.status);
          
          // Show toast notification on status change
          if (rideData.status === 'accepted') {
            toast.success('A driver has accepted your ride!', {
              id: 'ride-accepted'
            });
          } else if (rideData.status === 'en_route') {
            toast.success('Your driver is on the way!');
          } else if (rideData.status === 'picked_up') {
            toast.success('You have been picked up!');
          } else if (rideData.status === 'cancelled') {
            toast.error('Your ride has been cancelled');
          } else if (rideData.status === 'completed') {
            toast.success('Your ride has been completed');
          }
        }
        
        // Check if we need to fetch driver info
        if ((rideData.status === 'accepted' || rideData.status === 'en_route' || rideData.status === 'picked_up') && 
            rideData.driver_id && !driverInfo) {
          fetchDriverInfo(rideData.driver_id);
        }
      }
    } catch (error) {
      console.error('Error checking ride status:', error);
      setError('Failed to update ride status. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch driver information with better error handling
  const fetchDriverInfo = async (driverId: string) => {
    console.log(`Fetching driver info for driver ID: ${driverId}`);
    try {
      const response = await fetch(
        `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/drivers?id=eq.${driverId}&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const drivers = await response.json();
      
      if (drivers && drivers.length > 0) {
        console.log('Driver info received:', drivers[0]);
        setDriverInfo(drivers[0]);
        // Show success toast that driver info was loaded
        toast.success(`Your driver ${drivers[0].name} is on the way!`);
      } else {
        console.log('No driver info found for ID:', driverId);
      }
    } catch (error) {
      console.error('Error fetching driver info:', error);
    }
  };
  
  // Function to cancel ride
  const handleCancel = async () => {
    try {
      setIsLoading(true);
      toast.loading('Cancelling ride...', {
        id: 'cancel-ride'
      });
      
      const response = await fetch(
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
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast.dismiss('cancel-ride');
      toast.success('Ride cancelled successfully');
      setStatus('cancelled');
    } catch (error) {
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
  
  // More frequent polling for ride updates when in pending state or after force refresh
  useEffect(() => {
    // Check status immediately on mount or force refresh
    checkRideStatus();
    
    // Set up polling interval - very frequent when pending (0.8 seconds), less when accepted
    const interval = setInterval(() => {
      // If too much time has passed without an update, force refresh
      const timeWithoutUpdate = Date.now() - lastChecked;
      const shouldForceFetch = timeWithoutUpdate > 5000; // 5 seconds
      
      if (shouldForceFetch || (status === 'pending')) {
        checkRideStatus();
      }
    }, status === 'pending' ? 800 : 3000);
    
    return () => clearInterval(interval);
  }, [rideId, status, lastChecked, forceRefresh]);
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Ride Status</h2>
        
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh} 
              className="ml-2 text-xs"
            >
              Retry
            </Button>
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
                >
                  Refresh Status
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

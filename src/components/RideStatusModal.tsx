
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
  
  // Handle WebSocket messages for ride status updates
  const handleRideMessage = (data: any) => {
    console.log('Ride status update received via WebSocket:', data);
    if (data.type === 'ride_status_update' && data.ride?.id === rideId) {
      setStatus(data.ride.status);
      
      if (data.ride.status === 'accepted' && data.ride.driver) {
        setDriverInfo(data.ride.driver);
        toast.success('A driver has accepted your ride!');
      }
    }
  };
  
  // Check ride status from database on component mount and periodically
  useEffect(() => {
    const checkRideStatus = async () => {
      try {
        console.log('Checking ride status for ride ID:', rideId);
        setIsPolling(true);
        
        const { data, error } = await fetch(
          `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/ride_requests?id=eq.${rideId}&select=*`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo'
            }
          }
        ).then(res => res.json());
        
        if (error) {
          console.error('Error checking ride status:', error);
          return;
        }
        
        console.log('Ride status data received:', data);
        
        if (data && data.length > 0) {
          const rideData = data[0];
          console.log('Current status:', status, 'New status:', rideData.status);
          
          // Only update if status has changed
          if (rideData.status !== status) {
            setStatus(rideData.status);
            
            if (rideData.status === 'accepted' && rideData.driver_id) {
              console.log('Ride accepted, getting driver info');
              // Get driver info
              const { data: driverData, error: driverError } = await fetch(
                `https://lavfpsnvwyzpilmgkytj.supabase.co/rest/v1/drivers?id=eq.${rideData.driver_id}&select=*`,
                {
                  headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo'
                  }
                }
              ).then(res => res.json());
              
              if (driverError) {
                console.error('Error fetching driver info:', driverError);
              } else if (driverData && driverData.length > 0) {
                console.log('Driver info received:', driverData[0]);
                setDriverInfo(driverData[0]);
                toast.success('A driver has accepted your ride!');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in checkRideStatus:', error);
      } finally {
        setIsPolling(false);
      }
    };
    
    // Check status immediately
    checkRideStatus();
    
    // Set up polling for status updates every 3 seconds as a fallback for WebSocket
    const interval = setInterval(checkRideStatus, 3000);
    
    return () => clearInterval(interval);
  }, [rideId, status]);
  
  // Use WebSocket hook
  const { sendMessage } = useWebSocket(
    userRideSocket,
    handleRideMessage,
    (status) => console.log('WebSocket status:', status),
    localStorage.getItem('userId') || undefined
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
  
  const handleCancel = () => {
    sendMessage({
      type: 'cancel_ride',
      ride_id: rideId
    });
    
    toast.info('Ride cancellation requested');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Ride Status</h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" /> Elapsed time: {formatElapsedTime()}
            </span>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full 
              ${status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                status === 'accepted' ? 'bg-blue-100 text-blue-800' : 
                status === 'en_route' ? 'bg-purple-100 text-purple-800' : 
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
          
          {driverInfo?.phone_number && status !== 'pending' && (
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

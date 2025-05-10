import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, PhoneCall, AlertTriangle, Navigation } from 'lucide-react';
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
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null);
  const userId = localStorage.getItem('userId');
  
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapLoadedRef = useRef<boolean>(false);
  
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
  
  // Initialize Google Maps
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !window.google || !userLocation) return;
    
    // Create map instance
    const mapOptions: google.maps.MapOptions = {
      center: { lat: userLocation.lat, lng: userLocation.lng },
      zoom: 15,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    };
    
    mapRef.current = new window.google.maps.Map(mapContainerRef.current, mapOptions);
    
    // Add marker for user's location
    userMarkerRef.current = new window.google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: mapRef.current,
      title: "Your location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    });
    
    // Add marker for driver's location if available
    if (driverLocation) {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: { lat: driverLocation.lat, lng: driverLocation.lng },
        map: mapRef.current,
        title: "Driver's location",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
      });
      
      // Fit map to show both markers
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(userLocation.lat, userLocation.lng));
      bounds.extend(new google.maps.LatLng(driverLocation.lat, driverLocation.lng));
      mapRef.current.fitBounds(bounds);
    }
    
    mapLoadedRef.current = true;
  }, [userLocation, driverLocation]);
  
  // Update driver marker position
  const updateDriverMarker = useCallback((lat: number, lng: number) => {
    if (!mapLoadedRef.current || !window.google) return;
    
    const newLocation = { lat, lng };
    setDriverLocation(newLocation);
    
    if (!driverMarkerRef.current) {
      // Create driver marker if it doesn't exist
      driverMarkerRef.current = new window.google.maps.Marker({
        position: newLocation,
        map: mapRef.current,
        title: "Driver's location",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
        animation: google.maps.Animation.DROP
      });
    } else {
      // Animate the marker movement
      animateMarkerTo(driverMarkerRef.current, lat, lng);
    }
    
    // Calculate and update ETA if user location is available
    if (userLocation) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
      // Roughly estimate arrival time (assuming 30 km/h average speed in traffic)
      const timeInMinutes = Math.round((distance / 30) * 60);
      setEstimatedArrival(timeInMinutes <= 1 ? 'Less than 1 minute' : `About ${timeInMinutes} minutes`);
    }
    
    // Adjust map to fit both markers
    if (mapRef.current && userMarkerRef.current) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(userMarkerRef.current.getPosition()!);
      bounds.extend(driverMarkerRef.current.getPosition()!);
      mapRef.current.fitBounds(bounds);
    }
  }, [userLocation]);
  
  // Animate marker movement for smoother updates
  const animateMarkerTo = (marker: google.maps.Marker, newLat: number, newLng: number) => {
    const startLat = marker.getPosition()?.lat() || 0;
    const startLng = marker.getPosition()?.lng() || 0;
    const frames = 30;
    let frame = 0;
    
    const animate = () => {
      frame++;
      if (frame <= frames) {
        const progress = frame / frames;
        const lat = startLat + (newLat - startLat) * progress;
        const lng = startLng + (newLng - startLng) * progress;
        marker.setPosition(new google.maps.LatLng(lat, lng));
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };
  
  // Load Google Maps API
  useEffect(() => {
    // Load Google Maps API if not already loaded
    const loadGoogleMapsApi = async () => {
      if (window.google && window.google.maps) {
        return;
      }
      
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCC1FYLxMzKMhSlPTM0nwwjLDd-5fkXT4k&libraries=places`;
      script.async = true;
      
      // Create a promise to wait for the script to load
      const loadPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
      });
      
      document.head.appendChild(script);
      await loadPromise;
    };
    
    // Only load map if we have a non-pending status
    if (status !== 'pending' && status !== 'cancelled') {
      loadGoogleMapsApi()
        .then(() => {
          // Try to get user's location from localStorage
          const storedLocation = localStorage.getItem('currentLocation');
          if (storedLocation) {
            try {
              const parsedLocation = JSON.parse(storedLocation);
              setUserLocation({ lat: parsedLocation.lat, lng: parsedLocation.lng });
            } catch (e) {
              console.error('Error parsing stored location:', e);
            }
          }
        })
        .catch(err => console.error('Error loading Google Maps API:', err));
    }
  }, [status]);
  
  // Initialize map when user location is set
  useEffect(() => {
    if (userLocation && window.google && !mapLoadedRef.current) {
      initMap();
    }
  }, [userLocation, initMap]);
  
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
        .select('*, driver:driver_id(*)')
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
        
        // Update driver location on map if available
        if (data.driver_latitude && data.driver_longitude) {
          updateDriverMarker(data.driver_latitude, data.driver_longitude);
        }
      }
    } catch (error: any) {
      console.error('Error checking ride status:', error);
      setError('Failed to update ride status. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [rideId, status, driverInfo, updateDriverMarker]);
  
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
  
  // Subscribe to real-time driver location updates
  useEffect(() => {
    if (!rideId) return;
    
    // Set up real-time subscription to ride request updates
    const channel = supabase
      .channel(`ride_${rideId}_tracking`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'ride_requests',
          filter: `id=eq.${rideId}`
        }, 
        (payload) => {
          console.log('Real-time ride update:', payload);
          
          const updatedRide = payload.new as any;
          
          // Update driver location if available
          if (updatedRide.driver_latitude && updatedRide.driver_longitude) {
            updateDriverMarker(updatedRide.driver_latitude, updatedRide.driver_longitude);
          }
          
          // Update ride status if changed
          if (updatedRide.status !== status) {
            setStatus(updatedRide.status);
            
            // Show toast notification based on status change
            if (updatedRide.status === 'en_route') {
              toast.success('Your driver is on the way!');
            } else if (updatedRide.status === 'picked_up') {
              toast.success('You have been picked up!');
            } else if (updatedRide.status === 'completed') {
              toast.success('Your ride has been completed!');
            }
          }
        }
      )
      .subscribe();
    
    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId, status, updateDriverMarker]);
  
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
  
  // Helper function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Ride Status</h2>
        
        {/* Error display */}
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
        
        {/* WebSocket Connection Status */}
        {isConnected && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded">
            <p className="flex items-center">
              <Navigation className="h-3 w-3 mr-1" />
              Realtime updates available
            </p>
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
          
          {/* Map display for driver location */}
          {status !== 'pending' && status !== 'cancelled' && status !== 'completed' && (
            <div className="h-[200px] rounded-lg overflow-hidden mb-4">
              {driverLocation && estimatedArrival && (
                <div className="bg-blue-50 p-2 text-xs text-blue-700 flex items-center mb-2">
                  <Navigation className="h-3 w-3 mr-1" />
                  <span>
                    Driver is approximately {estimatedArrival} away
                  </span>
                </div>
              )}
              <div 
                ref={mapContainerRef} 
                className="w-full h-full rounded-lg border"
              >
                {!driverLocation && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-gray-500 text-sm">Waiting for driver location...</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
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

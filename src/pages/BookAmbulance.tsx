
import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';

// Add a type definition for the Google Maps window global
declare global {
  interface Window {
    initMap: () => void;
    google: any;
  }
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

const BookAmbulance = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [ambulanceBooked, setAmbulanceBooked] = useState<boolean>(false);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(true);

  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Set the current location first with a placeholder address
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            address: "Loading address..."
          });
          
          // Initialize map only if API key is provided
          if (apiKey) {
            loadGoogleMapsApi().then(() => {
              initMap(latitude, longitude);
              // After map loads, try to get the address
              getAddressFromCoords(latitude, longitude);
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location. Please enter it manually.");
          
          // Initialize with default location if API key is provided
          if (apiKey) {
            loadGoogleMapsApi().then(() => {
              initMap(20.5937, 78.9629); // Default to center of India
            });
          }
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }

    return () => {
      // Clean up Google Maps instances
      if (markerRef.current) markerRef.current.setMap(null);
      if (driverMarkerRef.current) driverMarkerRef.current.setMap(null);
    };
  }, [apiKey]); // Re-run when API key changes

  // Function to load Google Maps API dynamically
  const loadGoogleMapsApi = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        setGoogleMapsLoaded(true);
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCNagpur0vQ9g6PGvOy6Y6ezTIZWumNO44`;
      script.async = true;
      script.defer = true;
      
      // Set up callbacks
      script.onload = () => {
        setGoogleMapsLoaded(true);
        setShowApiKeyInput(false);
        resolve();
      };
      script.onerror = (error) => {
        console.error('Error loading Google Maps API:', error);
        toast.error('Failed to load Google Maps. Check your API key.');
        setShowApiKeyInput(true);
        reject(error);
      };
      
      // Add script to document
      document.head.appendChild(script);
    });
  };

  // Simulate driver movement when ambulance is booked
  useEffect(() => {
    let intervalId: number;
    
    if (ambulanceBooked && currentLocation) {
      // Start with a position that's a bit away from the user
      const startLat = currentLocation.lat + 0.02;
      const startLng = currentLocation.lng - 0.02;
      
      setDriverLocation({ lat: startLat, lng: startLng });
      updateDriverMarker(startLat, startLng);
      
      // Move the driver marker towards the user's location
      let step = 0;
      const totalSteps = 20;
      
      intervalId = window.setInterval(() => {
        if (step < totalSteps && currentLocation) {
          step++;
          const progress = step / totalSteps;
          
          const newLat = startLat - (progress * 0.02);
          const newLng = startLng + (progress * 0.02);
          
          setDriverLocation({ lat: newLat, lng: newLng });
          updateDriverMarker(newLat, newLng);
          
          // Update map to show both markers
          if (mapRef.current && currentLocation && window.google) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng));
            bounds.extend(new window.google.maps.LatLng(newLat, newLng));
            mapRef.current.fitBounds(bounds);
          }
        } else {
          clearInterval(intervalId);
          if (step >= totalSteps) {
            toast.success("Driver has arrived at your location!");
          }
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ambulanceBooked]);

  const initMap = (lat: number, lng: number) => {
    if (!mapContainerRef.current || !window.google) return;
    
    const mapOptions: google.maps.MapOptions = {
      center: { lat, lng },
      zoom: 15,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    };
    
    mapRef.current = new window.google.maps.Map(mapContainerRef.current, mapOptions);
    
    // Add marker for user's location
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapRef.current,
      title: "Your location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    });
    
    // Allow clicking on map to update location
    mapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng && !ambulanceBooked) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        }
        
        // Reverse geocode to get address
        getAddressFromCoords(lat, lng);
      }
    });
  };

  const getAddressFromCoords = (lat: number, lng: number) => {
    // First update the coordinates
    setCurrentLocation(prev => {
      return {
        lat,
        lng,
        address: prev?.address || "Loading address..."
      };
    });
    
    // Now use the Google Maps Geocoding API to get the address
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          setCurrentLocation({
            lat,
            lng,
            address: results[0].formatted_address
          });
        } else {
          console.error("Geocoder failed due to: " + status);
          toast.error("Failed to retrieve address. Please enter it manually.");
          setCurrentLocation({
            lat, 
            lng,
            address: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`
          });
        }
      });
    }
  };

  const updateDriverMarker = (lat: number, lng: number) => {
    if (!mapRef.current || !window.google) return;
    
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition({ lat, lng });
    } else {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        title: "Driver's location",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentLocation) {
      toast.error("Please allow location access or select a location on the map");
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, you would make an API call to book the ambulance
      // For demonstration, we'll just simulate a successful booking
      setTimeout(() => {
        setAmbulanceBooked(true);
        toast.success("Ambulance booked successfully! Driver is on the way.");
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error booking ambulance:", error);
      toast.error("Failed to book ambulance. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Book an Ambulance</h1>
          
          {showApiKeyInput && !apiKey ? (
            <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Enter Google Maps API Key</h2>
              <p className="text-gray-600 mb-4">
                You need to enter a valid Google Maps API key to use the location features.
                Get one from the <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>.
              </p>
              <Input 
                placeholder="Enter your Google Maps API Key" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mb-4"
              />
              <Button 
                onClick={() => loadGoogleMapsApi()}
                className="w-full"
              >
                Load Maps
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Map Section */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-[400px]"></div>
                
                <div className="p-4 border-t">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-1 flex-shrink-0 text-red-500" />
                    <div>
                      <p className="font-medium">Your Location:</p>
                      <p className="text-gray-600">{currentLocation?.address || "Loading address..."}</p>
                      {ambulanceBooked && driverLocation && (
                        <p className="text-green-600 mt-2">
                          Driver is {calculateDistance(
                            currentLocation?.lat || 0, 
                            currentLocation?.lng || 0, 
                            driverLocation.lat, 
                            driverLocation.lng
                          ).toFixed(2)} km away
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Booking Form Section */}
              <div className="bg-white shadow-md rounded-lg p-6">
                {!ambulanceBooked ? (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" placeholder="Enter your name" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="Enter your phone number" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea 
                        id="address" 
                        placeholder="Confirm your address" 
                        value={currentLocation?.address || ""}
                        onChange={(e) => {
                          if (currentLocation) {
                            setCurrentLocation({...currentLocation, address: e.target.value});
                          }
                        }}
                        required 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can also click on the map to update your location
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea id="notes" placeholder="Any special instructions or medical information" />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full gradient-bg btn-animate"
                      disabled={loading}
                    >
                      {loading ? "Booking..." : "Book Ambulance Now"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Ambulance on the way!</h3>
                      <p className="text-green-700">
                        Your ambulance has been dispatched and will arrive shortly. 
                        You can track the driver's location on the map.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Driver Information:</h4>
                      <div className="space-y-1">
                        <p><span className="font-medium">Name:</span> John Driver</p>
                        <p><span className="font-medium">Vehicle:</span> Ambulance #A-125</p>
                        <p><span className="font-medium">ETA:</span> 5-7 minutes</p>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        toast.info("Emergency services have been notified of increased urgency");
                      }}
                    >
                      This is extremely urgent!
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setAmbulanceBooked(false);
                        setDriverLocation(null);
                        if (driverMarkerRef.current) {
                          driverMarkerRef.current.setMap(null);
                          driverMarkerRef.current = null;
                        }
                        toast.info("Ambulance booking cancelled");
                      }}
                    >
                      Cancel Ambulance
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
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

export default BookAmbulance;

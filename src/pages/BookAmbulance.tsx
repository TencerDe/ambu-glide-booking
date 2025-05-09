import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MapPin, Search } from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import RideStatusModal from '@/components/RideStatusModal';
import { supabase } from '@/integrations/supabase/client';

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
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Get current location on component mount
  useEffect(() => {
    loadGoogleMapsApi().then(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Set the current location first with a placeholder address
            const locationData = {
              lat: latitude,
              lng: longitude,
              address: "Loading address..."
            };
            
            setCurrentLocation(locationData);
            
            // Save location to localStorage
            localStorage.setItem('currentLocation', JSON.stringify(locationData));
            
            // Initialize map
            initMap(latitude, longitude);
            // After map loads, try to get the address
            getAddressFromCoords(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
            toast.error("Could not get your location. Please enter it manually.");
            
            // Initialize with default location
            initMap(20.5937, 78.9629); // Default to center of India
          }
        );
      } else {
        toast.error("Geolocation is not supported by your browser");
        initMap(20.5937, 78.9629); // Default to center of India
      }
    }).catch(error => {
      console.error("Error loading Google Maps:", error);
      toast.error("There was an issue loading the map. Please refresh the page.");
    });

    return () => {
      // Clean up Google Maps instances
      if (markerRef.current) markerRef.current.setMap(null);
      if (driverMarkerRef.current) driverMarkerRef.current.setMap(null);
    };
  }, []); // Run once on component mount

  // Function to load Google Maps API dynamically
  const loadGoogleMapsApi = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        setGoogleMapsLoaded(true);
        resolve();
        return;
      }

      // Create script element with updated API key
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCC1FYLxMzKMhSlPTM0nwwjLDd-5fkXT4k&libraries=places`;
      script.async = true;
      script.defer = true;
      
      // Set up callbacks
      script.onload = () => {
        setGoogleMapsLoaded(true);
        geocoderRef.current = new window.google.maps.Geocoder();
        resolve();
      };
      script.onerror = (error) => {
        console.error('Error loading Google Maps API:', error);
        toast.error('Failed to load maps. Please refresh the page or try again later.');
        reject(error);
      };
      
      // Add script to document
      document.head.appendChild(script);
    });
  };

  // Initialize autocomplete on the search input when Google Maps is loaded
  useEffect(() => {
    if (googleMapsLoaded && searchInputRef.current && window.google) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['geocode']
        });
        
        // Add listener for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Update map with the selected location
            if (mapRef.current) {
              mapRef.current.setCenter({ lat, lng });
              mapRef.current.setZoom(16);
            }
            
            if (markerRef.current) {
              markerRef.current.setPosition({ lat, lng });
            }
            
            const address = place.formatted_address || searchAddress;
            setCurrentLocation({
              lat,
              lng,
              address
            });
            
            setSearchAddress(address);
          }
        });
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        toast.error('Could not initialize address search. Please try entering the address manually.');
      }
    }
  }, [googleMapsLoaded, searchAddress]);

  // Simulate driver movement when ambulance is booked
  

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
      if (e.latLng && !showStatusModal) {
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
    const locationData = {
      lat,
      lng,
      address: currentLocation?.address || "Loading address..."
    };
    
    setCurrentLocation(locationData);
    
    // Save to localStorage
    localStorage.setItem('currentLocation', JSON.stringify(locationData));
    
    // Now use the Google Maps Geocoding API to get the address
    if (window.google && window.google.maps) {
      const geocoder = geocoderRef.current || new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          const updatedLocation = {
            lat,
            lng,
            address: results[0].formatted_address
          };
          
          setCurrentLocation(updatedLocation);
          setSearchAddress(results[0].formatted_address);
          
          // Update localStorage with the address
          localStorage.setItem('currentLocation', JSON.stringify(updatedLocation));
        } else {
          console.error("Geocoder failed due to: " + status);
          toast.error("Failed to retrieve address. Please enter it manually.");
          const fallbackLocation = {
            lat, 
            lng,
            address: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`
          };
          
          setCurrentLocation(fallbackLocation);
          
          // Save fallback to localStorage
          localStorage.setItem('currentLocation', JSON.stringify(fallbackLocation));
        }
      });
    }
  };

  const searchForAddress = () => {
    if (!searchAddress || !window.google) {
      toast.error("Please enter an address to search");
      return;
    }

    setLoading(true);
    const geocoder = geocoderRef.current || new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: searchAddress }, (results: any, status: any) => {
      setLoading(false);
      
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        // Update map center and zoom
        if (mapRef.current) {
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(16);
        }
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        }
        
        // Update currentLocation state
        const newLocation = {
          lat,
          lng,
          address: results[0].formatted_address
        };
        
        setCurrentLocation(newLocation);
        setSearchAddress(results[0].formatted_address);
        
        // Save to localStorage
        localStorage.setItem('currentLocation', JSON.stringify(newLocation));
      } else {
        toast.error("Could not find this address. Please try a different one.");
      }
    });
  };

  const updateDriverMarker = (lat: number, lng: number) => {
    if (!mapRef.current || !window.google) return;
    
    // If this is the first update, center the map on both markers
    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        title: "Driver's location",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
        animation: google.maps.Animation.DROP
      });
      
      // Fit map to show both markers
      if (currentLocation && mapRef.current) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(currentLocation.lat, currentLocation.lng));
        bounds.extend(new google.maps.LatLng(lat, lng));
        mapRef.current.fitBounds(bounds);
      }
    } else {
      // Animate the marker movement
      animateMarkerTo(driverMarkerRef.current, lat, lng);
    }
  };
  
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

  // Check for active ride on component mount
  useEffect(() => {
    const lastRideId = localStorage.getItem('lastRideId');
    if (lastRideId) {
      // Check if the ride is still active
      const checkRideStatus = async () => {
        try {
          const { data: rideData } = await supabase
            .from('ride_requests')
            .select('*')
            .eq('id', lastRideId)
            .single();
          
          if (rideData && ['pending', 'accepted', 'en_route'].includes(rideData.status)) {
            setCurrentRideId(lastRideId);
            setShowStatusModal(true);
          }
        } catch (error) {
          console.error('Error checking ride status:', error);
        }
      };
      
      checkRideStatus();
    }
  }, []);

  // Subscribe to ride updates
  useEffect(() => {
    if (!currentRideId) return;
    
    // Subscribe to changes in this specific ride
    const channel = supabase
      .channel(`ride_${currentRideId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'ride_requests',
          filter: `id=eq.${currentRideId}`
        }, 
        (payload) => {
          console.log('Ride update received:', payload);
          const updatedRide = payload.new;
          
          // If driver location updated, update the map
          if (updatedRide.driver_latitude && updatedRide.driver_longitude) {
            updateDriverMarker(updatedRide.driver_latitude, updatedRide.driver_longitude);
          }
          
          // If ride completed, close the status modal
          if (updatedRide.status === 'completed') {
            toast.success('Your ride has been completed!');
            setShowStatusModal(false);
            localStorage.removeItem('lastRideId');
            setCurrentRideId(null);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRideId]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentLocation) {
      toast.error("Please allow location access or select a location on the map");
      return;
    }
    
    // Show the booking modal
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (rideId: string) => {
    setShowBookingModal(false);
    setCurrentRideId(rideId);
    setShowStatusModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Book an Ambulance</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Map Section */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* Address Search Bar */}
              <div className="p-4 border-b flex gap-2">
                <Input 
                  ref={searchInputRef}
                  placeholder="Search for an address" 
                  value={searchAddress} 
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="flex-grow"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchForAddress();
                    }
                  }}
                />
                <Button 
                  onClick={searchForAddress} 
                  variant="secondary"
                  disabled={loading}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Find
                </Button>
              </div>
              
              <div ref={mapContainerRef} className="w-full h-[400px]"></div>
              
              <div className="p-4 border-t">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-medium">Your Location:</p>
                    <p className="text-gray-600">{currentLocation?.address || "Loading address..."}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Booking Form Section */}
            <div className="bg-white shadow-md rounded-lg p-6">
              
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
                        setSearchAddress(e.target.value);
                        if (currentLocation) {
                          setCurrentLocation({...currentLocation, address: e.target.value});
                        }
                      }}
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can also click on the map to update your location or search for an address above
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
                    {loading ? "Searching..." : "Book Ambulance Now"}
                  </Button>
                </form>
              
            </div>
          </div>
        </div>
      </main>
      
      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal 
          onClose={() => setShowBookingModal(false)} 
          onBookingSuccess={handleBookingSuccess}
          address={currentLocation?.address || ""}
        />
      )}
      
      {/* Ride Status Modal */}
      {showStatusModal && currentRideId && (
        <RideStatusModal 
          onClose={() => setShowStatusModal(false)}
          rideId={currentRideId}
        />
      )}
      
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

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Shield, MapPin, CheckCircle, Star, BarChart, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  const handleBookingClick = () => {
    navigate('/bookAmbulance');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Video Background */}
      <div className="relative h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1580281658223-9546379973be?auto=format&fit=crop&w=1920&q=80"
          >
            <source src="https://static.videezy.com/system/resources/previews/000/046/231/original/911-Emergency-Ambulance.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/75"></div>
        </div>

        <Navbar />
        
        <div className="container mx-auto px-4 relative z-10 h-full flex items-center pt-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
              <span className="text-blue-300">Medical Emergency?</span><br />
              We're on our way.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
              Book an ambulance in seconds. Fast, reliable emergency medical services available 24/7 across the city.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 py-6 text-lg shadow-blue-500/30 shadow-lg btn-animate"
                onClick={handleBookingClick}
              >
                Book Ambulance Now
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
              >
                Learn More
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="text-center">
                <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6 text-blue-300" />
                </div>
                <p className="text-white text-sm">24/7 Service</p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Activity className="h-6 w-6 text-blue-300" />
                </div>
                <p className="text-white text-sm">Medical Staff</p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-blue-300" />
                </div>
                <p className="text-white text-sm">Safe Transport</p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="h-6 w-6 text-blue-300" />
                </div>
                <p className="text-white text-sm">GPS Tracking</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="white" className="w-full">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>
      
      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It <span className="text-blue-600">Works</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our streamlined process ensures you get medical help as quickly as possible when every second counts.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative bg-white rounded-xl shadow-lg p-6 border border-gray-100 card-hover">
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Book an Ambulance</h3>
                <p className="text-gray-600">
                  Use our app to request an ambulance. Enter your location and select the type of emergency assistance you need.
                </p>
              </div>
            </div>
            
            <div className="relative bg-white rounded-xl shadow-lg p-6 border border-gray-100 card-hover md:mt-10">
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Track in Real-time</h3>
                <p className="text-gray-600">
                  Watch as your ambulance approaches in real-time on the map. Know exactly when help will arrive.
                </p>
              </div>
            </div>
            
            <div className="relative bg-white rounded-xl shadow-lg p-6 border border-gray-100 card-hover md:mt-20">
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Receive Medical Care</h3>
                <p className="text-gray-600">
                  Get professional medical assistance and safe transportation to the nearest hospital or medical facility.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg"
              onClick={handleBookingClick}
            >
              Book an Ambulance Now
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section with Angled Background */}
      <section className="py-20 px-4 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-20 bg-white" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)" }}></div>
        
        {/* Tech pattern background */}
        <div className="absolute inset-0 tech-pattern opacity-40"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-blue-600">Ambuk</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We combine cutting-edge technology with professional medical staff to provide the best emergency services.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">24/7 Availability</h3>
              <p className="text-gray-600">
                Emergency services available round the clock. Book an ambulance anytime, anywhere in the city.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">No wait times during emergencies</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Service available on holidays</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Medical Assistance</h3>
              <p className="text-gray-600">
                Trained medical staff to provide immediate care during transportation to hospitals.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Certified paramedics on board</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Advanced medical equipment</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">GPS Tracking</h3>
              <p className="text-gray-600">
                Real-time location tracking to know exactly when help will arrive at your location.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Live map updates</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Estimated arrival times</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Premium Service</h3>
              <p className="text-gray-600">
                High-quality ambulance service with modern vehicles and equipment for patient comfort.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Climate controlled vehicles</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Smooth transport experience</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <BarChart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Data Security</h3>
              <p className="text-gray-600">
                Your medical data and personal information are protected with enterprise-grade security.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">End-to-end encryption</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">HIPAA compliant</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Vital Monitoring</h3>
              <p className="text-gray-600">
                Continuous monitoring of patient vitals during transit to ensure proper care.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Advanced monitoring equipment</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Real-time data transmission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-blue-600 to-blue-800" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%, 0 100%)" }}></div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
        {/* Background elements */}
        <div className="blob-shape"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-4 border-white/30"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full border-4 border-white/30"></div>
          <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full border-4 border-white/30"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready for Emergency Transport?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Don't wait for an emergency. Be prepared when it matters most.
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-8 py-6 text-lg rounded-full shadow-white/20 shadow-lg"
              onClick={handleBookingClick}
            >
              Book Ambulance Now
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our <span className="text-blue-600">Users Say</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Real stories from people who've used our ambulance service during emergencies.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-blue-600 text-5xl">"</div>
              <p className="text-gray-600 mt-6 mb-6">
                When my father had a stroke, I used Ambuk to call an ambulance. They arrived within 7 minutes and the paramedics were extremely professional.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-800">Rajesh Kumar</h4>
                  <div className="flex text-yellow-400 mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-blue-600 text-5xl">"</div>
              <p className="text-gray-600 mt-6 mb-6">
                The real-time tracking feature gave me peace of mind when my pregnant wife needed to be taken to the hospital. Excellent service!
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-800">Priya Sharma</h4>
                  <div className="flex text-yellow-400 mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-blue-600 text-5xl">"</div>
              <p className="text-gray-600 mt-6 mb-6">
                As someone with chronic health issues, having Ambuk on my phone gives me confidence. I've used it twice, and both times the service was exceptional.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-800">Vijay Reddy</h4>
                  <div className="flex text-yellow-400 mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <p className="text-gray-600">Rides Completed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">7 min</div>
              <p className="text-gray-600">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">300+</div>
              <p className="text-gray-600">Medical Professionals</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;


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
            Don't wait for an emergency. Download our app now to save precious time when it matters most.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-8 py-6 text-lg rounded-full shadow-white/20 shadow-lg"
              onClick={handleBookingClick}
            >
              Book Ambulance Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
              onClick={() => window.location.href = '/signup'}
            >
              Create Account
            </Button>
          </div>
          
          {/* App Store Badges */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <a href="#" className="bg-black px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-900 transition-colors">
              <div className="text-white text-3xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.0441 12.7576C17.0301 9.60766 19.5936 8.16016 19.6941 8.10016C18.3421 6.08266 16.2481 5.82766 15.5026 5.80516C13.7046 5.62516 11.9576 6.88516 11.0461 6.88516C10.1166 6.88516 8.66413 5.82766 7.11413 5.85766C5.10413 5.88766 3.24163 7.04266 2.22163 8.84266C0.112134 12.4902 1.70963 17.9127 3.72663 20.9977C4.75413 22.5252 5.91663 24.2652 7.45413 24.2052C8.94663 24.1452 9.52413 23.2677 11.3221 23.2677C13.0971 23.2677 13.6516 24.2052 15.2041 24.1677C16.8016 24.1452 17.8141 22.6102 18.7966 21.0677C19.9966 19.2802 20.4816 17.5252 20.4966 17.4502C20.4666 17.4352 17.0666 16.2277 17.0441 12.7576Z" />
                  <path d="M14.4351 3.03711C15.2701 2.01711 15.8401 0.649609 15.6851 0.00460938C14.5226 0.0496094 13.1101 0.827609 12.2526 1.82511C11.4851 2.71011 10.7976 4.12511 10.9676 5.72511C12.2676 5.81261 13.5776 4.04211 14.4351 3.03711Z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white/80 text-xs">Download on the</div>
                <div className="text-white font-medium">App Store</div>
              </div>
            </a>
            <a href="#" className="bg-black px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-900 transition-colors">
              <div className="text-white text-3xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.05078 21.9827C3.87578 21.9227 3.70078 21.8402 3.52578 21.7577C2.95078 21.4652 2.52578 20.9852 2.25078 20.4002C1.95078 19.7702 1.85578 19.1177 1.80078 18.4427C1.70078 17.3102 1.70078 16.1702 1.70078 15.0377C1.70078 13.9052 1.70078 12.7727 1.80078 11.6402C1.85578 10.9652 1.95078 10.3127 2.25078 9.68266C2.52578 9.09766 2.95078 8.61766 3.52578 8.32516C4.07578 8.04766 4.67578 7.93516 5.30078 7.88016C6.43328 7.78016 7.56578 7.78016 8.69828 7.78016H15.2983C16.4308 7.78016 17.5633 7.78016 18.6958 7.88016C19.3708 7.93516 19.9708 8.04766 20.5208 8.32516C21.0958 8.61766 21.5208 9.09766 21.7958 9.68266C22.0958 10.3127 22.1908 10.9652 22.2458 11.6402C22.3458 12.7727 22.3458 13.9052 22.3458 15.0377C22.3458 16.1702 22.3458 17.3102 22.2458 18.4427C22.1908 19.1177 22.0958 19.7702 21.7958 20.4002C21.5208 20.9852 21.0958 21.4652 20.5208 21.7577C19.9708 22.0352 19.3708 22.1477 18.6958 22.2027C17.5633 22.3027 16.4308 22.3027 15.2983 22.3027H8.69828C7.56578 22.3027 6.43328 22.3027 5.30078 22.2027C4.88328 22.1702 4.46578 22.0952 4.05078 21.9827Z" fill="black"/>
                  <path d="M4.05078 21.9827C3.87578 21.9227 3.70078 21.8402 3.52578 21.7577C2.95078 21.4652 2.52578 20.9852 2.25078 20.4002C1.95078 19.7702 1.85578 19.1177 1.80078 18.4427C1.70078 17.3102 1.70078 16.1702 1.70078 15.0377C1.70078 13.9052 1.70078 12.7727 1.80078 11.6402C1.85578 10.9652 1.95078 10.3127 2.25078 9.68266C2.52578 9.09766 2.95078 8.61766 3.52578 8.32516C4.07578 8.04766 4.67578 7.93516 5.30078 7.88016C6.43328 7.78016 7.56578 7.78016 8.69828 7.78016H15.2983C16.4308 7.78016 17.5633 7.78016 18.6958 7.88016C19.3708 7.93516 19.9708 8.04766 20.5208 8.32516C21.0958 8.61766 21.5208 9.09766 21.7958 9.68266C22.0958 10.3127 22.1908 10.9652 22.2458 11.6402C22.3458 12.7727 22.3458 13.9052 22.3458 15.0377C22.3458 16.1702 22.3458 17.3102 22.2458 18.4427C22.1908 19.1177 22.0958 19.7702 21.7958 20.4002C21.5208 20.9852 21.0958 21.4652 20.5208 21.7577C19.9708 22.0352 19.3708 22.1477 18.6958 22.2027C17.5633 22.3027 16.4308 22.3027 15.2983 22.3027H8.69828C7.56578 22.3027 6.43328 22.3027 5.30078 22.2027C4.88328 22.1702 4.46578 22.0952 4.05078 21.9827Z" stroke="white" strokeOpacity="0.4" strokeWidth="0.7"/>
                  <path d="M8.72396 4.90039L12.8065 8.00289L16.099 5.32539C16.174 4.81539 16.0065 4.26789 15.6515 3.86789C15.399 3.58539 15.0515 3.40789 14.684 3.34539C14.5165 3.31539 14.349 3.30789 14.1815 3.30789C13.6715 3.30039 13.169 3.45289 12.764 3.74289C12.6215 3.84039 12.494 3.95289 12.374 4.07289C11.8865 4.55289 8.72396 4.90039 8.72396 4.90039Z" fill="white"/>
                  <path d="M8.38891 4.67969L5.08891 7.35719C5.01391 7.41969 4.95391 7.49469 4.90391 7.57719C4.71391 7.86719 4.65391 8.22969 4.75141 8.57219C4.85641 8.94719 5.13391 9.23219 5.48391 9.35219C5.71141 9.42719 5.95391 9.42719 6.18141 9.38969C6.31141 9.36719 6.44141 9.32219 6.56391 9.26719C6.67891 9.21219 8.59141 8.11969 8.59141 8.11969L12.2989 11.8422V18.7497L8.72391 17.3197C8.38141 17.1897 8.09641 16.9422 7.93141 16.6147C7.81641 16.3797 7.76391 16.1222 7.76391 15.8647V7.19719L8.38891 4.67969Z" fill="white"/>
                  <path d="M16.6889 8.17578L12.8989 11.1758V18.7433C13.2039 18.8358 13.5314 18.8583 13.8439 18.8058C14.2014 18.7458 14.5364 18.5858 14.7939 18.3358C15.1689 17.9758 15.3739 17.4733 15.3739 16.9558V8.94828C15.3739 8.61328 15.2889 8.27829 15.1164 7.98579C15.0364 7.83329 14.9339 7.69579 14.8089 7.57329C14.4339 7.20579 13.9014 7.03579 13.3714 7.11579C13.0964 7.15329 16.6889 8.17578 16.6889 8.17578Z" fill="white"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white/80 text-xs">GET IT ON</div>
                <div className="text-white font-medium">Google Play</div>
              </div>
            </a>
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

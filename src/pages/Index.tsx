
import React from 'react';
import Navbar from '@/components/Navbar';
import BookingModal from '@/components/BookingModal';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Shield, MapPin } from 'lucide-react';

const Index = () => {
  const openBookingModal = () => {
    const modal = document.getElementById('booking-modal') as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <BookingModal />
      
      {/* Hero Section */}
      <section className="gradient-bg pt-24 pb-20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
              Emergency Medical Transport When You Need It Most
            </h1>
            <p className="text-xl text-white/80 mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
              Book an ambulance in seconds. Fast, reliable service available 24/7.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 btn-animate"
                onClick={openBookingModal}
              >
                Book Now
                <ArrowRight className="ml-2" size={18} />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 btn-animate"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="relative w-full max-w-md">
              <div className="aspect-video bg-white/10 rounded-2xl overflow-hidden glass-effect">
                <img 
                  src="https://images.unsplash.com/photo-1612776572997-76cc42e058c3?auto=format&fit=crop&w=800&q=80" 
                  alt="Ambulance" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Choose Ambuk?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mb-6 mx-auto">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">24/7 Availability</h3>
              <p className="text-gray-600 text-center">
                Emergency services available round the clock. Book an ambulance anytime, anywhere.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mb-6 mx-auto">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Medical Assistance</h3>
              <p className="text-gray-600 text-center">
                Trained medical staff to provide immediate care during transportation.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mb-6 mx-auto">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">GPS Tracking</h3>
              <p className="text-gray-600 text-center">
                Real-time location tracking to know exactly when help will arrive.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 gradient-bg">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready for Emergency Transport?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Don't wait for an emergency. Register now to save precious time when it matters most.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 btn-animate"
              onClick={openBookingModal}
            >
              Book Ambulance
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10 btn-animate"
              onClick={() => window.location.href = '/signup'}
            >
              Create Account
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;

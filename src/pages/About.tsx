
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, Award, Clock, Users, Settings } from 'lucide-react';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-blue-700 border-blue-200 bg-blue-50">About Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              About Ambuk
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing emergency medical services with technology for faster response times and better patient outcomes.
            </p>
          </div>
          
          <Card className="mb-10 shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-3"></div>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-blue-700">
                <Award className="h-6 w-6 mr-2" />
                Our Mission
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                At Ambuk, our mission is to provide fast, reliable, and life-saving ambulance services when you need them most. 
                We understand that in emergency situations, every second counts, and our goal is to ensure that medical assistance 
                reaches you as quickly as possible.
              </p>
              
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-blue-700 mt-10">
                <Clock className="h-6 w-6 mr-2" />
                Our Story
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Ambuk was founded in 2025 with a simple yet powerful vision: to revolutionize emergency medical transportation 
                through technology. Our founders witnessed firsthand the challenges people face when trying to get emergency 
                medical transport, and they were determined to create a solution.
              </p>
              
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-blue-700 mt-10">
                <Settings className="h-6 w-6 mr-2" />
                Our Approach
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We combine cutting-edge technology with highly trained medical professionals to provide an ambulance service that's:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Fast:</span> Our system automatically dispatches the nearest available ambulance to your location.
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Reliable:</span> All our ambulances are well-maintained and equipped with advanced medical equipment.
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Professional:</span> Our staff includes certified paramedics and emergency medical technicians.
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Accessible:</span> Our service is available 24/7, 365 days a year.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-3"></div>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-blue-700">
                <Users className="h-6 w-6 mr-2" />
                Our Team
              </h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Behind Ambuk is a dedicated team of healthcare professionals, technology experts, and operations specialists 
                all working together to ensure you receive the best emergency medical transportation possible.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-blue-100 p-1">
                    <AvatarImage src="/lovable-uploads/23a1bdd7-e524-4b12-bc26-7c5a9cb100e5.png" alt="Tanuj Sharma" />
                    <AvatarFallback className="bg-blue-100 text-blue-700">TS</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg text-gray-800">Tanuj Sharma</h3>
                  <p className="text-blue-600 text-sm mb-2">Founder & CTO</p>
                  <p className="text-gray-500 text-sm">Tech visionary leading our innovation efforts</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-blue-100 p-1">
                    <AvatarImage src="/lovable-uploads/bac82e43-5e9b-40e3-a273-7c7fc5fa5b01.png" alt="Sachin Bisht" />
                    <AvatarFallback className="bg-blue-100 text-blue-700">SB</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg text-gray-800">Sachin Bisht</h3>
                  <p className="text-blue-600 text-sm mb-2">Co-Founder & CEO</p>
                  <p className="text-gray-500 text-sm">Strategic leader with healthcare experience</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-blue-100 p-1">
                    <AvatarImage src="/lovable-uploads/32ce5320-d862-4846-a1b0-eaaf851f2f5f.png" alt="Lakshay Vashisht" />
                    <AvatarFallback className="bg-blue-100 text-blue-700">LV</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg text-gray-800">Lakshay Vashisht</h3>
                  <p className="text-blue-600 text-sm mb-2">Co-Founder & CTO</p>
                  <p className="text-gray-500 text-sm">Expert in emergency response systems</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-blue-100 p-1">
                    <AvatarImage src="https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80" alt="Ambika Pundir" />
                    <AvatarFallback className="bg-blue-100 text-blue-700">AP</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg text-gray-800">Ambika Pundir</h3>
                  <p className="text-blue-600 text-sm mb-2">Co-Founder & COO</p>
                  <p className="text-gray-500 text-sm">Operations expert with logistics background</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;

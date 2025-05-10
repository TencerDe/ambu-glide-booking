
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, Award, Clock, Users, Settings, ArrowRight, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 z-0">
          {/* Abstract Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-60 h-60 rounded-full border-8 border-white/30"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full border-4 border-white/30"></div>
            <div className="absolute top-1/3 right-1/3 w-20 h-20 rounded-full border-4 border-white/30"></div>
          </div>
        </div>
        
        <Navbar />
        
        <div className="container mx-auto h-full flex items-center justify-center px-4 relative z-10 pt-16">
          <div className="text-center max-w-3xl">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-blue-100 border-blue-400/30 bg-blue-500/10 font-medium text-sm">About Us</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Revolutionizing Emergency Medical Services
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We're using cutting-edge technology to save lives by making emergency medical transport faster and more accessible.
            </p>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="white" className="w-full">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>
      
      <main className="flex-grow">
        {/* Mission Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-none shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="md:w-1/3 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                      <Award className="w-16 h-16 text-blue-600" />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center">
                      Our Mission
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                      At Ambuk, our mission is to provide fast, reliable, and life-saving ambulance services when you need them most. 
                      We understand that in emergency situations, every second counts, and our goal is to ensure that medical assistance 
                      reaches you as quickly as possible.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-100 rounded-full p-1 flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Rapid Response:</span> We aim to dispatch ambulances within minutes of receiving a call.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-100 rounded-full p-1 flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Quality Care:</span> Our ambulances are equipped with advanced medical equipment and staffed by trained professionals.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-100 rounded-full p-1 flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Accessibility:</span> Making emergency medical services available to everyone through technology.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-6 text-center">Our <span className="text-blue-600">Story</span></h2>
              <div className="bg-white rounded-xl shadow-lg p-8 relative timeline-container">
                <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-blue-100 hidden md:block"></div>
                
                <div className="relative pl-0 md:pl-16 mb-12">
                  <div className="absolute left-0 top-0 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center hidden md:flex">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                  </div>
                  <div className="md:ml-8">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">The Idea (2024)</h3>
                    <p className="text-gray-700">
                      Our founders witnessed firsthand the challenges people face when trying to get emergency medical transport.
                      Long wait times and lack of information were literally costing lives.
                    </p>
                  </div>
                </div>
                
                <div className="relative pl-0 md:pl-16 mb-12">
                  <div className="absolute left-0 top-0 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center hidden md:flex">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                  </div>
                  <div className="md:ml-8">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Launch (2025)</h3>
                    <p className="text-gray-700">
                      Ambuk was officially launched with a fleet of 25 ambulances in Delhi NCR. Our app-based booking system
                      revolutionized how people access emergency medical transportation.
                    </p>
                  </div>
                </div>
                
                <div className="relative pl-0 md:pl-16">
                  <div className="absolute left-0 top-0 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center hidden md:flex">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                  </div>
                  <div className="md:ml-8">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Today</h3>
                    <p className="text-gray-700">
                      We now operate in 10+ major cities with a fleet of over 500 ambulances. We've helped thousands of people
                      get timely medical assistance, and we continue to expand our services nationwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-10 text-center">Our <span className="text-blue-600">Approach</span></h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="h-1.5 bg-blue-600"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Settings className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Technology-First</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      We leverage advanced technology including AI dispatching, real-time tracking, and predictive analytics to optimize ambulance placement for faster response times.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="h-1.5 bg-blue-600"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Professional Staff</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Our ambulances are staffed with certified paramedics and EMTs who undergo rigorous training. We maintain the highest standards for medical care during transport.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="h-1.5 bg-blue-600"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold">24/7 Availability</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Medical emergencies don't follow a schedule. Our service is available 24 hours a day, 365 days a year, ensuring help is always just a few taps away.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="h-1.5 bg-blue-600"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Data Privacy</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      We take your medical data seriously. All information is encrypted and securely stored, meeting international standards for healthcare data protection.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-blue-700 border-blue-200 bg-blue-50">Our Team</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the <span className="text-blue-600">Team</span></h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Behind Ambuk is a dedicated team of healthcare professionals, technology experts, and operations specialists
                all working together to save lives.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 relative">
                  <Avatar className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 border-4 border-white">
                    <AvatarImage src="/lovable-uploads/23a1bdd7-e524-4b12-bc26-7c5a9cb100e5.png" alt="Tanuj Sharma" className="object-cover" />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">TS</AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-6 pt-16 text-center">
                  <h3 className="font-semibold text-xl text-gray-800">Tanuj Sharma</h3>
                  <p className="text-blue-600 font-medium mb-3">Founder & CTO</p>
                  <p className="text-gray-600 text-sm mb-4">Tech visionary with experience building healthcare platforms</p>
                  <div className="flex justify-center space-x-3 text-gray-400">
                    <a href="#" className="hover:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    <a href="#" className="hover:text-blue-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
                
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 relative">
                  <Avatar className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 border-4 border-white">
                    <AvatarImage src="/lovable-uploads/bac82e43-5e9b-40e3-a273-7c7fc5fa5b01.png" alt="Sachin Bisht" className="object-cover" />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">SB</AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-6 pt-16 text-center">
                  <h3 className="font-semibold text-xl text-gray-800">Sachin Bisht</h3>
                  <p className="text-blue-600 font-medium mb-3">Co-Founder & CEO</p>
                  <p className="text-gray-600 text-sm mb-4">Strategic leader with extensive healthcare experience</p>
                  <div className="flex justify-center space-x-3 text-gray-400">
                    <a href="#" className="hover:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    <a href="#" className="hover:text-blue-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
                
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 relative">
                  <Avatar className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 border-4 border-white">
                    <AvatarImage src="/lovable-uploads/32ce5320-d862-4846-a1b0-eaaf851f2f5f.png" alt="Lakshay Vashisht" className="object-cover" />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">LV</AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-6 pt-16 text-center">
                  <h3 className="font-semibold text-xl text-gray-800">Lakshay Vashisht</h3>
                  <p className="text-blue-600 font-medium mb-3">Co-Founder & CTO</p>
                  <p className="text-gray-600 text-sm mb-4">Expert in emergency response systems and technology</p>
                  <div className="flex justify-center space-x-3 text-gray-400">
                    <a href="#" className="hover:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    <a href="#" className="hover:text-blue-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
                
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 relative">
                  <Avatar className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 border-4 border-white">
                    <AvatarImage src="https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80" alt="Ambika Pundir" className="object-cover" />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">AP</AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-6 pt-16 text-center">
                  <h3 className="font-semibold text-xl text-gray-800">Ambika Pundir</h3>
                  <p className="text-blue-600 font-medium mb-3">Co-Founder & COO</p>
                  <p className="text-gray-600 text-sm mb-4">Operations expert with logistics and healthcare background</p>
                  <div className="flex justify-center space-x-3 text-gray-400">
                    <a href="#" className="hover:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    <a href="#" className="hover:text-blue-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-4 border-white/30"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full border-4 border-white/30"></div>
            <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full border-4 border-white/30"></div>
          </div>
          
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Join the Ambuk Family</h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Whether you need emergency services or want to be part of our growing team, we're here for you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-8 py-6 text-lg rounded-full shadow-lg"
                onClick={() => navigate('/bookAmbulance')}
              >
                Book an Ambulance
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;

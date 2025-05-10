
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">About Ambuk</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              At Ambuk, our mission is to provide fast, reliable, and life-saving ambulance services when you need them most. 
              We understand that in emergency situations, every second counts, and our goal is to ensure that medical assistance 
              reaches you as quickly as possible.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Ambuk was founded in 2025 with a simple yet powerful vision: to revolutionize emergency medical transportation 
              through technology. Our founders witnessed firsthand the challenges people face when trying to get emergency 
              medical transport, and they were determined to create a solution.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">Our Approach</h2>
            <p className="text-gray-700 mb-4">
              We combine cutting-edge technology with highly trained medical professionals to provide an ambulance service that's:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li className="mb-2">Fast: Our system automatically dispatches the nearest available ambulance to your location.</li>
              <li className="mb-2">Reliable: All our ambulances are well-maintained and equipped with advanced medical equipment.</li>
              <li className="mb-2">Professional: Our staff includes certified paramedics and emergency medical technicians.</li>
              <li className="mb-2">Accessible: Our service is available 24/7, 365 days a year.</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="text-gray-700 mb-4">
              Behind Ambuk is a dedicated team of healthcare professionals, technology experts, and operations specialists 
              all working together to ensure you receive the best emergency medical transportation possible.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-3">
                  <AvatarImage src="/lovable-uploads/23a1bdd7-e524-4b12-bc26-7c5a9cb100e5.png" alt="Tanuj Sharma" />
                  <AvatarFallback>TS</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">Tanuj Sharma</h3>
                <p className="text-gray-600 text-sm">Founder and Chief Technical Officer</p>
              </div>
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-3">
                  <AvatarImage src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80" alt="Sachin Bisht" />
                  <AvatarFallback>SB</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">Sachin Bisht</h3>
                <p className="text-gray-600 text-sm">Co-Founder and Chief Executive Officer</p>
              </div>
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-3">
                  <AvatarImage src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80" alt="Lakshay Vashisht" />
                  <AvatarFallback>LV</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">Lakshay Vashisht</h3>
                <p className="text-gray-600 text-sm">Co-Founder and Chief Technical Officer</p>
              </div>
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-3">
                  <AvatarImage src="https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80" alt="Ambika Pundir" />
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">Ambika Pundir</h3>
                <p className="text-gray-600 text-sm">Co-Founder and Chief Operation Manager</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;

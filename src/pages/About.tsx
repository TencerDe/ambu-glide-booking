
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
              Ambuk was founded in 2023 with a simple yet powerful vision: to revolutionize emergency medical transportation 
              through technology. Our founders witnessed firsthand the challenges people face when trying to get emergency 
              medical transport, and they were determined to create a solution.
            </p>
            <p className="text-gray-700 mb-4">
              What started as a small operation with just three ambulances has now grown into a network of over 100 vehicles 
              across multiple cities, all connected through our state-of-the-art booking platform.
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
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <h3 className="font-semibold">Dr. Sarah Johnson</h3>
                <p className="text-gray-600 text-sm">Medical Director</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <h3 className="font-semibold">Alex Chen</h3>
                <p className="text-gray-600 text-sm">Chief Technology Officer</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <h3 className="font-semibold">Maria Rodriguez</h3>
                <p className="text-gray-600 text-sm">Operations Manager</p>
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

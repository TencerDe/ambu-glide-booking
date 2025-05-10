
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically be connected to an API
    alert('Thank you for your message. We will get back to you shortly.');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input id="name" type="text" placeholder="Your name" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input id="email" type="email" placeholder="Your email" required />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input id="subject" type="text" placeholder="Subject" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea id="message" placeholder="Your message" rows={5} required />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Address</h3>
                  <p className="text-gray-700">
                    123 Medical Plaza<br />
                    Health District<br />
                    New York, NY 10001
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Phone</h3>
                  <p className="text-gray-700">
                    Emergency: (800) 555-0123<br />
                    Non-Emergency: (800) 555-0124<br />
                    Customer Support: (800) 555-0125
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-gray-700">
                    General Inquiries: info@ambuk.com<br />
                    Support: support@ambuk.com<br />
                    Partnerships: partners@ambuk.com
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Hours of Operation</h3>
                  <p className="text-gray-700">
                    Emergency Services: 24/7/365<br />
                    Office Hours: Monday-Friday, 9am-5pm
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

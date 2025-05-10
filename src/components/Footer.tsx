
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-8 gradient-bg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="text-2xl font-bold text-white flex items-center">
              <span className="text-3xl mr-2">🚑</span> 
              Ambuk
            </Link>
            <p className="text-white/80 mt-2 max-w-md">
              Fast, reliable ambulance services when you need them most. 
              Available 24/7 for emergency medical transportation.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white">Emergency Transport</a></li>
                <li><a href="#" className="text-white/80 hover:text-white">Medical Assistance</a></li>
                <li><a href="#" className="text-white/80 hover:text-white">Non-Emergency Transport</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-white/80 hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="text-white/80 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">Facebook</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">Twitter</a></li>
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 text-center">
          <p className="text-white/60">
            © {new Date().getFullYear()} Ambuk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, MapPin, Mail, Phone, Ambulance } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer className="w-full py-8 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="text-2xl font-bold text-white flex items-center space-x-2 mb-4">
              <Ambulance className="h-6 w-6" />
              <span>Ambuk</span>
            </Link>
            <p className="text-blue-100 mb-4">
              Fast, reliable ambulance services when you need them most. 
              Available 24/7 for emergency medical transportation.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="text-blue-200 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                className="text-blue-200 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="text-blue-200 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
                  <span>Emergency Transport</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
                  <span>Medical Assistance</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
                  <span>Non-Emergency Transport</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
                  <span>Patient Monitoring</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
                  <span>Contact</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
                  <span>Pricing</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
                  <span>FAQ</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100">
                  123 Medical Center Drive, New Delhi, India
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-300 flex-shrink-0" />
                <span className="text-blue-100">support@ambuk.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-300 flex-shrink-0" />
                <span className="text-blue-100">+91 800-123-4567</span>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="bg-blue-700/50 my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-blue-200">
          <p className="mb-4 md:mb-0">
            © {new Date().getFullYear()} Ambuk. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-blue-300 hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-blue-300 hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="text-blue-300 hover:text-white text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

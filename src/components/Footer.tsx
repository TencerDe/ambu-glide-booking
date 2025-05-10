
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, MapPin, Mail, Phone, Ambulance, ArrowRight, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="w-full py-16 bg-gradient-to-b from-gray-900 to-blue-950">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-bold text-white flex items-center space-x-2 mb-6">
              <Ambulance className="h-7 w-7" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100">Ambuk</span>
            </Link>
            <p className="text-blue-200 mb-6 leading-relaxed">
              Fast, reliable ambulance services when you need them most. 
              Available 24/7 for emergency medical transportation throughout the city.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-blue-800 p-2 rounded-full text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-blue-800 p-2 rounded-full text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-blue-800 p-2 rounded-full text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-1 bg-blue-500 mr-2"></span>
              Services
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Emergency Transport</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Medical Assistance</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Non-Emergency Transport</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Patient Monitoring</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-1 bg-blue-500 mr-2"></span>
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Contact</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Pricing</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>FAQ</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-1 bg-blue-500 mr-2"></span>
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100">
                  123 Medical Center Drive, New Delhi, India
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-blue-100">support@ambuk.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-blue-100">+91 800-123-4567</span>
              </li>
            </ul>

            <div className="mt-6">
              <Button 
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6"
                onClick={() => window.location.href = '/bookAmbulance'}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="bg-blue-800/50 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-blue-300">
          <p className="mb-4 md:mb-0 text-sm">
            © {new Date().getFullYear()} Ambuk. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-8">
            <a href="#" className="text-blue-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-blue-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-blue-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-blue-300/60">
          <p className="flex items-center justify-center">
            Made with <Heart className="h-3 w-3 mx-1 text-red-400" /> by Ambuk Team for Medical Emergencies
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

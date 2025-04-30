
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="w-full px-4 py-4 fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white flex items-center">
          <span className="text-3xl mr-2">🚑</span> 
          Ambuk
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-primary-foreground transition-colors">
            Home
          </Link>
          <Link to="/login" className="text-white hover:text-primary-foreground transition-colors">
            Login
          </Link>
          <Link to="/signup" className="text-white hover:text-primary-foreground transition-colors">
            Sign Up
          </Link>
          <Link to="/admin-login" className="text-white hover:text-primary-foreground transition-colors">
            Admin
          </Link>
          <Button 
            variant="secondary" 
            className="btn-animate"
            onClick={() => document.getElementById('booking-modal').showModal()}
          >
            Book Ambulance
          </Button>
        </div>

        <button className="md:hidden text-white" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-black/90 animate-fade-in">
          <div className="flex flex-col items-center py-4 space-y-4">
            <Link 
              to="/" 
              className="text-white hover:text-primary-foreground transition-colors"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              to="/login" 
              className="text-white hover:text-primary-foreground transition-colors"
              onClick={toggleMenu}
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="text-white hover:text-primary-foreground transition-colors"
              onClick={toggleMenu}
            >
              Sign Up
            </Link>
            <Link 
              to="/admin-login" 
              className="text-white hover:text-primary-foreground transition-colors"
              onClick={toggleMenu}
            >
              Admin
            </Link>
            <Button 
              variant="secondary" 
              className="btn-animate"
              onClick={() => {
                document.getElementById('booking-modal').showModal();
                toggleMenu();
              }}
            >
              Book Ambulance
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogIn, Ambulance, Home, Phone, InfoIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleBookAmbulance = () => {
    navigate('/bookAmbulance');
  };

  return (
    <nav className="w-full px-4 py-3 fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white flex items-center space-x-2 transition-transform hover:scale-105">
          <span className="text-3xl">🚑</span> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 font-bold">Ambuk</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-blue-200 transition-colors flex items-center space-x-1">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          
          <Link to="/about" className="text-white hover:text-blue-200 transition-colors flex items-center space-x-1">
            <InfoIcon className="h-4 w-4" />
            <span>About</span>
          </Link>
          
          <Link to="/contact" className="text-white hover:text-blue-200 transition-colors flex items-center space-x-1">
            <Phone className="h-4 w-4" />
            <span>Contact</span>
          </Link>
          
          {!isAuthenticated ? (
            <Link to="/login" className="text-white hover:text-blue-200 transition-colors flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
          ) : (
            <>
              <Link to="/profile" className="text-white hover:text-blue-200 transition-colors">
                My Profile
              </Link>
              <Button 
                variant="outline" 
                onClick={logout} 
                className="text-white border-white hover:bg-white/10"
              >
                Logout
              </Button>
            </>
          )}
          
          <Button 
            variant="secondary" 
            className="bg-white text-blue-700 hover:bg-blue-50 font-medium px-4 py-2 rounded-full flex items-center space-x-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            onClick={handleBookAmbulance}
          >
            <Ambulance className="h-4 w-4" />
            <span>Book Ambulance</span>
          </Button>
          
          <Link to="/driver/login">
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-white/10 flex items-center space-x-1"
            >
              <LogIn className="h-4 w-4" />
              <span>Driver Portal</span>
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-gradient-to-b from-blue-700 to-blue-900 backdrop-blur-lg shadow-lg rounded-b-lg animate-fade-in z-50">
          <div className="flex flex-col items-center py-4 space-y-4 px-4">
            <Link 
              to="/" 
              className="text-white hover:text-blue-200 transition-colors flex items-center space-x-2 w-full px-4 py-2 rounded-lg hover:bg-blue-600/50"
              onClick={toggleMenu}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/about" 
              className="text-white hover:text-blue-200 transition-colors flex items-center space-x-2 w-full px-4 py-2 rounded-lg hover:bg-blue-600/50"
              onClick={toggleMenu}
            >
              <InfoIcon className="h-4 w-4" />
              <span>About</span>
            </Link>
            
            <Link 
              to="/contact" 
              className="text-white hover:text-blue-200 transition-colors flex items-center space-x-2 w-full px-4 py-2 rounded-lg hover:bg-blue-600/50"
              onClick={toggleMenu}
            >
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </Link>
            
            {!isAuthenticated ? (
              <Link 
                to="/login" 
                className="text-white hover:text-blue-200 transition-colors flex items-center space-x-2 w-full px-4 py-2 rounded-lg hover:bg-blue-600/50"
                onClick={toggleMenu}
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/profile" 
                  className="text-white hover:text-blue-200 transition-colors flex items-center space-x-2 w-full px-4 py-2 rounded-lg hover:bg-blue-600/50"
                  onClick={toggleMenu}
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                <Button 
                  variant="outline"
                  onClick={logout}
                  className="text-white border-white hover:bg-white/10 w-full justify-center"
                >
                  Logout
                </Button>
              </>
            )}
            
            <Button 
              variant="secondary" 
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-medium flex items-center space-x-2 justify-center"
              onClick={() => {
                navigate('/bookAmbulance');
                toggleMenu();
              }}
            >
              <Ambulance className="h-4 w-4" />
              <span>Book Ambulance</span>
            </Button>
            
            <Link 
              to="/driver/login"
              onClick={toggleMenu}
              className="w-full"
            >
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white/10 flex items-center space-x-2 w-full justify-center"
              >
                <LogIn className="h-4 w-4" />
                <span>Driver Portal</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

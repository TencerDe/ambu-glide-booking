
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogIn, Ambulance, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleBookAmbulance = () => {
    navigate('/bookAmbulance');
  };

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`w-full px-4 py-3 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md backdrop-blur-lg bg-opacity-80' : 'bg-transparent'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center space-x-2 transition-transform hover:scale-105">
          <span className="text-3xl">🚑</span> 
          <span className={`font-bold ${scrolled ? 'text-blue-600' : 'text-white'}`}>Ambuk</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`transition-colors flex items-center space-x-1 hover:text-blue-500 ${
              scrolled 
                ? (isActive('/') ? 'text-blue-600 font-medium' : 'text-gray-700') 
                : 'text-white'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          
          {!isAuthenticated ? (
            <Link 
              to="/login" 
              className={`transition-colors flex items-center space-x-1 hover:text-blue-500 ${
                scrolled 
                  ? (isActive('/login') ? 'text-blue-600 font-medium' : 'text-gray-700') 
                  : 'text-white'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
          ) : (
            <>
              <Link 
                to="/profile" 
                className={`transition-colors hover:text-blue-500 ${
                  scrolled 
                    ? (isActive('/profile') ? 'text-blue-600 font-medium' : 'text-gray-700') 
                    : 'text-white'
                }`}
              >
                My Profile
              </Link>
              <Button 
                variant="outline" 
                onClick={logout} 
                className={scrolled ? "text-gray-700 border-gray-300 hover:bg-gray-100" : "text-white border-white hover:bg-white/10"}
              >
                Logout
              </Button>
            </>
          )}
          
          <Button 
            variant="default" 
            className={`rounded-full font-medium px-5 py-2 shadow-lg ${
              scrolled 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-white text-blue-700 hover:bg-blue-50"
            } flex items-center space-x-2 hover:-translate-y-0.5 transition-all duration-300`}
            onClick={handleBookAmbulance}
          >
            <Ambulance className="h-4 w-4" />
            <span>Book Ambulance</span>
          </Button>
          
          <Link to="/driver/login">
            <Button 
              variant="outline" 
              className={`rounded-full ${
                scrolled 
                ? "text-blue-600 border-blue-600 hover:bg-blue-50" 
                : "text-white border-white hover:bg-white/10"
              } flex items-center space-x-1`}
            >
              <LogIn className="h-4 w-4" />
              <span>Driver Portal</span>
            </Button>
          </Link>
        </div>

        <button 
          className={`md:hidden ${scrolled ? 'text-gray-700' : 'text-white'}`} 
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg rounded-b-lg animate-fade-in z-50">
          <div className="flex flex-col items-center py-6 space-y-4 px-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2 w-full px-4 py-2 rounded-lg hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            {!isAuthenticated ? (
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2 w-full px-4 py-2 rounded-lg hover:bg-gray-50"
                onClick={toggleMenu}
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2 w-full px-4 py-2 rounded-lg hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50 w-full justify-center"
                >
                  Logout
                </Button>
              </>
            )}
            
            <Button 
              variant="default" 
              className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium flex items-center space-x-2 justify-center rounded-full"
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
                className="text-blue-600 border-blue-600 hover:bg-blue-50 flex items-center space-x-2 w-full justify-center rounded-full"
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

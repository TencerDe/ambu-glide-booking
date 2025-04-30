
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const openBookingModal = () => {
    const modal = document.getElementById('booking-modal') as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
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
          
          {!isAuthenticated ? (
            <>
              <Link to="/user/login" className="text-white hover:text-primary-foreground transition-colors">
                <span className="flex items-center">
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </span>
              </Link>
              <Link to="/signup" className="text-white hover:text-primary-foreground transition-colors">
                Sign Up
              </Link>
              <div className="relative group">
                <button className="text-white hover:text-primary-foreground transition-colors flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Portal Login
                  <span className="ml-1">▾</span>
                </button>
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                  <Link to="/user/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    User Login
                  </Link>
                  <Link to="/driver/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Driver Login
                  </Link>
                  <Link to="/admin/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Admin Login
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              {role === 'user' && (
                <Link to="/profile" className="text-white hover:text-primary-foreground transition-colors">
                  My Profile
                </Link>
              )}
              {role === 'driver' && (
                <Link to="/driver/dashboard" className="text-white hover:text-primary-foreground transition-colors">
                  Driver Dashboard
                </Link>
              )}
              {role === 'admin' && (
                <Link to="/admin/dashboard" className="text-white hover:text-primary-foreground transition-colors">
                  Admin Dashboard
                </Link>
              )}
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="text-white border-white hover:bg-white/10"
              >
                Logout
              </Button>
            </>
          )}
          
          <Button 
            variant="secondary" 
            className="btn-animate"
            onClick={openBookingModal}
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
            
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/user/login" 
                  className="text-white hover:text-primary-foreground transition-colors"
                  onClick={toggleMenu}
                >
                  User Login
                </Link>
                <Link 
                  to="/driver/login" 
                  className="text-white hover:text-primary-foreground transition-colors"
                  onClick={toggleMenu}
                >
                  Driver Login
                </Link>
                <Link 
                  to="/admin/login" 
                  className="text-white hover:text-primary-foreground transition-colors"
                  onClick={toggleMenu}
                >
                  Admin Login
                </Link>
                <Link 
                  to="/signup" 
                  className="text-white hover:text-primary-foreground transition-colors"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {role === 'user' && (
                  <Link 
                    to="/profile" 
                    className="text-white hover:text-primary-foreground transition-colors"
                    onClick={toggleMenu}
                  >
                    My Profile
                  </Link>
                )}
                {role === 'driver' && (
                  <Link 
                    to="/driver/dashboard" 
                    className="text-white hover:text-primary-foreground transition-colors"
                    onClick={toggleMenu}
                  >
                    Driver Dashboard
                  </Link>
                )}
                {role === 'admin' && (
                  <Link 
                    to="/admin/dashboard" 
                    className="text-white hover:text-primary-foreground transition-colors"
                    onClick={toggleMenu}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  className="text-white border-white hover:bg-white/10"
                >
                  Logout
                </Button>
              </>
            )}
            
            <Button 
              variant="secondary" 
              className="btn-animate"
              onClick={() => {
                openBookingModal();
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

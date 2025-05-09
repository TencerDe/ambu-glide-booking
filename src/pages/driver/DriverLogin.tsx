
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { driverService } from '@/services/driverService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LogIn } from 'lucide-react';

const DriverLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as any)?.from?.pathname || '/driver/dashboard';

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role === 'driver') {
      navigate('/driver/dashboard');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Pass username and password as separate arguments to match the function signature
      const response = await driverService.login(formData.username, formData.password);
      
      if (response.success) {
        toast.success(`Welcome, Driver`);
        navigate(from);
      } else {
        toast.error(response.error || 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-20 px-4 gradient-bg">
        <div className="w-full max-w-md glass-effect p-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <LogIn className="text-white mr-2" size={28} />
            <h1 className="text-3xl font-bold text-white text-center">Driver Login</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full py-2 bg-white text-primary hover:bg-white/90 btn-animate"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-white/80">
              Need a user account?{' '}
              <Link to="/login" className="text-white font-semibold hover:underline">
                User Login
              </Link>
            </p>
          </div>
          
          <div className="mt-2 text-center">
            <Link to="/" className="text-white/80 hover:text-white">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DriverLogin;

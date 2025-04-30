
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'user',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // In a real app, this would send data to the backend
    console.log('Login data:', formData);
    toast.success(`Logged in as ${formData.userType === 'user' ? 'User' : 'Admin'}`);
    
    // Redirect based on user type
    if (formData.userType === 'user') {
      window.location.href = '/profile';
    } else {
      window.location.href = '/admin-dashboard';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-20 px-4 gradient-bg">
        <div className="w-full max-w-md glass-effect p-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white text-center mb-6">Sign In</h1>
          
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
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Login As
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="user"
                    checked={formData.userType === 'user'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">User</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="admin"
                    checked={formData.userType === 'admin'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Admin</span>
                </label>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full py-2 bg-white text-primary hover:bg-white/90 btn-animate"
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-white/80">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;

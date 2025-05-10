
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

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
      // For demo purposes, hardcoded credential check
      if (formData.username === "admin@ambuk.com" && formData.password === "admin123") {
        // Create admin user object with proper role
        const adminUser = {
          name: 'Admin',
          email: 'admin@ambuk.com',
          role: 'ADMIN',
          token: 'admin-demo-token'
        };
        
        // Use the googleLogin method from useAuth to properly set authentication state
        await googleLogin(adminUser);
        
        toast.success('Logged in as Admin');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
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
            <ShieldCheck className="text-white mr-2" size={28} />
            <h1 className="text-3xl font-bold text-white text-center">Admin Login</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="bg-white/90"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-white/90"
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
            <div className="mb-2 p-3 bg-blue-100/80 text-blue-800 rounded-md">
              <p className="text-sm font-medium">Demo Credentials:</p>
              <p className="text-sm">Email: admin@ambuk.com</p>
              <p className="text-sm">Password: admin123</p>
            </div>
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

export default AdminLogin;

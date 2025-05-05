
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GoogleLogin from '@/components/GoogleLogin';
import { LogIn } from 'lucide-react';

const Login = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-20 px-4 gradient-bg">
        <div className="w-full max-w-md glass-effect p-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <LogIn className="text-white mr-2" size={28} />
            <h1 className="text-3xl font-bold text-white text-center">Login</h1>
          </div>
          
          <div className="space-y-6">
            <div className="mb-4 text-center text-white">
              <p>Sign in with your Google account to access your profile</p>
            </div>
            
            <GoogleLogin />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-white/70">Or continue without login</span>
              </div>
            </div>
            
            <Link to="/" className="block text-center text-white hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;

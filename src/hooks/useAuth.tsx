
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { 
    name: string; 
    email: string; 
    photoUrl?: string;
    bloodGroup?: string;
    age?: number;
    preferredHospital?: string;
    healthIssues?: string[];
    role?: string; // Role property
  } | null;
  googleLogin: (userData: { name: string; email: string; photoUrl?: string; token?: string; role?: string }) => void;
  logout: () => void;
  updateProfile: (profileData: { 
    bloodGroup?: string;
    age?: number;
    preferredHospital?: string;
    healthIssues?: string[];
  }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const navigate = useNavigate();

  // Check if the user is authenticated on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('Auth initialization:', { hasToken: !!token, hasStoredUser: !!storedUser });
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('User authenticated from storage:', parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const googleLogin = async (userData: { name: string; email: string; photoUrl?: string; token?: string; role?: string }) => {
    try {
      console.log('Logging in with data:', userData);
      
      // Store user in local storage
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Navigate based on role
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const updateProfile = (profileData: {
    bloodGroup?: string;
    age?: number;
    preferredHospital?: string;
    healthIssues?: string[];
  }) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const logout = () => {
    userService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, googleLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

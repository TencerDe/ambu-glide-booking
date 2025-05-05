
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
  } | null;
  googleLogin: (userData: { name: string; email: string; photoUrl?: string; token?: string }) => void;
  login: (email: string, password: string) => Promise<void>; // Added for compatibility
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
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const googleLogin = async (userData: { name: string; email: string; photoUrl?: string; token?: string }) => {
    try {
      // Store user in local storage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/profile');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  // Add regular login method to fix TypeScript errors
  const login = async (email: string, password: string) => {
    // This is a placeholder to fix TypeScript errors
    // Since we're focusing on Google login, this won't be implemented fully
    console.warn("Standard login not implemented - use Google login instead");
    throw new Error("Standard login not implemented");
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
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, googleLogin, login, logout, updateProfile }}>
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


import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { driverNotificationsSocket, userRideSocket } from '@/services/websocketService';

interface AuthContextType {
  user: any;
  login: (email: string, password: string, type: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean; // Added missing property
  googleLogin: (userData: any) => Promise<void>; // Added missing property
  updateProfile: (data: any) => Promise<void>; // Added missing property
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Added state for authentication
  
  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userData');
    const storedRole = localStorage.getItem('role');
    const storedUserId = localStorage.getItem('userId');
    
    console.log('Auth initialization:', {
      hasToken: !!storedToken,
      hasStoredUser: !!storedUser,
      role: storedRole
    });
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true); // Set authentication state
        
        // Initialize WebSocket connection based on role
        if (storedUserId) {
          if (storedRole === 'driver') {
            driverNotificationsSocket.connect(storedUserId);
            console.log('Driver WebSocket reconnected for user:', storedUserId);
          } else {
            userRideSocket.connect(storedUserId);
            console.log('User WebSocket reconnected for user:', storedUserId);
          }
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('userData');
      }
    }
    
    setLoading(false);
  }, []);
  
  const login = async (email: string, password: string, type: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data && data.user) {
        // Determine role based on type parameter
        const role = type.toLowerCase();
        const userId = data.user.id;
        
        // Store auth data
        localStorage.setItem('token', data.session?.access_token || '');
        localStorage.setItem('role', role);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true); // Set authentication state
        
        // Initialize WebSocket connection based on role
        if (role === 'driver') {
          driverNotificationsSocket.connect(userId);
          driverNotificationsSocket.reconnect(); // Force reconnect to ensure connection
          console.log('Driver WebSocket initialized on login for user:', userId);
        } else {
          userRideSocket.connect(userId);
          userRideSocket.reconnect(); // Force reconnect to ensure connection
          console.log('User WebSocket initialized on login for user:', userId);
        }
        
        return { success: true, user: data.user };
      }
      
      return { success: false, message: 'No user data returned' };
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const googleLogin = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const { name, email, photoUrl, token, role = 'user' } = userData;
      const userId = Math.random().toString(36).substring(2, 15);
      
      // Store auth data
      localStorage.setItem('token', token || 'google-auth-token');
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      
      const userObject = {
        id: userId,
        name,
        email,
        photoUrl,
        role
      };
      
      localStorage.setItem('userData', JSON.stringify(userObject));
      
      setUser(userObject);
      setIsAuthenticated(true);
      
      // Initialize WebSocket connection based on role
      if (role === 'driver') {
        driverNotificationsSocket.connect(userId);
        console.log('Driver WebSocket initialized on Google login for user:', userId);
      } else {
        userRideSocket.connect(userId);
        console.log('User WebSocket initialized on Google login for user:', userId);
      }
      
      return { success: true, user: userObject };
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to login with Google');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (profileData: any) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update local user state with new profile data
      const updatedUser = {
        ...user,
        ...profileData
      };
      
      // Store updated user data
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      return { success: true };
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
      return { success: false, message: err.message };
    }
  };
  
  const logout = () => {
    // Disconnect WebSockets
    driverNotificationsSocket.disconnect();
    userRideSocket.disconnect();
    
    // Clear user data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    
    setUser(null);
    setIsAuthenticated(false); // Update authentication state
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      error, 
      isAuthenticated, 
      googleLogin, 
      updateProfile 
    }}>
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

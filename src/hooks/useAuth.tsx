
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'user' | 'driver' | 'admin' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: Role;
  login: (token: string, role: Role) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<Role>(null);
  const navigate = useNavigate();

  // Check if the user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = (): boolean => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role') as Role;
    
    if (token && userRole) {
      setIsAuthenticated(true);
      setRole(userRole);
      return true;
    } else {
      setIsAuthenticated(false);
      setRole(null);
      return false;
    }
  };

  const login = (token: string, userRole: Role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole as string);
    setIsAuthenticated(true);
    setRole(userRole);
    
    // Redirect based on role
    switch (userRole) {
      case 'user':
        navigate('/profile');
        break;
      case 'driver':
        navigate('/driver/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setRole(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout, checkAuth }}>
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

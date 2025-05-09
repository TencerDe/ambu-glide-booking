
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: string; // Add role as an optional prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to the login page with the return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified, check if user has that role
  // Note: This is a simple implementation. You may want to enhance this based on your user role management
  if (role && user?.role !== role) {
    // Redirect to unauthorized page or home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

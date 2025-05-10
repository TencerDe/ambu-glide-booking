
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: string; // Role is an optional prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  // For debugging
  console.log('ProtectedRoute:', { isAuthenticated, userRole: user?.role, requiredRole: role });

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    // Redirect to the login page with the return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified, check if user has that role
  if (role && user?.role !== role) {
    console.log(`User doesn't have required role: ${role}, user role is: ${user?.role}`);
    // Redirect to unauthorized page or home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

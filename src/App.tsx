
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Profile from './pages/Profile';
import BookAmbulance from './pages/BookAmbulance';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import DriverLogin from './pages/driver/DriverLogin';
import DriverDashboard from './pages/driver/DriverDashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { initTestDriver } from './services/initTestDriver';
import { driverNotificationsSocket, userRideSocket } from './services/websocketService';

function App() {
  useEffect(() => {
    // Initialize test data
    const setupTestData = async () => {
      try {
        await initTestDriver();
      } catch (error) {
        console.error("Error setting up test data:", error);
      }
    };
    
    setupTestData();
    
    // Initialize WebSocket connections if user is logged in
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    
    if (userId) {
      if (role === 'driver') {
        // Connect driver notifications socket
        driverNotificationsSocket.connect(userId);
        console.log('Driver WebSocket initialized for user:', userId);
      } else {
        // Connect user ride status socket
        userRideSocket.connect(userId);
        console.log('User WebSocket initialized for user:', userId);
      }
    }
    
    // Cleanup function
    return () => {
      driverNotificationsSocket.disconnect();
      userRideSocket.disconnect();
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/bookAmbulance" element={<BookAmbulance />} />
            <Route path="/book-ambulance" element={<BookAmbulance />} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Driver Routes */}
            <Route path="/driver" element={<Navigate to="/driver/login" replace />} />
            <Route path="/driver/login" element={<DriverLogin />} />
            <Route path="/driver/dashboard" element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

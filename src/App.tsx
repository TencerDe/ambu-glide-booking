
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './hooks/useAuth';

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
  }, []);

  return (
    <AuthProvider>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/bookAmbulance" element={<BookAmbulance />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Driver Routes */}
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/driver/dashboard/*" element={
            <ProtectedRoute role="driver">
              <DriverDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

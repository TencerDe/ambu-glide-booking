
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Define the window object with google property for TypeScript
declare global {
  interface Window {
    google: any;
    googleOneTapCallback: (response: any) => void;
  }
}

const GoogleLogin: React.FC = () => {
  const { googleLogin } = useAuth();
  
  useEffect(() => {
    // Initialize Google OAuth
    const loadGoogleScript = () => {
      // Load the Google Sign-In API script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      // Initialize callback function for Google Sign-In
      window.googleOneTapCallback = async (response: any) => {
        try {
          const { credential } = response;
          
          // Process the token and get user information
          const userData = await processGoogleToken(credential);
          await googleLogin(userData);
          toast.success('Successfully logged in with Google');
        } catch (error) {
          console.error('Google login error:', error);
          toast.error('Failed to login with Google');
        }
      };
    };
    
    loadGoogleScript();
    
    // Initialize Google Sign-In button
    const initializeGoogleButton = () => {
      if (window.google && document.getElementById('google-login-button')) {
        window.google.accounts.id.initialize({
          client_id: '1064750047944-00ga6vodnm7j6mpk1q9j9erhddtqj329.apps.googleusercontent.com',
          callback: window.googleOneTapCallback,
          auto_select: false,
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById('google-login-button'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      } else {
        // If Google API is not loaded yet, retry after a delay
        setTimeout(initializeGoogleButton, 100);
      }
    };
    
    // Call initialize after a short delay to ensure DOM is ready
    setTimeout(initializeGoogleButton, 300);
    
    // Cleanup
    return () => {
      window.googleOneTapCallback = () => {};
    };
  }, [googleLogin]);
  
  // Function to process Google token and extract user information
  const processGoogleToken = async (token: string) => {
    try {
      // Decode the JWT token to get user information
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const { name, email, picture } = JSON.parse(jsonPayload);
      
      return { 
        name, 
        email, 
        photoUrl: picture,
        token
      };
    } catch (error) {
      console.error('Error processing Google token:', error);
      throw new Error('Failed to process Google authentication');
    }
  };
  
  return (
    <div className="w-full">
      <div id="google-login-button" className="w-full"></div>
    </div>
  );
};

export default GoogleLogin;

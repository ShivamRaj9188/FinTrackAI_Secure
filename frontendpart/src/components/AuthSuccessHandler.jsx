import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccessHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    
    console.log('🔍 AuthSuccessHandler checking:', {
      hasToken: !!token,
      hasUser: !!userStr,
      currentPath: location.pathname,
      fullURL: window.location.href
    });
    
    // If we have auth parameters, handle the authentication
    if (token && userStr) {
      setIsProcessing(true);
      console.log('🚀 Processing Google OAuth authentication...');
      
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        console.log('👤 User data:', user);
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userInfo', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          plan: user.plan || 'Basic',
          isVerified: user.isVerified !== false
        }));
        
        console.log('✅ Auth data stored successfully');
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('userLogin', { detail: user }));
        
        // Clean the URL and redirect
        const targetPath = location.pathname === '/' ? '/dashboard' : location.pathname;
        
        setTimeout(() => {
          // Use replace to clean the URL and navigate
          navigate(targetPath, { replace: true });
          setIsProcessing(false);
        }, 1500);
        
        return;
      } catch (error) {
        console.error('❌ Auth processing error:', error);
        setIsProcessing(false);
        // Show error and redirect to login
        setTimeout(() => {
          alert('Authentication failed. Please try again.');
          navigate('/login');
        }, 1000);
        return;
      }
    }
  }, [location, navigate]);
  
  const params = new URLSearchParams(location.search);
  const hasAuthParams = params.get('token') && params.get('user');
  
  // Show loading screen during authentication
  if (hasAuthParams || isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to FinTrackAI!</h2>
          <p className="text-gray-600 mb-6">Completing your sign in...</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Authentication verified</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Setting up your dashboard</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

export default AuthSuccessHandler;
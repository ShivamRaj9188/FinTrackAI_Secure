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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[var(--bg-secondary)] border border-white/[0.06] p-10 rounded-3xl shadow-2xl text-center max-w-md w-full mx-4 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[var(--accent-primary)] opacity-10 blur-[50px] rounded-full"></div>
          
          <div className="relative z-10 w-16 h-16 flex items-center justify-center mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-white/5 border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full flex items-center justify-center opacity-20"></div>
            <span className="text-white font-black text-sm">F</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Welcome to FinTrackAI</h2>
          <p className="text-[#888] text-sm mb-8 relative z-10">Completing your secure sign in...</p>
          
          <div className="space-y-3 text-xs text-[#555] font-medium relative z-10 bg-white/[0.02] rounded-xl p-4 border border-white/[0.03]">
            <div className="flex items-center justify-center gap-3">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
              <span>Authentication verified</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-pulse shadow-[0_0_8px_var(--accent-primary)]"></div>
              <span className="text-white">Setting up your dashboard</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

export default AuthSuccessHandler;
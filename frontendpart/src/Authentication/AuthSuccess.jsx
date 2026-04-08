import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store auth token with proper user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userInfo', JSON.stringify({
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          plan: user.plan || 'Basic'
        }));

        // Dispatch custom event to notify Header component
        window.dispatchEvent(new CustomEvent('userLogin'));

        // Get redirect URL or default to dashboard
        const redirectUrl = localStorage.getItem('loginRedirectUrl') || '/dashboard';
        localStorage.removeItem('loginRedirectUrl');

        // Delay slightly for smooth transition
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1500);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate, location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent-primary)] opacity-[0.05] blur-[120px]"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Shimmering Logo */}
        <div className="flex items-center gap-3 mb-10 animate-scale-in">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00D1FF]/20">
            <span className="text-black font-black text-xl">F</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">FinTrackAI</span>
        </div>

        {/* Custom Premium Spinner */}
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 border-4 border-white/[0.03] rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-[var(--accent-primary)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-t-transparent border-r-[var(--accent-secondary)] border-b-transparent border-l-transparent rounded-full animate-spin-slow" style={{ animationDuration: '2s' }}></div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold gradient-text animate-pulse">Synchronizing Security...</h2>
          <p className="text-xs font-bold text-[#444] uppercase tracking-[0.2em]">Preparing your dashboard</p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 text-[10px] font-bold text-[#222] uppercase tracking-widest">
        Secure Financial Intelligence
      </div>
    </div>
  );
};

export default AuthSuccess;
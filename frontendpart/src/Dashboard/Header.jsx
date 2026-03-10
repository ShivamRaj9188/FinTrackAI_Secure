import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../api';

const Header = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(() => {
    // Try to get user data from localStorage first for immediate display
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsed = JSON.parse(storedUserInfo);
        return {
          name: parsed.name || 'User',
          email: parsed.email || 'user@fintrackai.com',
          plan: parsed.plan || 'Basic'
        };
      } catch {
        // Fall back to defaults if JSON parsing fails
      }
    }
    return {
      name: 'User',
      email: 'user@fintrackai.com',
      plan: 'Basic'
    };
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          // No token, reset to defaults
          setUserData({
            name: 'User',
            email: 'user@fintrackai.com'
          });
          return;
        }

        const result = await getUserProfile();
        if (result.success && result.data) {
          const newUserData = {
            name: result.data.name || 'User',
            email: result.data.email || 'user@fintrackai.com',
            plan: result.data.plan || 'Basic'
          };
          setUserData(newUserData);
          
          // Update localStorage for immediate access next time
          localStorage.setItem('userInfo', JSON.stringify(newUserData));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Keep default values if API fails
      }
    };

    loadUserData();

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          // User logged in, reload data immediately
          setTimeout(loadUserData, 200);
        } else {
          // User logged out, reset to defaults
          setUserData({
            name: 'User',
            email: 'user@fintrackai.com'
          });
        }
      }
    };

    // Listen for custom events from login/signup
    const handleUserLogin = () => {
      setTimeout(loadUserData, 300); // Increased delay to ensure token and data are ready
    };

    // Listen for focus events (when user comes back to tab)
    const handleWindowFocus = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('#dropdownButton') && !event.target.closest('#dropdownMenu')) {
        setIsDropdownOpen(false);
      }
      if (!event.target.closest('#dropdownButtonMobile') && !event.target.closest('#dropdownMenuMobile')) {
        setIsMobileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userData]); // Add userData as dependency

  const currentPath = window.location.pathname;

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-slate-900">FinTrackAI</span>
            </div>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-4 ml-8">
            <Link to="/dashboard" className={`hover:text-blue-400 px-3 py-2 rounded-lg ${currentPath.includes('dashboard') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Dashboard</Link>
            <Link to="/transaction" className={`hover:text-blue-400 px-3 py-2 rounded-lg ${currentPath.includes('transaction') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Transactions</Link>
            <Link to="/upload" className={`hover:text-blue-400 px-3 py-2 rounded-lg ${currentPath.includes('upload') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Upload</Link>
            <Link to="/insights" className={`hover:text-blue-400 px-3 py-2 rounded-lg ${currentPath.includes('insights') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>AI Insights</Link>
            <Link to="/reports" className={`hover:text-blue-400 px-3 py-2 rounded-lg ${currentPath.includes('reports') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Reports</Link>
          </nav>
          {/* Hamburger (mobile) */}
          <button
            id="hamburger"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          >
            <i className="fa-solid fa-bars text-2xl text-gray-700"></i>
          </button>
          {/* User Dropdown (desktop) */}
          <div className="hidden md:flex items-center relative">
            <button
              id="dropdownButton"
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full focus:outline-none shadow-lg transition-transform duration-200 hover:scale-105"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" fill="none" />
                <path stroke="white" strokeWidth="2" d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" />
              </svg>
            </button>
            <div
              id="dropdownMenu"
              className={`absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 z-50 flex flex-col items-center py-4 ${
                isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <span className="block px-4 py-2 text-gray-300 rounded-full w-full max-w-48 text-center font-semibold truncate">{userData.name}</span>
              <span className="block px-4 py-2 text-gray-400 rounded-full w-full max-w-48 text-center text-sm truncate">{userData.email}</span>
              <Link to="/userdashboard" className={`block px-4 py-2 ${currentPath.includes('userdashboard') ? 'text-blue-400 font-semibold' : 'text-gray-300'} hover:bg-gray-700 rounded-full w-full max-w-48 text-center`}>My profile</Link>
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Scroll to pricing section in dashboard
                  if (window.location.pathname === '/dashboard') {
                    // If already on dashboard, trigger pricing display
                    const event = new CustomEvent('showPricing');
                    window.dispatchEvent(event);
                  } else {
                    // Navigate to dashboard with pricing parameter
                    window.location.href = '/dashboard?showPricing=true';
                  }
                }}
                className="block px-4 py-2 text-green-400 hover:bg-gray-700 rounded-full w-full max-w-48 text-center"
              >
                {userData.plan === 'Pro' ? '🚀 Upgrade to Enterprise' : '⭐ Upgrade to Pro'}
              </button>
              <Link to="/" className="block px-4 py-2 text-red-400 hover:bg-gray-700 rounded-full w-full max-w-48 text-center">Sign out</Link>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Nav & User */}
      <div id="mobileNav" className={`md:hidden ${isMobileNavOpen ? 'flex' : 'hidden'} animate-fade-in-down`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center w-full py-4">
            <nav className="flex flex-col space-y-2 w-full mt-2">
              <Link to="/dashboard" className={`hover:text-blue-400 block px-4 py-2 rounded-lg ${currentPath.includes('dashboard') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Dashboard</Link>
              <Link to="/transaction" className={`hover:text-blue-400 block px-4 py-2 rounded-lg ${currentPath.includes('transaction') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Transactions</Link>
              <Link to="/upload" className={`hover:text-blue-400 block px-4 py-2 rounded-lg ${currentPath.includes('upload') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Upload</Link>
              <Link to="/insights" className={`hover:text-blue-400 block px-4 py-2 rounded-lg ${currentPath.includes('insights') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>AI Insights</Link>
              <Link to="/reports" className={`hover:text-blue-400 block px-4 py-2 rounded-lg ${currentPath.includes('reports') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Reports</Link>
            </nav>
            <div className="flex justify-center mt-4">
              <button
                id="dropdownButtonMobile"
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full focus:outline-none shadow-lg transition-transform duration-200 hover:scale-105"
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" fill="none" />
                  <path stroke="white" strokeWidth="2" d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" />
                </svg>
              </button>
            </div>
            <div
              id="dropdownMenuMobile"
              className={`w-full max-w-xs mx-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 z-50 flex flex-col items-center py-4 mt-2 ${
                isMobileDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <span className="block px-4 py-2 text-gray-300 rounded-full w-full text-center font-semibold truncate">{userData.name}</span>
              <span className="block px-4 py-2 text-gray-400 rounded-full w-full text-center text-sm truncate">{userData.email}</span>
              <Link to="/userdashboard" className={`block px-4 py-2 ${currentPath.includes('userdashboard') ? 'text-blue-400 font-semibold' : 'text-gray-300'} hover:bg-gray-700 rounded-full w-full text-center`}>My profile</Link>
              <button 
                onClick={() => {
                  setIsMobileDropdownOpen(false);
                  setIsMobileNavOpen(false);
                  // Scroll to pricing section in dashboard
                  if (window.location.pathname === '/dashboard') {
                    // If already on dashboard, trigger pricing display
                    const event = new CustomEvent('showPricing');
                    window.dispatchEvent(event);
                  } else {
                    // Navigate to dashboard with pricing parameter
                    window.location.href = '/dashboard?showPricing=true';
                  }
                }}
                className="block px-4 py-2 text-green-400 hover:bg-gray-700 rounded-full w-full text-center"
              >
                {userData.plan === 'Pro' ? '🚀 Upgrade to Enterprise' : '⭐ Upgrade to Pro'}
              </button>
              <Link to="/" className="block px-4 py-2 text-red-400 hover:bg-gray-700 rounded-full w-full text-center">Sign out</Link>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease; }
      `}</style>
    </header>
  );
};

export default Header;
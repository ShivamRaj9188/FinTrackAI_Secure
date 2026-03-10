// Utility to check if user is still active
export const checkUserStatus = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // User is inactive or token is invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userEmail');
      
      // Show message and redirect to login
      alert('🚫 ACCOUNT DEACTIVATED\n\nYour account has been deactivated by admin.\nPlease contact admin@fintrackai.com to reactivate your account.');
      window.location.href = '/login';
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

// Auto-check user status every 30 seconds
export const startAuthMonitoring = () => {
  setInterval(checkUserStatus, 30000);
};
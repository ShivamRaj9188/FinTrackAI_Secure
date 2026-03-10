// Google Auth Helper for Frontend Integration
const handleGoogleAuth = () => {
  const backendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://fintrackai.onrender.com' 
    : 'http://localhost:8000';
    
  // Open Google Auth popup
  const popup = window.open(
    `${backendUrl}/api/auth/google`,
    'google-auth',
    'width=500,height=600,scrollbars=yes,resizable=yes'
  );
  
  // Listen for auth success message
  const messageListener = (event) => {
    if (event.origin !== backendUrl) return;
    
    if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
      // Store token and user data
      localStorage.setItem('token', event.data.token);
      localStorage.setItem('user', JSON.stringify(event.data.user));
      
      // Close popup and redirect
      popup.close();
      window.location.href = '/dashboard';
      
      // Cleanup
      window.removeEventListener('message', messageListener);
    }
  };
  
  window.addEventListener('message', messageListener);
  
  // Handle popup closed manually
  const checkClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkClosed);
      window.removeEventListener('message', messageListener);
    }
  }, 1000);
};

export { handleGoogleAuth };
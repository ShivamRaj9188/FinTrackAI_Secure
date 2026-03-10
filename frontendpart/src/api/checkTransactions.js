// Function to check if user has transactions and redirect if needed
export const checkUserTransactions = async (navigate) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Not logged in, redirect to login
      navigate('/login');
      return false;
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!data.success && data.noTransactions) {
      // User has no transactions, redirect to upload page
      navigate('/upload', { 
        state: { 
          message: 'Please upload your bank statement or transactions to continue.',
          severity: 'info'
        } 
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking transactions:', error);
    return true; // Continue anyway on error
  }
};
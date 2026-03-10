// Main API exports - Import all API functions from here
export * from './config.js';
export * from './auth.js';
export * from './upload.js';
export * from './admin.js';
export * from './contact.js';

// Import dashboard functions with specific names to avoid conflicts
export { 
  getDashboardStats, 
  getDashboardData,
  getTransactions,
  addTransaction,  
  getInsights,
  getCategories,
  getDashboardAdminStats,
  getDashboardAllUsers,
  updateDashboardUserStatus,
  deleteUserFromDashboard,
  getDashboardSystemHealth,
  updateDashboardProfile  
} from './dashboard.js';

// Import user functions (these are the ones used by UserDashboard)
export * from './user.js';

// Location functions
export { searchCities, getPopularCities } from './location.js';

// Error handling utility
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // Token expired or invalid
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  }
  
  if (error.message.includes('403') || error.message.includes('Forbidden')) {
    return 'You don\'t have permission to perform this action.';
  }
  
  if (error.message.includes('404') || error.message.includes('Not Found')) {
    return 'Requested resource not found.';
  }
  
  if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Network status check
export const checkNetworkStatus = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch {
    return false;
  }
};

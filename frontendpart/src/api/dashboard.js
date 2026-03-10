import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders } from './config.js';

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: {
        ...getDefaultHeaders(),
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch dashboard stats');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      message: 'Dashboard stats fetched successfully'
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch dashboard stats'
    };
  }
};

// Update user profile (dashboard version)
export const updateDashboardProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/dashboard/profile`, {
      method: 'PUT',
      headers: {
        ...getDefaultHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.user,
      message: result.message || 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update profile'
    };
  }
};

// Alias for backward compatibility
export const getDashboardData = getDashboardStats;

// Get transactions
export const getTransactions = async (page = 1, limit = 10, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TRANSACTIONS}?${queryParams}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch transactions');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.transactions,
      pagination: result.pagination,
      total: result.total,
      message: 'Transactions fetched successfully'
    };
  } catch (error) {
    console.error('Transactions fetch error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch transactions'
    };
  }
};

// Add new transaction
export const addTransaction = async (transactionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TRANSACTIONS}`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(transactionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add transaction');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.transaction,
      message: 'Transaction added successfully'
    };
  } catch (error) {
    console.error('Add transaction error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to add transaction'
    };
  }
};

// Get insights and analytics
export const getInsights = async (dateRange = '30d') => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.INSIGHTS}?range=${dateRange}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch insights');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      message: 'Insights fetched successfully'
    };
  } catch (error) {
    console.error('Insights fetch error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch insights'
    };
  }
};

// Get spending categories
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch categories');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.categories,
      message: 'Categories fetched successfully'
    };
  } catch (error) {
    console.error('Categories fetch error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch categories'
    };
  }
};

// Admin APIs (Dashboard-specific implementations)
export const getDashboardAdminStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_STATS}`, {
      method: 'GET',
      headers: {
        ...getDefaultHeaders(),
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch admin stats');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      message: 'Admin stats fetched successfully'
    };
  } catch (error) {
    console.error('Admin stats error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch admin stats'
    };
  }
};

// Get all users (Admin only)
export const getDashboardAllUsers = async (page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_USERS}?${queryParams}`, {
      method: 'GET',
      headers: {
        ...getDefaultHeaders(),
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.users,
      pagination: result.pagination,
      total: result.total,
      message: 'Users fetched successfully'
    };
  } catch (error) {
    console.error('Users fetch error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch users'
    };
  }
};

// Update user status (Admin only)
export const updateDashboardUserStatus = async (userId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_USERS}/${userId}/status`, {
      method: 'PUT',
      headers: {
        ...getDefaultHeaders(),
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user status');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      message: 'User status updated successfully'
    };
  } catch (error) {
    console.error('User status update error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update user status'
    };
  }
};

// Delete user from dashboard (Admin only)
export const deleteUserFromDashboard = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_USERS}/${userId}`, {
      method: 'DELETE',
      headers: {
        ...getDefaultHeaders(),
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      message: 'User deleted successfully'
    };
  } catch (error) {
    console.error('User deletion error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete user'
    };
  }
};

// Get system health (Admin only)
export const getDashboardSystemHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SYSTEM_HEALTH}`, {
      method: 'GET',
      headers: {
        ...getDefaultHeaders(),
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch system health');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      message: 'System health fetched successfully'
    };
  } catch (error) {
    console.error('System health error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch system health'
    };
  }
};

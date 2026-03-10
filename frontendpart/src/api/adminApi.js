// Admin API functions

export const getAdminStats = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Get admin stats error:', error);
    return { success: false, message: error.message || 'Failed to get admin stats' };
  }
};

export const getAllUsers = async (page = 1, limit = 10, search = '') => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/users?page=${page}&limit=${limit}&search=${search}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Get all users error:', error);
    return { success: false, message: error.message || 'Failed to get users' };
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/users/${userId}/status`, 
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Update user status error:', error);
    return { success: false, message: error.message || 'Failed to update user status' };
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/users/${userId}`, 
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: error.message || 'Failed to delete user' };
  }
};

export const createUser = async (userData) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/users`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, message: error.message || 'Failed to create user' };
  }
};

export const getUserGrowthData = async (period = 'monthly') => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/analytics/user-growth?period=${period}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Get user growth data error:', error);
    return { success: false, message: error.message || 'Failed to get user growth data' };
  }
};

export const sendNotification = async (notificationData) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/notification`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Send notification error:', error);
    return { success: false, message: error.message || 'Failed to send notification' };
  }
};

export const toggleMaintenanceMode = async (enabled) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/maintenance`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    return { success: false, message: error.message || 'Failed to toggle maintenance mode' };
  }
};

export const getContactMessages = async (filters = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.department) queryParams.append('department', filters.department);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.search) queryParams.append('search', filters.search);
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/contacts?${queryParams.toString()}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Get contact messages error:', error);
    return { success: false, message: error.message || 'Failed to get contact messages' };
  }
};

export const getContactStats = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/contacts/stats`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Get contact stats error:', error);
    return { success: false, message: error.message || 'Failed to get contact stats' };
  }
};

export const updateContactMessage = async (contactId, updateData) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/contacts/${contactId}`, 
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Update contact message error:', error);
    return { success: false, message: error.message || 'Failed to update contact message' };
  }
};

export const sendContactResponse = async (contactId, message) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/contacts/${contactId}/respond`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Send contact response error:', error);
    return { success: false, message: error.message || 'Failed to send contact response' };
  }
};

export const deleteContactMessage = async (contactId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/contacts/${contactId}`, 
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Delete contact message error:', error);
    return { success: false, message: error.message || 'Failed to delete contact message' };
  }
};
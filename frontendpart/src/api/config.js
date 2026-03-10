// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.vite_api_url || 'https://fintrackai.onrender.com/api';

console.log('API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  vite_api_url: import.meta.env.vite_api_url,
  API_BASE_URL: API_BASE_URL
});

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  VERIFY_TOKEN: '/auth/verify',
  
  // User Management
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/update',
  DELETE_ACCOUNT: '/user/delete',
  
  // File Upload & Processing
  UPLOAD_FILE: '/upload/file',
  PROCESS_FILE: '/upload/process',
  GET_UPLOAD_STATUS: '/upload/status',
  
  // Reports & Analytics
  GENERATE_REPORT: '/reports/generate',
  GET_REPORTS: '/reports/list',
  DOWNLOAD_REPORT: '/reports/download',
  DELETE_REPORT: '/reports/delete',
  
  // Dashboard Data
  DASHBOARD_STATS: '/dashboard/stats',
  TRANSACTIONS: '/transactions',
  INSIGHTS: '/dashboard/insights',
  CATEGORIES: '/dashboard/categories',
  
  // Admin
  ADMIN_USERS: '/admin/users',
  ADMIN_STATS: '/admin/statistics',
  ADMIN_REPORTS: '/admin/reports',
  SYSTEM_HEALTH: '/admin/health'
};

// Default headers
export const getDefaultHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// File upload headers
export const getFileUploadHeaders = (includeAuth = true) => {
  const headers = {};
  
  if (includeAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: getDefaultHeaders(options.includeAuth !== false),
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      // Try to get error message from response body first
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (parseError) {
        // If we can't parse the error, use default message
        console.warn('Could not parse error response:', parseError);
      }
      
      // Handle different HTTP status codes
      if (response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden');
      }
      
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      
      if (response.status >= 500) {
        throw new Error('Server error occurred');
      }
      
      // For client errors (400-499), return structured error instead of throwing
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          message: errorMessage,
          status: response.status,
          error: errorData
        };
      }
      
      throw new Error(errorMessage);
    }

    // Handle different content types
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    if (contentType && contentType.includes('text/')) {
      return await response.text();
    }
    
    return await response.blob();
    
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// API request function for file uploads
export const apiFileUpload = async (endpoint, formData, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    method: 'POST',
    headers: getFileUploadHeaders(options.includeAuth !== false),
    body: formData,
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('File Upload Error:', error);
    throw error;
  }
};

export { API_BASE_URL };

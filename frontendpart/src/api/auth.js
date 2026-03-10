import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders } from './config.js';

// User login
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: getDefaultHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const result = await response.json();
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userInfo', JSON.stringify(result.user));
    }

    return {
      success: true,
      data: result,
      token: result.token,
      user: result.user,
      message: result.message || 'Login successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to login'
    };
  }
};

// User registration
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: getDefaultHeaders(false),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const result = await response.json();
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userInfo', JSON.stringify(result.user));
    }

    return {
      success: true,
      data: result,
      token: result.token,
      user: result.user,
      message: result.message || 'Registration successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to register'
    };
  }
};

// Admin login
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: getDefaultHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Admin login failed');
    }

    const result = await response.json();
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userInfo', JSON.stringify({
        ...result.user,
        role: 'admin'
      }));
    }

    return {
      success: true,
      data: result,
      token: result.token,
      admin: result.admin,
      message: result.message || 'Admin login successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to login as admin'
    };
  }
};

// Logout
export const logout = async () => {
  try {
    await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
      method: 'POST',
      headers: getDefaultHeaders(),
    });
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }
};

// Verify token validity
export const verifyToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      throw new Error('Token is invalid');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      valid: result.valid,
      user: result.user
    };
  } catch (error) {
    return {
      success: false,
      valid: false,
      error: error.message
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

// Get current user info from localStorage
export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// Get current admin info from localStorage
export const getCurrentAdmin = () => {
  const adminInfo = localStorage.getItem('adminInfo');
  return adminInfo ? JSON.parse(adminInfo) : null;
};

import {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  getApiBaseCandidates,
  getDefaultHeaders
} from './config.js';

const parseJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const shouldRetryWithAnotherBase = (response) => {
  if (!response) {
    return true;
  }

  return response.status === 404 || response.status >= 500;
};

const performAuthRequest = async (endpoint, body) => {
  const apiBaseCandidates = getApiBaseCandidates();
  let lastError = new Error('Authentication service is unavailable right now');

  for (let index = 0; index < apiBaseCandidates.length; index += 1) {
    const apiBase = apiBaseCandidates[index];

    try {
      const response = await fetch(buildApiUrl(apiBase, endpoint), {
        method: 'POST',
        headers: getDefaultHeaders(false),
        body: JSON.stringify(body),
      });

      const result = await parseJsonResponse(response);

      if (!response.ok) {
        const error = new Error(result?.message || 'Authentication failed');

        if (index < apiBaseCandidates.length - 1 && shouldRetryWithAnotherBase(response)) {
          lastError = error;
          continue;
        }

        error.retryable = false;
        throw error;
      }

      return result;
    } catch (error) {
      lastError = error;

      if (error.retryable === false || index === apiBaseCandidates.length - 1) {
        throw error;
      }
    }
  }

  throw lastError;
};

// User login
export const login = async (email, password) => {
  try {
    const result = await performAuthRequest(API_ENDPOINTS.LOGIN, { email, password });
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
      message: error.message || 'Failed to login'
    };
  }
};

// User registration
export const register = async (userData) => {
  try {
    const result = await performAuthRequest(API_ENDPOINTS.REGISTER, userData);
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
      message: error.message || 'Failed to register'
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
  } catch {
    // Local auth state should still be cleared even if the backend logout call fails.
  }

  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminInfo');

  return {
    success: true,
    message: 'Logged out successfully'
  };
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

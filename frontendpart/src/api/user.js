import { apiRequest } from './config.js';

// User Profile Management
export const getUserProfile = async () => {
  return apiRequest('/user/profile', {
    method: 'GET'
  });
};

export const updateUserProfile = async (profileData) => {
  return apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

export const uploadProfileImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('profileImage', imageFile);
  
  return apiRequest('/user/profile/image', {
    method: 'POST',
    body: formData,
    headers: {} // Remove content-type header to let browser set it for FormData
  });
};

export const deleteUserAccount = async () => {
  return apiRequest('/user/account', {
    method: 'DELETE'
  });
};

export const verifyUserAccount = async (verificationCode) => {
  return apiRequest('/user/verify', {
    method: 'POST',
    body: JSON.stringify({ verificationCode })
  });
};

export const requestAccountVerification = async () => {
  return apiRequest('/user/verify/request', {
    method: 'POST'
  });
};

export const changePassword = async (currentPassword, newPassword) => {
  return apiRequest('/user/password/change', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  });
};

export const resetPassword = async (email) => {
  return apiRequest('/user/password/reset', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

// User Preferences
export const getUserPreferences = async () => {
  return apiRequest('/user/preferences', {
    method: 'GET'
  });
};

export const updateUserPreferences = async (preferences) => {
  return apiRequest('/user/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences)
  });
};

// User Dashboard Stats
export const getUserStats = async () => {
  return apiRequest('/user/stats', {
    method: 'GET'
  });
};

export const getUserActivity = async (limit = 10) => {
  return apiRequest(`/user/activity?limit=${limit}`, {
    method: 'GET'
  });
};

// Newsletter subscription
export const subscribeNewsletter = async (emailData) => {
  return apiRequest('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};

// Unsubscribe from newsletter
export const unsubscribeNewsletter = async (emailData) => {
  return apiRequest('/newsletter/unsubscribe', {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};

// Get newsletter subscribers (admin only)
export const getNewsletterSubscribers = async (page = 1, limit = 10, active = true) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    active: active.toString()
  });
  
  return apiRequest(`/newsletter/subscribers?${params}`, {
    method: 'GET'
  });
};

// Send contact message (legacy function - use sendContactMessage from contact.js instead)
export const sendUserContactMessage = async (messageData) => {
  return apiRequest('/contact/send', {
    method: 'POST',
    body: JSON.stringify(messageData)
  });
};

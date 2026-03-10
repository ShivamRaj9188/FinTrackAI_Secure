import { apiRequest } from './config.js';

// Admin Dashboard Statistics
export const getAdminStats = async () => {
  return apiRequest('/admin/stats', {
    method: 'GET'
  });
};

// User Management
export const getAllUsers = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search })
  });
  
  return apiRequest(`/admin/users?${params}`, {
    method: 'GET'
  });
};

export const getUserById = async (userId) => {
  return apiRequest(`/admin/users/${userId}`, {
    method: 'GET'
  });
};

export const updateUserStatus = async (userId, status) => {
  return apiRequest(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

export const deleteUser = async (userId) => {
  return apiRequest(`/admin/users/${userId}`, {
    method: 'DELETE'
  });
};

export const createUser = async (userData) => {
  return apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const updateUser = async (userId, userData) => {
  return apiRequest(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
};

// Analytics
export const getAnalytics = async (timeRange = '7d') => {
  return apiRequest(`/admin/analytics?timeRange=${timeRange}`, {
    method: 'GET'
  });
};

export const getUserGrowthData = async (period = 'monthly') => {
  return apiRequest(`/admin/analytics/user-growth?period=${period}`, {
    method: 'GET'
  });
};

export const getRevenueAnalytics = async () => {
  return apiRequest('/admin/analytics/revenue', {
    method: 'GET'
  });
};

export const getUserEngagement = async () => {
  return apiRequest('/admin/analytics/engagement', {
    method: 'GET'
  });
};

// Reports
export const generateUserReport = async (format = 'csv') => {
  return apiRequest(`/admin/reports/users?format=${format}`, {
    method: 'GET'
  });
};

export const generateAnalyticsReport = async (format = 'pdf') => {
  return apiRequest(`/admin/reports/analytics?format=${format}`, {
    method: 'GET'
  });
};

export const generateRevenueReport = async (format = 'excel') => {
  return apiRequest(`/admin/reports/revenue?format=${format}`, {
    method: 'GET'
  });
};

// Announcements
export const getAnnouncements = async () => {
  return apiRequest('/admin/announcements', {
    method: 'GET'
  });
};

export const createAnnouncement = async (announcementData) => {
  return apiRequest('/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(announcementData)
  });
};

export const updateAnnouncement = async (announcementId, announcementData) => {
  return apiRequest(`/admin/announcements/${announcementId}`, {
    method: 'PUT',
    body: JSON.stringify(announcementData)
  });
};

export const deleteAnnouncement = async (announcementId) => {
  return apiRequest(`/admin/announcements/${announcementId}`, {
    method: 'DELETE'
  });
};



// Quick Actions
export const exportData = async (dataType, format = 'csv') => {
  return apiRequest(`/admin/export/${dataType}?format=${format}`, {
    method: 'GET'
  });
};

export const sendNotification = async (notificationData) => {
  return apiRequest('/admin/notification', {
    method: 'POST',
    body: JSON.stringify(notificationData)
  });
};

export const toggleMaintenanceMode = async (enabled) => {
  return apiRequest('/admin/maintenance', {
    method: 'POST',
    body: JSON.stringify({ enabled })
  });
};

// Newsletter Management
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

export const exportNewsletterSubscribers = async (format = 'csv') => {
  return apiRequest(`/admin/newsletter/export?format=${format}`, {
    method: 'GET'
  });
};

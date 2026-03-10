
// Simple contact API stub to fix Vite import error
// (Removed duplicate sendContactMessage to avoid redeclaration error)

// Removed duplicate getContactMessages to avoid redeclaration error


export async function sendEmailResponse(id, data, token) {
  const response = await fetch(`http://localhost:8000/api/admin/contacts/${id}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return response.json();
}

import { API_BASE_URL, getDefaultHeaders } from './config.js';

// Make API request with error handling
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: getDefaultHeaders(),
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
};

// Send contact form message
export const sendContactMessage = async (contactData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contact/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to send message'
    };
  }
};

// Admin contact management functions

// Get all contact messages with pagination and filters
export const getContactMessages = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.department) queryParams.append('department', filters.department);
  if (filters.priority) queryParams.append('priority', filters.priority);
  if (filters.search) queryParams.append('search', filters.search);

  const url = `/admin/contacts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiRequest(url, { method: 'GET' });
};

// Get contact statistics
export const getContactStats = async () => {
  return apiRequest('/admin/contacts/stats', { method: 'GET' });
};

// Update contact message (status, priority, admin response)
export const updateContactMessage = async (contactId, updateData) => {
  return apiRequest(`/admin/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
};

// Send email response to contact
export const sendContactResponse = async (contactId, responseMessage) => {
  return apiRequest(`/admin/contacts/${contactId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ responseMessage })
  });
};

// Delete contact message
export const deleteContactMessage = async (contactId) => {
  return apiRequest(`/admin/contacts/${contactId}`, {
    method: 'DELETE'
  });
};


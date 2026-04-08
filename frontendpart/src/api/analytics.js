import { API_BASE_URL, getDefaultHeaders } from './config.js';

const fetchAnalytics = async (path, range = 'all') => {
  const response = await fetch(`${API_BASE_URL}${path}?range=${encodeURIComponent(range)}`, {
    method: 'GET',
    headers: getDefaultHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch analytics');
  }

  return response.json();
};

export const getDashboardAnalytics = async (range = 'all') => {
  return fetchAnalytics('/insights/dashboard', range);
};

export const getInsightsSummary = async (range = 'all') => {
  return fetchAnalytics('/insights/summary', range);
};

export const getCategoryInsights = async (range = 'all') => {
  return fetchAnalytics('/insights/categories', range);
};

export const getSavingsInsights = async (range = 'all') => {
  return fetchAnalytics('/insights/savings', range);
};

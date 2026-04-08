import { API_BASE_URL } from './config.js';

const FALLBACK_GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;

export const getGoogleOAuthConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google/url`);

    if (!response.ok) {
      return {
        success: true,
        enabled: true,
        authUrl: FALLBACK_GOOGLE_AUTH_URL,
        source: 'fallback-route'
      };
    }

    const result = await response.json();

    return {
      success: true,
      enabled: Boolean(result.enabled),
      authUrl: result.authUrl || FALLBACK_GOOGLE_AUTH_URL,
      message: result.message,
      source: 'metadata-route'
    };
  } catch (error) {
    return {
      success: true,
      enabled: true,
      authUrl: FALLBACK_GOOGLE_AUTH_URL,
      source: 'network-fallback'
    };
  }
};

export const startGoogleOAuth = async () => {
  const config = await getGoogleOAuthConfig();

  if (!config.enabled) {
    return {
      success: false,
      message: config.message || 'Google sign-in is not configured right now'
    };
  }

  window.location.href = config.authUrl || FALLBACK_GOOGLE_AUTH_URL;

  return {
    success: true
  };
};

import { API_BASE_URL, buildApiUrl, getApiBaseCandidates } from './config.js';

const FALLBACK_GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;

const isRetryableStatus = (status) => status === 404 || status >= 500;

export const getGoogleOAuthConfig = async () => {
  const apiBaseCandidates = getApiBaseCandidates();
  let lastKnownFailure = null;

  for (let index = 0; index < apiBaseCandidates.length; index += 1) {
    const apiBase = apiBaseCandidates[index];

    try {
      const response = await fetch(buildApiUrl(apiBase, '/auth/google/url'));

      if (!response.ok) {
        if (index < apiBaseCandidates.length - 1 && isRetryableStatus(response.status)) {
          lastKnownFailure = {
            success: true,
            enabled: true,
            authUrl: `${apiBase}/auth/google`,
            source: 'retrying-fallback-route'
          };
          continue;
        }

        return {
          success: true,
          enabled: true,
          authUrl: `${apiBase}/auth/google`,
          source: 'fallback-route'
        };
      }

      const result = await response.json();

      return {
        success: true,
        enabled: Boolean(result.enabled),
        authUrl: result.authUrl || `${apiBase}/auth/google`,
        message: result.message,
        source: 'metadata-route'
      };
    } catch {
      lastKnownFailure = {
        success: true,
        enabled: true,
        authUrl: `${apiBase}/auth/google`,
        source: 'network-fallback'
      };
    }
  }

  return lastKnownFailure || {
    success: true,
    enabled: true,
    authUrl: FALLBACK_GOOGLE_AUTH_URL,
    source: 'final-fallback-route'
  };
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

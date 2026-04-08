const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

const hasGoogleOAuthConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return Boolean(
    clientId &&
    clientSecret &&
    clientId !== 'mock_id' &&
    clientSecret !== 'mock_secret'
  );
};

const getFrontendUrl = () => {
  return (process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/$/, '');
};

const getBackendUrl = (req) => {
  const configuredBackendUrl = process.env.BACKEND_URL;

  if (configuredBackendUrl) {
    return configuredBackendUrl.replace(/\/$/, '');
  }

  if (req) {
    const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
    const protocol = forwardedProto || req.protocol || 'http';
    const host = forwardedHost || req.get('host');

    if (host) {
      return `${protocol}://${host}`.replace(/\/$/, '');
    }
  }

  return 'http://localhost:8000';
};

const getGoogleOAuthEntryUrl = (req) => {
  return `${getBackendUrl(req)}/api/auth/google`;
};

module.exports = {
  hasGoogleOAuthConfig,
  getFrontendUrl,
  getBackendUrl,
  getGoogleOAuthEntryUrl
};

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
    return `${req.protocol}://${req.get('host')}`.replace(/\/$/, '');
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

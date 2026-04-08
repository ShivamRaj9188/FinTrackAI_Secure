const {
  hasGoogleOAuthConfig,
  getGoogleOAuthEntryUrl
} = require('../services/googleOAuthService');

const getGoogleOAuthUrl = (req, res) => {
  const enabled = hasGoogleOAuthConfig();

  res.json({
    success: true,
    enabled,
    provider: 'google',
    authUrl: enabled ? getGoogleOAuthEntryUrl(req) : null,
    message: enabled
      ? 'Google OAuth is configured'
      : 'Google OAuth setup required'
  });
};

module.exports = {
  getGoogleOAuthUrl
};

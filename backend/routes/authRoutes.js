const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { getFrontendUrl } = require('../services/googleOAuthService');

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const frontendUrl = getFrontendUrl();

    // Check if account is active
    if (req.user.status === 'Inactive') {
      return res.redirect(`${frontendUrl}/login?error=deactivated`);
    }

    // Generate JWT token
    const { getJwtSecret } = require('../utils/secretHelper');
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    // Include additional user info if available
    const userInfo = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'user',
      plan: req.user.plan || 'Basic',
      isVerified: req.user.isVerified || false
    };

    console.log('Google auth callback - user info:', userInfo);

    // Render deployment redirect handling
    const redirectUrl = `${frontendUrl}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userInfo))}`;
    console.log('Redirecting to frontend URL:', redirectUrl);
    res.redirect(redirectUrl);
  }
);

module.exports = router;

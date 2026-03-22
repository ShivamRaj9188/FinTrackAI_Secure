const jwt = require('jsonwebtoken');
const User = require('../authentication/User');

/**
 * Strict authentication middleware
 * - Verifies JWT token
 * - Checks user exists in DB
 * - Checks user account is active
 * - Populates req.user with full user info including role
 */
const strictAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: No token provided'
      });
    }

    // Verify token
    let decoded;
    try {
      const { getJwtSecret } = require('../utils/secretHelper');
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: Invalid or expired token'
      });
    }

    // Check if user exists in database
    const user = await User.findById(decoded.id || decoded._id || decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: User not found'
      });
    }

    // Check if user is active
    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact support to reactivate.'
      });
    }

    // Set user info for downstream handlers
    req.user = {
      id: user._id,
      _id: user._id,
      userId: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan || 'Basic',
      role: user.role || 'user'
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Role-based access control middleware factory
 * Usage: requireRole('admin') or requireRole('admin', 'moderator')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = strictAuthMiddleware;
module.exports.requireRole = requireRole;
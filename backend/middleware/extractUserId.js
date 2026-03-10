const jwt = require('jsonwebtoken');

// Middleware to extract userId from token
const extractUserId = (req, res, next) => {
  try {
    // Check if user is already set by previous middleware
    if (req.user && (req.user.id || req.user._id)) {
      return next();
    }
    
    // Try to extract from authorization header
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded && decoded.id) {
            // Create user object if it doesn't exist
            if (!req.user) req.user = {};
            req.user.id = decoded.id;
          }
        } catch (tokenError) {
          console.error('Token verification error:', tokenError);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in extractUserId middleware:', error);
    next();
  }
};

module.exports = extractUserId;
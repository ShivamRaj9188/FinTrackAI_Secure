const jwt = require('jsonwebtoken');
const User = require('../authentication/User');

// Strict authentication middleware for payment endpoints
const strictAuthMiddleware = async (req, res, next) => {
  try {
    console.log('=== STRICT AUTH CHECK ===');
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('BLOCKED: No token provided');
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: No token provided'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    } catch (error) {
      console.log('BLOCKED: Invalid token');
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: Invalid token'
      });
    }

    // Check if user exists in database
    const user = await User.findById(decoded.id || decoded._id || decoded.userId);
    if (!user) {
      console.log('BLOCKED: User not found in database');
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: User not found'
      });
    }

    // Check if user is active
    if (user.status === 'Inactive') {
      console.log('BLOCKED: User account is inactive');
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: Account is inactive'
      });
    }

    console.log('AUTH SUCCESS: User authenticated -', user.email);
    
    // Set user info for next middleware
    req.user = {
      id: user._id,
      _id: user._id,
      userId: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan || 'Basic',
      role: user.role || 'user'
    };
    
    console.log('User set in req.user:', req.user.email, 'Plan:', req.user.plan);

    next();
  } catch (error) {
    console.error('STRICT AUTH ERROR:', error);
    return res.status(401).json({
      success: false,
      message: 'AUTHENTICATION REQUIRED: Server error'
    });
  }
};

module.exports = strictAuthMiddleware;
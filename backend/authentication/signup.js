// Signup (Register) 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');

// Register new user
const signup = async (req, res) => {
  try {
    // Handle both nested and flat request formats
    let name, email, password;

    if (req.body.email && typeof req.body.email === 'object') {
      // Frontend might be sending nested format
      name = req.body.name;
      email = req.body.email.email || req.body.email;
      password = req.body.email.password || req.body.password;
    } else {
      // Normal format: { name: "...", email: "...", password: "..." }
      name = req.body.name;
      email = req.body.email;
      password = req.body.password;
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered! Please login with your credentials instead.',
        suggestion: 'Use the login page to access your account.'
      });
    }

    // Hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Create login token with role for RBAC
    const { getJwtSecret } = require('../utils/secretHelper');
    const token = jwt.sign({
      id: user._id,
      userId: user._id,
      email: user.email,
      role: user.role || 'user'
    }, getJwtSecret(), { expiresIn: process.env.JWT_EXPIRE || '1d' });

    // Send success response
    res.status(201).json({
      success: true,
      message: 'User created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    });
  }
};

module.exports = signup;

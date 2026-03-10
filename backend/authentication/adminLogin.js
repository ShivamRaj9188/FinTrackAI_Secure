// Admin Login 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');

// Admin login (only for admin users)
const adminLogin = async (req, res) => {
  try {
    // Handle both nested and flat request formats
    let email, password;
    
    if (req.body.email && typeof req.body.email === 'object') {
      // Frontend is sending nested format: { email: { email: "...", password: "..." } }
      email = req.body.email.email;
      password = req.body.email.password;
    } else {
      // Normal format: { email: "...", password: "..." }
      email = req.body.email;
      password = req.body.password;
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find admin user (must have role = 'admin')
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Create login token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    // Send success response
    res.json({
      message: 'Admin login successful!',
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
      message: 'Error logging in', 
      error: error.message 
    });
  }
};

module.exports = adminLogin;

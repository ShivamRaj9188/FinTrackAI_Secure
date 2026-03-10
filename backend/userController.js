// User Controller - Handle user profile operations
const User = require('./authentication/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token (same as dashboard)
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    
    // Set both id and _id for compatibility
    req.user = {
      ...decoded,
      _id: decoded.id || decoded._id || decoded.userId,
      id: decoded.id || decoded._id || decoded.userId
    };
    
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        dob: user.dob || null,
        location: user.location || '',
        verified: user.verified || false,
        image: user.profileImage || null,
        plan: user.plan || 'Basic'
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, dob, location } = req.body;

    // Get current user to check if email is being changed
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // If email is being changed to a different email, check for duplicates
    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already in use by another account' 
        });
      }
    }

    // Update user info
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name, 
        email, 
        phone, 
        dob, 
        location 
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        dob: updatedUser.dob || null,
        location: updatedUser.location || '',
        verified: updatedUser.verified || false,
        image: updatedUser.profileImage || null
      },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already in use by another account' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify user account
const verifyUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { verified: true },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        verified: updatedUser.verified
      },
      message: 'Account verified successfully'
    });

  } catch (error) {
    console.error('Verify user account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyToken,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  verifyUserAccount
};

// Dashboard Controller - Simple user dashboard data
const User = require('./authentication/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user dashboard data
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For now, we'll send basic user data and some sample dashboard stats
  
    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      stats: {
        totalTransactions: 0, 
        totalBalance: 0,      
        monthlySpending: 0,   
        savingsGoal: 0        
      },
      recentActivity: [
        
        {
          id: 1,
          type: 'income',
          amount: 2500,
          description: 'Salary',
          date: new Date().toISOString()
        },
        {
          id: 2,
          type: 'expense',
          amount: 150,
          description: 'Groceries',
          date: new Date().toISOString()
        }
      ]
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Update user info
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyToken,
  getDashboardData,
  updateProfile
};

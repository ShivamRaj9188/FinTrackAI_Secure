const User = require('./authentication/User');
const bcrypt = require('bcryptjs');

// Get admin dashboard stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      $or: [
        { isVerified: true },
        { verified: true },
        { status: 'Active' }
      ]
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Get real revenue from payments collection
    let totalRevenue = 0;
    try {
      const Payment = require('./models/Payment'); // Adjust path as needed
      
      // Debug: Check actual payment data
      const samplePayments = await Payment.find({}).limit(3);
      console.log('Sample payments:', JSON.stringify(samplePayments, null, 2));
      
      const revenueResult = await Payment.aggregate([
        {
          $match: {
            status: { $in: ['completed', 'success'] },
            razorpayPaymentId: { $exists: true, $ne: null },
            razorpayPaymentId: { $not: /^demo_/ }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' } // Amount already in rupees
          }
        }
      ]);
      
      console.log('Revenue calculation result:', revenueResult);
      totalRevenue = revenueResult[0]?.total || 0;
    } catch (paymentError) {
      console.warn('Payment calculation error:', paymentError);
      totalRevenue = 0;
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalRevenue: Math.round(totalRevenue),
        totalUsersGrowth: ((newUsersThisMonth / totalUsers) * 100).toFixed(1),
        activeUsersGrowth: 0,
        revenueGrowth: 0,
        monthlyGrowth: ((newUsersThisMonth / totalUsers) * 100).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get admin stats' });
  }
};

// Get all users with pagination and search
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(searchQuery)
      .select('-password') // Don't send passwords
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(searchQuery);

    // Format users for frontend
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status || (user.isVerified ? 'Active' : 'Inactive'),
      plan: user.plan || 'Basic',
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      phone: user.phone || 'N/A',
      location: user.location || 'N/A',
      role: user.role,
      isVerified: user.isVerified || false
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const formattedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status || (user.isVerified ? 'Active' : 'Inactive'),
      plan: user.plan || 'Basic',
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      phone: user.phone || '',
      location: user.location || '',
      role: user.role,
      isVerified: user.isVerified || false
    };

    res.json({
      success: true,
      data: formattedUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        status,
        isVerified: status === 'Active'
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User ${status.toLowerCase()}d successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      location: location || '',
      isVerified: true, // Admin created users are verified by default
      status: 'Active', // Admin created users are active by default
      plan: 'Basic' // Default plan for new users
    });

    await newUser.save();

    // Return formatted user data
    const formattedUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      status: newUser.status,
      plan: newUser.plan,
      joinDate: new Date(newUser.createdAt).toLocaleDateString(),
      phone: newUser.phone || 'N/A',
      location: newUser.location || 'N/A',
      role: newUser.role,
      isVerified: newUser.isVerified
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: formattedUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, location, role, plan } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (role) updateData.role = role;
    if (plan) updateData.plan = plan;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        plan: user.plan,
        status: user.status || (user.isVerified ? 'Active' : 'Inactive')
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

// Get analytics data with real user growth
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      $or: [
        { isVerified: true },
        { verified: true },
        { status: 'Active' }
      ]
    });
    
    // Get real user growth data for the last 12 months
    const userGrowthData = await getUserGrowthDataByPeriod('monthly');
    
    res.json({
      success: true,
      data: {
        userGrowth: userGrowthData,
        totalUsers,
        activeUsers,
        monthlyRevenue: 45230, // You can replace with real revenue data
        userEngagement: Math.round((activeUsers / totalUsers) * 100) || 0
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
};

// Get user growth data by period (monthly, weekly, daily)
const getUserGrowthData = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const growthData = await getUserGrowthDataByPeriod(period);
    
    res.json({
      success: true,
      data: growthData
    });
  } catch (error) {
    console.error('User growth data error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user growth data' });
  }
};

// Helper function to calculate user growth data
const getUserGrowthDataByPeriod = async (period = 'monthly') => {
  try {
    const now = new Date();
    
    // Simplified approach: Get all users and group them manually
    const allUsers = await User.find({}, 'createdAt').sort({ createdAt: 1 });
    
    if (allUsers.length === 0) {
      return {
        labels: ['No Data'],
        data: [0]
      };
    }
    
    // For monthly view, get last 12 months
    if (period === 'monthly') {
      const labels = [];
      const data = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Generate last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        
        labels.push(`${monthNames[month]} ${year}`);
        
        // Count users created in this month
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        
        const count = allUsers.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= monthStart && userDate <= monthEnd;
        }).length;
        
        data.push(count);
      }
      
      return { labels, data };
    }
    
    // For weekly view, get last 12 weeks
    if (period === 'weekly') {
      const labels = [];
      const data = [];
      
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
        
        labels.push(`Week ${Math.ceil(weekStart.getDate() / 7)}, ${weekStart.toLocaleDateString('en-US', { month: 'short' })}`);
        
        const count = allUsers.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= weekStart && userDate <= weekEnd;
        }).length;
        
        data.push(count);
      }
      
      return { labels, data };
    }
    
    // For daily view, get last 30 days
    if (period === 'daily') {
      const labels = [];
      const data = [];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000) - 1);
        
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        
        const count = allUsers.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= dayStart && userDate <= dayEnd;
        }).length;
        
        data.push(count);
      }
      
      return { labels, data };
    }
    
    // Default fallback
    return {
      labels: ['No Data'],
      data: [0]
    };
    
  } catch (error) {
    console.error('Error calculating user growth data:', error);
    // Return fallback data if calculation fails
    return {
      labels: ['No Data'],
      data: [0]
    };
  }
};

// Send notification to all users
const sendNotification = async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required' 
      });
    }

    // Here you could implement actual notification logic:
    // - Save to database
    // - Send emails to users
    // - Push notifications
    

    console.log(`Admin Notification: ${title} - ${message}`);

    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: { title, message, type, timestamp: new Date() }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
};

// In-memory maintenance mode state (in production, use database or file)
let maintenanceModeState = false;

// Toggle maintenance mode
const toggleMaintenanceMode = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'Enabled status must be a boolean' 
      });
    }

    // Update maintenance mode state
    maintenanceModeState = enabled;
    
    console.log(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);

    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: { maintenanceMode: enabled, timestamp: new Date() }
    });
  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle maintenance mode' });
  }
};

// Get maintenance mode status
const getMaintenanceStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { maintenanceMode: maintenanceModeState }
    });
  } catch (error) {
    console.error('Get maintenance status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get maintenance status' });
  }
};

// Middleware to check maintenance mode
const checkMaintenanceMode = (req, res, next) => {
  // Skip maintenance check for admin routes and maintenance status endpoint
  if (req.path.includes('/admin') || req.path.includes('/maintenance/status')) {
    return next();
  }
  
  if (maintenanceModeState) {
    return res.status(503).json({
      success: false,
      message: 'Site is currently under maintenance. Please try again later.',
      maintenanceMode: true
    });
  }
  
  next();
};

// Get system settings
const getSystemSettings = async (req, res) => {
  try {
    // Return default system settings (in a real app, these would come from database)
    const settings = {
      siteName: "FinTrackAI",
      adminEmail: "admin@fintrackai.com",
      maintenanceMode: false,
      twoFactorAuth: true,
      forceSSL: true,
      sessionTimeout: 30,
      autoBackup: true,
      maxFileSize: 50, // MB
      allowRegistration: true,
      emailNotifications: true
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get system settings' });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const settings = req.body;

    // In a real app, you would validate and save to database
    console.log('System settings updated:', settings);

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update system settings' });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  createUser,
  updateUser,
  getAnalytics,
  getUserGrowthData,
  sendNotification,
  toggleMaintenanceMode,
  getMaintenanceStatus,
  checkMaintenanceMode,
  getSystemSettings,
  updateSystemSettings
};

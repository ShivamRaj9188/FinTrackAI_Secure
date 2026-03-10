const User = require('../authentication/User');

// Plan limits configuration
const PLAN_LIMITS = {
  Basic: {
    maxUploadsPerMonth: 5,
    dataRetentionDays: 7,
    hasAdvancedInsights: false,
    hasBudgetPlanning: false,
    hasExports: false,
    hasPrioritySupport: false
  },
  Pro: {
    maxUploadsPerMonth: -1, // Unlimited
    dataRetentionDays: -1, // Unlimited
    hasAdvancedInsights: true,
    hasBudgetPlanning: true,
    hasExports: true,
    hasPrioritySupport: true
  },
  Enterprise: {
    maxUploadsPerMonth: -1, // Unlimited
    dataRetentionDays: -1, // Unlimited
    hasAdvancedInsights: true,
    hasBudgetPlanning: true,
    hasExports: true,
    hasPrioritySupport: true,
    hasTeamFeatures: true
  }
};

// Check upload limits
const checkUploadLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userPlan = user.plan || 'Basic';
    const limits = PLAN_LIMITS[userPlan];

    if (limits.maxUploadsPerMonth === -1) {
      return next(); // Unlimited uploads
    }

    // Count uploads this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const uploadCount = await getUploadCount(req.user.id, startOfMonth);

    if (uploadCount >= limits.maxUploadsPerMonth) {
      return res.status(403).json({
        success: false,
        message: `Upload limit reached. ${userPlan} plan allows ${limits.maxUploadsPerMonth} uploads per month.`,
        planLimit: true,
        currentPlan: userPlan,
        upgradeRequired: true
      });
    }

    req.planLimits = limits;
    next();
  } catch (error) {
    console.error('Plan limit check error:', error);
    res.status(500).json({ success: false, message: 'Failed to check plan limits' });
  }
};

// Check feature access
const checkFeatureAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      const userPlan = user.plan || 'Basic';
      const limits = PLAN_LIMITS[userPlan];

      if (!limits[feature]) {
        return res.status(403).json({
          success: false,
          message: `This feature requires ${feature === 'hasAdvancedInsights' ? 'Pro' : 'Pro'} plan or higher.`,
          planLimit: true,
          currentPlan: userPlan,
          upgradeRequired: true
        });
      }

      req.planLimits = limits;
      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({ success: false, message: 'Failed to check feature access' });
    }
  };
};

// Helper function to count uploads (you'll need to implement based on your upload model)
const getUploadCount = async (userId, startDate) => {
  try {
    // Replace with your actual upload model/collection
    const Upload = require('../models/Upload'); // Adjust path as needed
    return await Upload.countDocuments({
      userId: userId,
      createdAt: { $gte: startDate }
    });
  } catch (error) {
    console.warn('Upload count error:', error);
    return 0;
  }
};

// Get user plan limits
const getUserPlanLimits = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userPlan = user.plan || 'Basic';
    const limits = PLAN_LIMITS[userPlan];

    // Get current usage
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentUploads = await getUploadCount(req.user.id, startOfMonth);

    res.json({
      success: true,
      data: {
        currentPlan: userPlan,
        limits: limits,
        usage: {
          uploadsThisMonth: currentUploads,
          uploadsRemaining: limits.maxUploadsPerMonth === -1 ? -1 : Math.max(0, limits.maxUploadsPerMonth - currentUploads)
        }
      }
    });
  } catch (error) {
    console.error('Get plan limits error:', error);
    res.status(500).json({ success: false, message: 'Failed to get plan limits' });
  }
};

module.exports = {
  checkUploadLimit,
  checkFeatureAccess,
  getUserPlanLimits,
  PLAN_LIMITS
};
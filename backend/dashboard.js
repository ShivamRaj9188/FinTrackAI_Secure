// Dashboard Controller - Real user dashboard data from MongoDB
const User = require('./authentication/User');
const Transaction = require('./models/Transaction');
const jwt = require('jsonwebtoken');

// Get user dashboard data — computed from REAL transaction data
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    // Get user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch real transactions from the database
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });

    // Calculate real stats
    let totalIncome = 0;
    let totalExpense = 0;
    const categorySpending = {};
    const monthlyData = {};

    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount) || 0;
      if (tx.type === 'credit') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        // Track by category
        const cat = tx.category || 'Other';
        categorySpending[cat] = (categorySpending[cat] || 0) + amount;
      }
      // Track monthly 
      const monthKey = tx.date ? new Date(tx.date).toISOString().substring(0, 7) : 'unknown';
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, expense: 0 };
      if (tx.type === 'credit') monthlyData[monthKey].income += amount;
      else monthlyData[monthKey].expense += amount;
    });

    // Get recent transactions (last 10)
    const recentActivity = transactions.slice(0, 10).map(tx => ({
      id: tx._id,
      type: tx.type === 'credit' ? 'income' : 'expense',
      amount: tx.amount,
      description: tx.description,
      category: tx.category || 'Other',
      date: tx.date
    }));

    // Top spending categories
    const topCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0
      }));

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan || 'Basic'
      },
      stats: {
        totalTransactions: transactions.length,
        totalBalance: totalIncome - totalExpense,
        totalIncome,
        totalExpense,
        monthlySpending: totalExpense,
        savingsRate: totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0
      },
      topCategories,
      monthlyData,
      recentActivity
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
  getDashboardData,
  updateProfile
};

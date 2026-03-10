// Transactions Controller - Handle transaction operations
const User = require('./authentication/User');
const Transaction = require('./models/Transaction');
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

// Get user transactions
const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const type = req.query.type;

    // Build query for this user only
    let query = { user: userId };

    // Apply filters
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Get paginated transactions
    const userTransactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      transactions: userTransactions,
      total: total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new transaction
const addTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { type, amount, description, category, date } = req.body;

    // Validate required fields
    if (!type || !amount || !description || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new transaction
    const newTransaction = new Transaction({
      user: userId,
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: date ? new Date(date) : new Date()
    });

    const savedTransaction = await newTransaction.save();

    res.json({
      success: true,
      transaction: savedTransaction,
      message: 'Transaction added successfully'
    });

  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const transactionId = req.params.id;
    const { type, amount, description, category, date } = req.body;

    // Find and update transaction for this user only
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, user: userId },
      {
        type: type,
        amount: amount ? parseFloat(amount) : undefined,
        description: description,
        category: category,
        date: date ? new Date(date) : undefined
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction: updatedTransaction,
      message: 'Transaction updated successfully'
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const transactionId = req.params.id;

    // Find and delete transaction for this user only
    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      user: userId
    });
    
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyToken,
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
};

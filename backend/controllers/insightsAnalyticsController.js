const Transaction = require('../models/Transaction');
const {
  filterTransactionsByRange,
  buildSummary,
  buildCategoryInsights,
  buildSavingsInsights,
  buildDashboardInsights
} = require('../services/insightsEngine');

const getTransactionsForUser = async (req) => {
  const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 }).lean();
  return filterTransactionsByRange(transactions, req.query.range || 'all');
};

const getInsightsSummary = async (req, res) => {
  try {
    const transactions = await getTransactionsForUser(req);
    const data = await buildSummary(transactions, req.user.id);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to build insights summary'
    });
  }
};

const getCategoryInsights = async (req, res) => {
  try {
    const transactions = await getTransactionsForUser(req);
    const data = await buildCategoryInsights(transactions, req.user.id);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to build category insights'
    });
  }
};

const getSavingsInsights = async (req, res) => {
  try {
    const transactions = await getTransactionsForUser(req);
    const data = await buildSavingsInsights(transactions, req.user.id);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to build savings insights'
    });
  }
};

const getDashboardInsights = async (req, res) => {
  try {
    const transactions = await getTransactionsForUser(req);
    const data = await buildDashboardInsights(transactions, req.user.id);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to build dashboard insights'
    });
  }
};

module.exports = {
  getInsightsSummary,
  getCategoryInsights,
  getSavingsInsights,
  getDashboardInsights
};

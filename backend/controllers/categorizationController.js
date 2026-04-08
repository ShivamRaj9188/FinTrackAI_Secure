const Transaction = require('../models/Transaction');
const { categorizeTransactions } = require('../services/categorizationService');

const previewCategorization = async (req, res) => {
  try {
    const transactions = Array.isArray(req.body.transactions) ? req.body.transactions : [];

    if (!transactions.length) {
      return res.status(400).json({
        success: false,
        message: 'transactions array is required'
      });
    }

    const categorized = await categorizeTransactions(transactions, req.user.id, {
      preserveExistingCategory: false
    });

    return res.json({
      success: true,
      data: categorized
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to preview categorization'
    });
  }
};

const runCategorization = async (req, res) => {
  try {
    const { uploadId, ingestionJobId, onlyUncategorized = true } = req.body || {};
    const query = { user: req.user.id };

    if (uploadId) query.uploadId = uploadId;
    if (ingestionJobId) query.ingestionJob = ingestionJobId;
    if (onlyUncategorized) {
      query.$or = [
        { category: { $exists: false } },
        { category: '' },
        { category: null },
        { category: 'Other' }
      ];
    }

    const transactions = await Transaction.find(query).lean();
    const categorized = await categorizeTransactions(transactions, req.user.id, {
      preserveExistingCategory: false
    });

    if (!categorized.length) {
      return res.json({
        success: true,
        data: {
          updatedCount: 0,
          transactions: []
        }
      });
    }

    const operations = categorized.map((transaction) => ({
      updateOne: {
        filter: { _id: transaction._id, user: req.user.id },
        update: {
          $set: {
            category: transaction.category,
            categorySource: transaction.categorySource,
            categoryConfidence: transaction.categoryConfidence
          }
        }
      }
    }));

    await Transaction.bulkWrite(operations);

    return res.json({
      success: true,
      data: {
        updatedCount: operations.length,
        transactions: categorized
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to run categorization'
    });
  }
};

module.exports = {
  previewCategorization,
  runCategorization
};

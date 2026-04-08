const Transaction = require('../models/Transaction');
const { CATEGORY_RULES, normalizeCategoryName } = require('../utils/categoryRules');
const { scoreTextAgainstCategories } = require('./tfidfModelService');

const FALLBACK_CATEGORY = 'Other';

const ruleBasedCategory = (description = '', type = '') => {
  const normalizedDescription = String(description).toLowerCase();

  if (type === 'credit') {
    return { category: 'Income', confidence: 0.99 };
  }

  for (const rule of CATEGORY_RULES) {
    if (!rule.keywords.length) continue;
    const matches = rule.keywords.filter((keyword) => normalizedDescription.includes(keyword));
    if (matches.length > 0) {
      const confidence = Math.min(0.98, 0.72 + matches.length * 0.08);
      return { category: rule.name, confidence };
    }
  }

  return null;
};

const getUserTrainingExamples = async (userId) => {
  const labeledTransactions = await Transaction.find({
    user: userId,
    category: { $exists: true, $nin: ['', null, FALLBACK_CATEGORY] }
  })
    .sort({ createdAt: -1 })
    .limit(400)
    .select('description category')
    .lean();

  return labeledTransactions.reduce((accumulator, transaction) => {
    const category = normalizeCategoryName(transaction.category);
    if (!category) return accumulator;

    if (!accumulator[category]) accumulator[category] = [];
    accumulator[category].push(transaction.description);
    return accumulator;
  }, {});
};

const predictCategory = async ({ description, type = 'debit', category = '' }, userId, trainingExamples) => {
  const normalizedCategory = normalizeCategoryName(category);
  if (normalizedCategory) {
    return {
      category: normalizedCategory,
      categorySource: 'existing',
      categoryConfidence: 1
    };
  }

  const rulePrediction = ruleBasedCategory(description, type);
  if (rulePrediction) {
    return {
      category: rulePrediction.category,
      categorySource: 'rule',
      categoryConfidence: Number(rulePrediction.confidence.toFixed(2))
    };
  }

  const userExamples = trainingExamples || (userId ? await getUserTrainingExamples(userId) : {});
  const scored = scoreTextAgainstCategories(description, userExamples);
  const bestMatch = scored[0];

  if (bestMatch && bestMatch.score >= 0.08 && bestMatch.category !== FALLBACK_CATEGORY) {
    return {
      category: bestMatch.category,
      categorySource: 'ml',
      categoryConfidence: Number(Math.min(0.95, bestMatch.score + 0.2).toFixed(2))
    };
  }

  return {
    category: type === 'credit' ? 'Income' : FALLBACK_CATEGORY,
    categorySource: 'fallback',
    categoryConfidence: type === 'credit' ? 0.9 : 0.35
  };
};

const categorizeTransactions = async (transactions = [], userId, options = {}) => {
  const { preserveExistingCategory = true } = options;
  const trainingExamples = userId ? await getUserTrainingExamples(userId) : {};
  const results = [];

  for (const transaction of transactions) {
    if (preserveExistingCategory && normalizeCategoryName(transaction.category)) {
      results.push({
        ...transaction,
        category: normalizeCategoryName(transaction.category),
        categorySource: transaction.categorySource || 'existing',
        categoryConfidence: transaction.categoryConfidence ?? 1
      });
      continue;
    }

    const prediction = await predictCategory(transaction, userId, trainingExamples);
    results.push({
      ...transaction,
      category: prediction.category,
      categorySource: prediction.categorySource,
      categoryConfidence: prediction.categoryConfidence
    });
  }

  return results;
};

module.exports = {
  predictCategory,
  categorizeTransactions
};

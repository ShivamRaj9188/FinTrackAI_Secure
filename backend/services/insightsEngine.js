const { predictCategory } = require('./categorizationService');

const normalizeDescription = (description = '') => {
  return String(description).toLowerCase().replace(/\s+/g, ' ').trim();
};

const toNumber = (value) => Number.parseFloat(value) || 0;

const filterTransactionsByRange = (transactions, range = 'all') => {
  if (!range || range === 'all') return transactions;

  const days = Number.parseInt(String(range).replace(/\D/g, ''), 10);
  if (!Number.isFinite(days) || days <= 0) return transactions;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return transactions.filter((transaction) => new Date(transaction.date) >= cutoff);
};

const buildMonthlyTrend = (transactions, months = 6) => {
  const buckets = new Map();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!buckets.has(key)) {
      buckets.set(key, { month: key, income: 0, spending: 0 });
    }

    const bucket = buckets.get(key);
    if (transaction.type === 'credit') {
      bucket.income += toNumber(transaction.amount);
    } else {
      bucket.spending += toNumber(transaction.amount);
    }
  });

  return Array.from(buckets.values())
    .sort((left, right) => left.month.localeCompare(right.month))
    .slice(-months)
    .map((bucket) => ({
      ...bucket,
      savings: Number((bucket.income - bucket.spending).toFixed(2))
    }));
};

const groupExpensesByCategory = async (transactions, userId) => {
  const categoryMap = new Map();

  for (const transaction of transactions) {
    if (transaction.type !== 'debit') continue;

    let category = transaction.category;
    if (!category) {
      const prediction = await predictCategory(transaction, userId);
      category = prediction.category;
    }

    const current = categoryMap.get(category) || 0;
    categoryMap.set(category, current + toNumber(transaction.amount));
  }

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) }))
    .sort((left, right) => right.amount - left.amount);
};

const buildSummary = async (transactions, userId) => {
  const expenses = transactions.filter((transaction) => transaction.type === 'debit');
  const income = transactions.filter((transaction) => transaction.type === 'credit');
  const totalSpending = expenses.reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const totalIncome = income.reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const netSavings = totalIncome - totalSpending;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const monthlyTrend = buildMonthlyTrend(transactions, 6);
  const categoryInsights = await groupExpensesByCategory(transactions, userId);

  return {
    totals: {
      transactionCount: transactions.length,
      totalIncome: Number(totalIncome.toFixed(2)),
      totalSpending: Number(totalSpending.toFixed(2)),
      netSavings: Number(netSavings.toFixed(2)),
      savingsRate: Number(savingsRate.toFixed(1))
    },
    monthlyTrend,
    topCategory: categoryInsights[0] || null,
    averageMonthlySpending: monthlyTrend.length
      ? Number((monthlyTrend.reduce((sum, bucket) => sum + bucket.spending, 0) / monthlyTrend.length).toFixed(2))
      : 0
  };
};

const buildCategoryInsights = async (transactions, userId) => {
  const expenses = transactions.filter((transaction) => transaction.type === 'debit');
  const totalSpending = expenses.reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const grouped = await groupExpensesByCategory(expenses, userId);

  return grouped.slice(0, 6).map((item, index) => ({
    rank: index + 1,
    category: item.category,
    amount: item.amount,
    share: totalSpending > 0 ? Number(((item.amount / totalSpending) * 100).toFixed(1)) : 0
  }));
};

const buildSavingsInsights = async (transactions, userId) => {
  const summary = await buildSummary(transactions, userId);
  const categories = await buildCategoryInsights(transactions, userId);
  const recurringCandidates = new Map();

  transactions
    .filter((transaction) => transaction.type === 'debit')
    .forEach((transaction) => {
      const key = normalizeDescription(transaction.description);
      if (!key) return;
      const current = recurringCandidates.get(key) || {
        description: transaction.description,
        count: 0,
        totalAmount: 0
      };

      current.count += 1;
      current.totalAmount += toNumber(transaction.amount);
      recurringCandidates.set(key, current);
    });

  const recurring = Array.from(recurringCandidates.values())
    .filter((item) => item.count >= 2)
    .sort((left, right) => right.totalAmount - left.totalAmount)
    .slice(0, 2);

  const insights = [];
  if (categories[0]) {
    insights.push({
      title: `Review ${categories[0].category}`,
      description: `${categories[0].category} accounts for ${categories[0].share}% of your spending.`,
      estimatedMonthlySaving: Number((categories[0].amount * 0.1).toFixed(2))
    });
  }

  if (summary.totals.savingsRate < 20 && summary.totals.totalIncome > 0) {
    insights.push({
      title: 'Increase monthly savings buffer',
      description: `Your current savings rate is ${summary.totals.savingsRate}%. Moving toward 20% improves resilience.`,
      estimatedMonthlySaving: Number((summary.totals.totalIncome * 0.2 - summary.totals.netSavings).toFixed(2))
    });
  }

  recurring.forEach((item) => {
    insights.push({
      title: `Check recurring charge: ${item.description}`,
      description: `Detected ${item.count} similar charges totaling ₹${item.totalAmount.toFixed(2)}.`,
      estimatedMonthlySaving: Number((item.totalAmount * 0.15).toFixed(2))
    });
  });

  return insights.slice(0, 4);
};

const buildDashboardInsights = async (transactions, userId) => {
  const summary = await buildSummary(transactions, userId);
  const categoryInsights = await buildCategoryInsights(transactions, userId);
  const savingsInsights = await buildSavingsInsights(transactions, userId);

  return {
    summary,
    categoryInsights,
    savingsInsights
  };
};

module.exports = {
  filterTransactionsByRange,
  buildSummary,
  buildCategoryInsights,
  buildSavingsInsights,
  buildDashboardInsights
};

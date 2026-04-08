const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { normalizeCsvRow } = require('../services/fileValidationService');
const { categorizeTransactions } = require('../services/categorizationService');
const { buildDashboardInsights } = require('../services/insightsEngine');
const { getGoogleOAuthEntryUrl } = require('../services/googleOAuthService');

const loadFixtureTransactions = () => {
  const fixturePath = path.join(__dirname, '..', '..', 'test_transactions.csv');
  const lines = fs.readFileSync(fixturePath, 'utf8').trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
    const result = normalizeCsvRow(row);
    assert.equal(result.isValid, true, `Expected valid row for ${line}`);
    return result.transaction;
  });
};

const run = async () => {
  const transactions = loadFixtureTransactions();
  assert.ok(transactions.length > 5, 'Expected fixture transactions to load');
  assert.equal(transactions[0].description, 'Monthly Salary');
  assert.equal(transactions[1].category, 'Housing');

  const categorized = await categorizeTransactions(
    transactions.map((transaction) => ({ ...transaction, user: 'demo-user' })),
    null,
    { preserveExistingCategory: true }
  );

  assert.equal(categorized[0].category, 'Income');
  assert.equal(categorized[2].category, 'Food & Dining');

  const dashboardInsights = await buildDashboardInsights(categorized, null);
  assert.ok(dashboardInsights.summary.totals.totalIncome > 0, 'Expected positive income total');
  assert.ok(dashboardInsights.summary.totals.totalSpending > 0, 'Expected positive spending total');
  assert.ok(dashboardInsights.categoryInsights.length > 0, 'Expected category insights');
  assert.ok(dashboardInsights.savingsInsights.length > 0, 'Expected savings insights');

  const oauthUrl = getGoogleOAuthEntryUrl({
    protocol: 'http',
    get: (key) => (key === 'host' ? 'localhost:8000' : '')
  });
  assert.equal(oauthUrl, 'http://localhost:8000/api/auth/google');

  console.log('Smoke tests passed');
  console.log(JSON.stringify({
    transactionCount: categorized.length,
    topCategory: dashboardInsights.summary.topCategory,
    savingsInsight: dashboardInsights.savingsInsights[0]
  }, null, 2));
};

run().catch((error) => {
  console.error('Smoke tests failed');
  console.error(error);
  process.exit(1);
});

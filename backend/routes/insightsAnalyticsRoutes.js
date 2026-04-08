const express = require('express');

const strictAuthMiddleware = require('../middleware/strictAuth');
const {
  getInsightsSummary,
  getCategoryInsights,
  getSavingsInsights,
  getDashboardInsights
} = require('../controllers/insightsAnalyticsController');

const router = express.Router();

router.get('/summary', strictAuthMiddleware, getInsightsSummary);
router.get('/categories', strictAuthMiddleware, getCategoryInsights);
router.get('/savings', strictAuthMiddleware, getSavingsInsights);
router.get('/dashboard', strictAuthMiddleware, getDashboardInsights);

module.exports = router;

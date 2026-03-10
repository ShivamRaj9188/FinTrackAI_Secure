const express = require('express');
const router = express.Router();
const { verifyToken } = require('../dashboard');
const checkTransactions = require('../middleware/checkTransactions');

// Import dashboard controllers
const { getDashboardData, updateProfile } = require('../dashboard');

// Dashboard Routes (Protected - require authentication)
router.get('/', verifyToken, checkTransactions, getDashboardData);    // Get user dashboard data
router.put('/profile', verifyToken, updateProfile); // Update user profile

module.exports = router;
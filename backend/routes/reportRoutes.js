const express = require('express');
const router = express.Router();
const { verifyToken } = require('../dashboard');
const checkTransactions = require('../middleware/checkTransactions');
const { generateReport } = require('../uploadController');

// Report Routes (Protected - require authentication)
router.get('/generate', verifyToken, generateReport);
router.post('/generate', verifyToken, generateReport);

module.exports = router;
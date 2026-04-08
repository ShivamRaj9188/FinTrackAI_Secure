const express = require('express');

const strictAuthMiddleware = require('../middleware/strictAuth');
const { previewCategorization, runCategorization } = require('../controllers/categorizationController');

const router = express.Router();

router.post('/preview', strictAuthMiddleware, previewCategorization);
router.post('/run', strictAuthMiddleware, runCategorization);

module.exports = router;

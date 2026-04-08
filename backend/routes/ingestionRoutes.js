const express = require('express');

const strictAuthMiddleware = require('../middleware/strictAuth');
const { upload, uploadStatement, getIngestionStatus } = require('../controllers/ingestionController');

const router = express.Router();

router.post('/upload', strictAuthMiddleware, upload.single('file'), uploadStatement);
router.get('/:id', strictAuthMiddleware, getIngestionStatus);

module.exports = router;

const express = require('express');

const strictAuthMiddleware = require('../middleware/strictAuth');
const { checkUploadLimit } = require('../middleware/planLimits');
const { upload, uploadStatement, submitStatementPassword, getIngestionStatus } = require('../controllers/ingestionController');

const router = express.Router();

router.post('/upload', strictAuthMiddleware, checkUploadLimit, upload.single('file'), uploadStatement);
router.post('/:id/password', strictAuthMiddleware, submitStatementPassword);
router.get('/:id', strictAuthMiddleware, getIngestionStatus);

module.exports = router;

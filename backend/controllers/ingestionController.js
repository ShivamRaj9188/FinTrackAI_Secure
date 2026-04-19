const multer = require('multer');

const { ingestFile, submitPdfPassword, getIngestionJobForUser } = require('../services/fileIngestionService');

const uploadDir = process.env.VERCEL ? '/tmp/' : 'uploads/';
const upload = multer({ dest: uploadDir });

const buildJobPayload = (job) => ({
  status: job.status,
  summary: job.summary,
  preview: job.preview,
  warnings: job.warnings,
  errorMessages: job.errorMessages
});

const sendPasswordChallenge = (res, result) => {
  return res.status(409).json({
    success: false,
    code: result.code,
    requiresPassword: true,
    message: result.message,
    uploadId: result.uploadId,
    jobId: result.job._id,
    remainingAttempts: result.remainingAttempts,
    data: buildJobPayload(result.job)
  });
};

const uploadStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await ingestFile({
      file: req.file,
      userId: req.user.id,
      password: req.body?.password
    });

    if (result.requiresPassword) {
      return sendPasswordChallenge(res, result);
    }

    return res.json({
      success: true,
      message: 'Statement ingested successfully',
      uploadId: result.uploadId,
      jobId: result.job._id,
      data: buildJobPayload(result.job)
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      code: error.code,
      message: error.message || 'Failed to ingest file'
    });
  }
};

const submitStatementPassword = async (req, res) => {
  try {
    const result = await submitPdfPassword({
      jobId: req.params.id,
      userId: req.user.id,
      password: req.body?.password
    });

    if (result.requiresPassword) {
      return sendPasswordChallenge(res, result);
    }

    return res.json({
      success: true,
      message: result.alreadyCompleted ? 'Statement already ingested successfully' : 'Statement ingested successfully',
      uploadId: result.uploadId,
      jobId: result.job._id,
      data: buildJobPayload(result.job)
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      code: error.code,
      message: error.message || 'Failed to unlock statement'
    });
  }
};

const getIngestionStatus = async (req, res) => {
  try {
    const job = await getIngestionJobForUser(req.params.id, req.user.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Ingestion job not found'
      });
    }

    return res.json({
      success: true,
      data: job
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ingestion status'
    });
  }
};

module.exports = {
  upload,
  uploadStatement,
  submitStatementPassword,
  getIngestionStatus
};

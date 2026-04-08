const multer = require('multer');

const { ingestFile, getIngestionJobForUser } = require('../services/fileIngestionService');

const uploadDir = process.env.VERCEL ? '/tmp/' : 'uploads/';
const upload = multer({ dest: uploadDir });

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
      userId: req.user.id
    });

    return res.json({
      success: true,
      message: 'Statement ingested successfully',
      uploadId: result.uploadId,
      jobId: result.job._id,
      data: {
        status: result.job.status,
        summary: result.job.summary,
        preview: result.job.preview,
        warnings: result.job.warnings
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to ingest file'
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
  getIngestionStatus
};

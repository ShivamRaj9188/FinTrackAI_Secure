const csv = require('csv-parser');
const fs = require('fs');
const { unlink } = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

const Transaction = require('../models/Transaction');
const IngestionJob = require('../models/IngestionJob');
const { extractTransactionsFromPDF } = require('../pdfUtils');
const { validateFileDescriptor, normalizeCsvRow, normalizeParsedTransaction } = require('./fileValidationService');
const { categorizeTransactions } = require('./categorizationService');

const parseCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
};

const safelyRemoveFile = async (filePath) => {
  if (!filePath) return;
  try {
    await unlink(filePath);
  } catch (error) {
    // ignore cleanup errors
  }
};

const summarizePreview = (transactions) => {
  return transactions.slice(0, 5).map((transaction) => ({
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    validationNotes: transaction.validationNotes || []
  }));
};

const ingestFile = async ({ file, userId }) => {
  const fileCheck = validateFileDescriptor(file);

  if (!fileCheck.valid) {
    throw new Error(fileCheck.message);
  }

  const uploadId = uuidv4();
  const job = await IngestionJob.create({
    user: userId,
    uploadId,
    originalFileName: file.originalname,
    mimeType: file.mimetype,
    fileType: fileCheck.fileType,
    status: 'processing'
  });

  try {
    const rawEntries = fileCheck.fileType === 'csv'
      ? await parseCsvFile(file.path)
      : await extractTransactionsFromPDF(file.path, userId, uploadId);

    const normalizedResults = rawEntries.map((entry) => (
      fileCheck.fileType === 'csv'
        ? normalizeCsvRow(entry)
        : normalizeParsedTransaction(entry)
    ));

    const validResults = normalizedResults.filter((result) => result.isValid);
    const invalidResults = normalizedResults.filter((result) => !result.isValid);
    const warningCount = validResults.filter((result) => result.warnings.length > 0).length;

    let transactionsToInsert = validResults.map((result) => ({
      user: userId,
      uploadId,
      ingestionJob: job._id,
      source: 'validated-ingestion',
      sourceType: fileCheck.fileType,
      sourceFileName: file.originalname,
      validationStatus: result.warnings.length ? 'warning' : 'valid',
      validationNotes: result.warnings,
      ...result.transaction
    }));

    transactionsToInsert = await categorizeTransactions(transactionsToInsert, userId, {
      preserveExistingCategory: true
    });

    const insertedTransactions = transactionsToInsert.length
      ? await Transaction.insertMany(transactionsToInsert)
      : [];

    const status = invalidResults.length > 0 || warningCount > 0
      ? 'completed_with_warnings'
      : 'completed';

    job.status = status;
    job.summary = {
      totalRows: rawEntries.length,
      validRows: validResults.length,
      invalidRows: invalidResults.length,
      warningRows: warningCount,
      insertedRows: insertedTransactions.length
    };
    job.preview = summarizePreview(transactionsToInsert);
    job.errorMessages = invalidResults.flatMap((result) => result.errors).slice(0, 20);
    job.warnings = validResults.flatMap((result) => result.warnings).slice(0, 20);
    job.storedTransactionIds = insertedTransactions.map((transaction) => transaction._id);
    job.completedAt = new Date();
    await job.save();

    return {
      job,
      uploadId,
      transactions: insertedTransactions
    };
  } catch (error) {
    job.status = 'failed';
    job.errorMessages = [error.message];
    job.completedAt = new Date();
    await job.save();
    throw error;
  } finally {
    await safelyRemoveFile(file.path);
  }
};

const getIngestionJobForUser = async (jobId, userId) => {
  return IngestionJob.findOne({ _id: jobId, user: userId }).lean();
};

module.exports = {
  ingestFile,
  getIngestionJobForUser
};

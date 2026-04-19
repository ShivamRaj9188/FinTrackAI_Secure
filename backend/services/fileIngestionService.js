const csv = require('csv-parser');
const fs = require('fs');
const { access } = require('fs/promises');
const { unlink } = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

const Transaction = require('../models/Transaction');
const IngestionJob = require('../models/IngestionJob');
const { extractTransactionsFromPDF } = require('../pdfUtils');
const { validateFileDescriptor, normalizeCsvRow, normalizeParsedTransaction } = require('./fileValidationService');
const { categorizeTransactions } = require('./categorizationService');

const MAX_PASSWORD_ATTEMPTS = 3;

const parseCsvFile = async (filePath) => {
  const buffer = await fs.promises.readFile(filePath);
  let content = buffer.toString('utf8');
  
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  const lines = content.split(/\r?\n/);
  let headerLineIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    const parts = line.split(',');
    
    if (parts.length >= 3 && 
      line.includes('date') &&
      (line.includes('amount') ||
        line.includes('debit') ||
        line.includes('withdrawal') ||
        line.includes('description') ||
        line.includes('narration') ||
        line.includes('particulars'))
    ) {
      headerLineIndex = i;
      break;
    }
  }

  const validContent = lines.slice(headerLineIndex).join('\n');

  return new Promise((resolve, reject) => {
    const rows = [];
    const { Readable } = require('stream');
    const rs = new Readable();
    rs.push(validContent);
    rs.push(null);

    rs.pipe(csv())
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
  return transactions
    .filter((transaction) => transaction && typeof transaction === 'object')
    .slice(0, 5)
    .map((transaction) => ({
      date: transaction.date,
      description: typeof transaction.description === 'string' ? transaction.description : '',
      amount: typeof transaction.amount === 'number' ? transaction.amount : Number(transaction.amount) || 0,
      type: typeof transaction.type === 'string' ? transaction.type : '',
      category: typeof transaction.category === 'string' ? transaction.category : '',
      validationNotes: Array.isArray(transaction.validationNotes)
        ? transaction.validationNotes.filter((note) => typeof note === 'string')
        : []
    }));
};

const createClientError = (message, code, statusCode = 400) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const hasPendingFile = async (filePath) => {
  if (!filePath) return false;
  try {
    await access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const markJobAwaitingPassword = async (job, filePath, message) => {
  job.status = 'password_required';
  job.pendingFilePath = filePath;
  job.passwordRequestedAt = new Date();
  job.completedAt = null;
  job.errorMessages = message ? [message] : [];
  job.preview = [];
  job.warnings = [];
  await job.save();
};

const markJobFailed = async (job, message) => {
  const pendingFilePath = job.pendingFilePath;

  job.status = 'failed';
  job.errorMessages = message ? [message] : [];
  job.pendingFilePath = '';
  job.passwordRequestedAt = null;
  job.completedAt = new Date();
  await job.save();

  await safelyRemoveFile(pendingFilePath);
};

const finalizeJobSuccess = async ({ job, rawEntries, validResults, invalidResults, warningCount, transactionsToInsert, insertedTransactions }) => {
  const status = invalidResults.length > 0 || warningCount > 0
    ? 'completed_with_warnings'
    : 'completed';

  const pendingFilePath = job.pendingFilePath;

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
  job.pendingFilePath = '';
  job.passwordRequestedAt = null;
  job.completedAt = new Date();
  await job.save();

  await safelyRemoveFile(pendingFilePath);
};

const runIngestion = async ({ job, userId, filePath, password }) => {
  const rawEntries = job.fileType === 'csv'
    ? await parseCsvFile(filePath)
    : await extractTransactionsFromPDF(filePath, userId, job.uploadId, { password });

  const normalizedResults = rawEntries.map((entry) => (
    job.fileType === 'csv'
      ? normalizeCsvRow(entry)
      : normalizeParsedTransaction(entry)
  ));

  const validResults = normalizedResults.filter((result) => result.isValid);
  const invalidResults = normalizedResults.filter((result) => !result.isValid);
  const warningCount = validResults.filter((result) => result.warnings.length > 0).length;

  let transactionsToInsert = validResults.map((result) => ({
    user: userId,
    uploadId: job.uploadId,
    ingestionJob: job._id,
    source: 'validated-ingestion',
    sourceType: job.fileType,
    sourceFileName: job.originalFileName,
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

  await finalizeJobSuccess({
    job,
    rawEntries,
    validResults,
    invalidResults,
    warningCount,
    transactionsToInsert,
    insertedTransactions
  });

  return {
    job,
    uploadId: job.uploadId,
    transactions: insertedTransactions
  };
};

const handleIngestionError = async ({ error, job, filePath, isRetry }) => {
  if (error.code === 'PDF_PASSWORD_REQUIRED') {
    await markJobAwaitingPassword(job, filePath, 'This PDF is password-protected. Enter the statement password to continue.');
    return {
      requiresPassword: true,
      code: error.code,
      message: 'This PDF is password-protected. Enter the statement password to continue.',
      job,
      uploadId: job.uploadId
    };
  }

  if (error.code === 'INCORRECT_PDF_PASSWORD') {
    job.passwordAttempts += 1;

    if (job.passwordAttempts >= MAX_PASSWORD_ATTEMPTS) {
      await markJobFailed(job, 'Too many incorrect PDF password attempts. Please upload the statement again.');
      throw createClientError('Too many incorrect PDF password attempts. Please upload the statement again.', 'PDF_PASSWORD_ATTEMPTS_EXCEEDED');
    }

    await markJobAwaitingPassword(job, filePath, 'Incorrect PDF password. Please try again.');
    return {
      requiresPassword: true,
      code: error.code,
      message: 'Incorrect PDF password. Please try again.',
      remainingAttempts: MAX_PASSWORD_ATTEMPTS - job.passwordAttempts,
      job,
      uploadId: job.uploadId
    };
  }

  await markJobFailed(job, error.message || 'Failed to ingest file');

  if (isRetry && filePath) {
    await safelyRemoveFile(filePath);
  }

  throw error;
};

const ingestFile = async ({ file, userId, password }) => {
  const fileCheck = validateFileDescriptor(file);

  if (!fileCheck.valid) {
    throw createClientError(fileCheck.message, 'UNSUPPORTED_FILE_TYPE');
  }

  const uploadId = uuidv4();
  const job = await IngestionJob.create({
    user: userId,
    uploadId,
    originalFileName: file.originalname,
    mimeType: file.mimetype,
    fileType: fileCheck.fileType,
    status: 'processing',
    pendingFilePath: file.path
  });

  try {
    return await runIngestion({
      job,
      userId,
      filePath: file.path,
      password
    });
  } catch (error) {
    return handleIngestionError({
      error,
      job,
      filePath: file.path,
      isRetry: false
    });
  }
};

const submitPdfPassword = async ({ jobId, userId, password }) => {
  if (!password || !String(password).trim()) {
    throw createClientError('Password is required to open this statement.', 'PDF_PASSWORD_REQUIRED');
  }

  const job = await IngestionJob.findOne({ _id: jobId, user: userId });

  if (!job) {
    throw createClientError('Ingestion job not found.', 'INGESTION_JOB_NOT_FOUND', 404);
  }

  if (job.fileType !== 'pdf') {
    throw createClientError('This ingestion job does not accept a PDF password.', 'INVALID_INGESTION_JOB');
  }

  if (job.status === 'completed' || job.status === 'completed_with_warnings') {
    return {
      job,
      uploadId: job.uploadId,
      alreadyCompleted: true
    };
  }

  const filePath = job.pendingFilePath;
  const pendingFileExists = await hasPendingFile(filePath);
  if (!pendingFileExists) {
    await markJobFailed(job, 'The uploaded statement is no longer available. Please upload it again.');
    throw createClientError('The uploaded statement expired. Please upload it again.', 'INGESTION_FILE_EXPIRED');
  }

  job.status = 'processing';
  job.errorMessages = [];
  await job.save();

  try {
    return await runIngestion({
      job,
      userId,
      filePath,
      password: String(password)
    });
  } catch (error) {
    return handleIngestionError({
      error,
      job,
      filePath,
      isRetry: true
    });
  }
};

const getIngestionJobForUser = async (jobId, userId) => {
  return IngestionJob.findOne({ _id: jobId, user: userId }).lean();
};

module.exports = {
  ingestFile,
  submitPdfPassword,
  getIngestionJobForUser
};

const assert = require('assert');
const mongoose = require('mongoose');

const IngestionJob = require('../models/IngestionJob');
const { COUNTABLE_INGESTION_STATUSES } = require('../middleware/planLimits');

const run = () => {
  const job = new IngestionJob({
    user: new mongoose.Types.ObjectId(),
    uploadId: 'test-upload-id',
    originalFileName: 'test_transactions.csv',
    mimeType: 'text/csv',
    fileType: 'csv',
    status: 'processing',
    preview: [
      {
        date: new Date('2025-03-01T00:00:00.000Z'),
        description: 'Monthly Salary',
        amount: 75000,
        type: 'credit',
        category: 'Income',
        validationNotes: []
      },
      {
        date: new Date('2025-03-02T00:00:00.000Z'),
        description: 'Rent Payment',
        amount: 18000,
        type: 'debit',
        category: 'Housing',
        validationNotes: ['normalized amount']
      }
    ]
  });

  const validationError = job.validateSync();
  assert.equal(validationError, undefined, validationError?.message);
  assert.equal(job.preview[0].type, 'credit');
  assert.deepEqual(job.preview[1].validationNotes, ['normalized amount']);
  assert.equal(new IngestionJob({ status: 'password_required' }).status, 'password_required');
  assert.ok(COUNTABLE_INGESTION_STATUSES.includes('completed'));
  assert.ok(COUNTABLE_INGESTION_STATUSES.includes('completed_with_warnings'));
  assert.ok(!COUNTABLE_INGESTION_STATUSES.includes('failed'));
  assert.ok(!COUNTABLE_INGESTION_STATUSES.includes('password_required'));

  console.log('IngestionJob preview validation test passed');
};

run();

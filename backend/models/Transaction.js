const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  category: { type: String },
  balance: { type: Number, default: null },
  uploadId: { type: String },
  ingestionJob: { type: mongoose.Schema.Types.ObjectId, ref: 'IngestionJob', default: null },
  source: { type: String, default: 'manual' },
  sourceType: { type: String, default: 'manual' },
  sourceFileName: { type: String, default: '' },
  validationStatus: { type: String, enum: ['valid', 'warning'], default: 'valid' },
  validationNotes: { type: [String], default: [] },
  categorySource: { type: String, default: 'manual' },
  categoryConfidence: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);

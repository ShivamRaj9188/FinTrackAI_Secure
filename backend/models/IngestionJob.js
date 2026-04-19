const mongoose = require('mongoose');

const previewEntrySchema = new mongoose.Schema({
  date: Date,
  description: String,
  amount: Number,
  type: { type: String },
  category: String,
  validationNotes: { type: [String], default: [] }
}, { _id: false });

const ingestionJobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadId: { type: String, required: true, unique: true },
  originalFileName: { type: String, required: true },
  mimeType: { type: String, default: '' },
  fileType: { type: String, enum: ['csv', 'pdf'], required: true },
  status: {
    type: String,
    enum: ['queued', 'processing', 'password_required', 'completed', 'completed_with_warnings', 'failed'],
    default: 'queued'
  },
  summary: {
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 },
    invalidRows: { type: Number, default: 0 },
    warningRows: { type: Number, default: 0 },
    insertedRows: { type: Number, default: 0 }
  },
  preview: {
    type: [previewEntrySchema],
    default: []
  },
  errorMessages: { type: [String], default: [] },
  warnings: { type: [String], default: [] },
  storedTransactionIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  pendingFilePath: { type: String, default: '' },
  passwordAttempts: { type: Number, default: 0 },
  passwordRequestedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.models.IngestionJob || mongoose.model('IngestionJob', ingestionJobSchema);

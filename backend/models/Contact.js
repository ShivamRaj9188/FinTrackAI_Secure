const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    enum: ['Support', 'Feedback', 'Careers', 'Sales', 'Partnership', ''],
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  adminResponse: {
    type: String,
    default: ''
  },
  respondedBy: {
    type: String,
    default: ''
  },
  respondedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
contactSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Contact', contactSchema);

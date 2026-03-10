// User Model - Simple and Clean
const mongoose = require('mongoose');

// User Schema - Keep it simple!
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Not required for Google auth users
  googleId: { type: String, sparse: true, unique: true }, // Added for Google auth
  role: { type: String, default: 'user' },
  phone: { type: String, default: '' },
  dob: { type: Date, default: null },
  location: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  plan: { type: String, enum: ['Basic', 'Pro', 'Enterprise'], default: 'Basic' },
  planStartDate: { type: Date, default: null },
  planEndDate: { type: Date, default: null },
  nextPaymentDate: { type: Date, default: null },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'expired'], default: 'inactive' },
  profileImage: { type: String, default: null }
}, {
  timestamps: true 
});

// Check if the model already exists before creating it
const User = mongoose.models.User || mongoose.model('User', UserSchema);
module.exports = User;

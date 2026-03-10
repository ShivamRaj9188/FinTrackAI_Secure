
// This file connects everything together!

const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });

// Import database connection
const connectDB = require('./database');

// Import authentication functions from the authentication folder
const signup = require('./authentication/signup');
const login = require('./authentication/login');
const adminLogin = require('./authentication/adminLogin');

// Import Google authentication
const passport = require('./googleAuth');
const authRoutes = require('./routes/authRoutes');

// Import dashboard functions
const { verifyToken, getDashboardData, updateProfile } = require('./dashboard');

// Import upload functions
const { upload, uploadTransactions, generateReport } = require('./uploadController');

// Import transaction functions
const { 
  verifyToken: verifyTransactionToken, 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction 
} = require('./transactionController');

// Import user functions
const { 
  getUserProfile, 
  updateUserProfile, 
  deleteUserAccount, 
  verifyUserAccount,
  verifyToken: verifyUserToken 
} = require('./userController');

// Import admin functions
const {
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  createUser,
  updateUser,
  getAnalytics,
  getUserGrowthData,
  sendNotification,
  toggleMaintenanceMode,
  getMaintenanceStatus,
  checkMaintenanceMode
} = require('./adminController');

// Import newsletter functions
const { 
  subscribeNewsletter, 
  unsubscribeNewsletter, 
  getAllSubscribers 
} = require('./newsletterController');

// Import contact functions
const { 
  sendContactMessage, 
  getContactMessages, 
  getContactStats, 
  updateContactMessage, 
  sendEmailResponse, 
  deleteContactMessage 
} = require('./contactController');

// Import payment functions
const {
  processPayment,
  getPaymentHistory,
  getSubscriptionStatus
} = require('./paymentController');

// Import strict auth middleware
const strictAuthMiddleware = require('./middleware/strictAuth');

// Import email service for testing
const { sendWelcomeEmail } = require('./emailService');

// Create Express app
const app = express();

// Basic middleware (what our app needs to work)
app.use(express.json({ limit: '10mb' })); // To read JSON data with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      'https://fintrackai-delta.vercel.app',
      'https://fintrackai-j3ldui64a-varunjoshi84s-projects.vercel.app',
      'https://fintrackai-git-main-varunjoshi84s-projects.vercel.app',
      'http://localhost:5173', // Development (Vite)
      'http://localhost:3000', // Alternative dev port
      'http://localhost:8080', // Vue/Webpack dev server
      'http://localhost:4200'  // Angular dev server
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Session middleware for passport
let session;
try {
  session = require('express-session');
} catch (error) {
  console.error('Error loading express-session:', error);
  console.log('Installing express-session...');
  require('child_process').execSync('npm install express-session --save');
  session = require('express-session');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Apply maintenance mode middleware (before other routes)
app.use(checkMaintenanceMode);

// Connect to database
connectDB();


// Health check - test if server is working
app.get('/', (req, res) => {
  res.json({ 
    message: 'FinTrackAI Backend is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint for deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Import upload limit middleware
const { checkUploadLimit } = require('./middleware/planLimits');

// Upload Transactions Endpoint (Protected - require STRICT authentication)
// Upload File Endpoint (for generic file uploads)
app.post('/api/upload/file', strictAuthMiddleware, checkUploadLimit, upload.single('file'), uploadTransactions);
// Existing transactions upload endpoint - NOW WITH STRICT AUTHENTICATION
app.post('/api/upload/transactions', strictAuthMiddleware, checkUploadLimit, upload.single('file'), uploadTransactions);
// Generate report endpoint (after upload)
app.get('/api/reports/generate', strictAuthMiddleware, generateReport);
app.post('/api/reports/generate', strictAuthMiddleware, generateReport);

// Authentication Routes
app.post('/api/auth/register', signup);     // User signup
app.post('/api/auth/login', login);         // User login  
app.post('/api/auth/admin/login', adminLogin); // Admin login

// Google Authentication Routes
app.use('/api/auth', authRoutes);

// Dashboard Routes (Protected - require STRICT authentication)
app.get('/api/dashboard', strictAuthMiddleware, getDashboardData);    // Get user dashboard data
app.put('/api/dashboard/profile', strictAuthMiddleware, updateProfile); // Update user profile

// Transaction Routes (Protected - require STRICT authentication)
app.get('/api/transactions', strictAuthMiddleware, getTransactions);        // Get user transactions
app.post('/api/transactions', strictAuthMiddleware, addTransaction);        // Add new transaction
app.put('/api/transactions/:id', strictAuthMiddleware, updateTransaction);  // Update transaction
app.delete('/api/transactions/:id', strictAuthMiddleware, deleteTransaction); // Delete transaction

// Admin Routes (Protected - require admin authentication)
app.get('/api/admin/stats', verifyUserToken, getAdminStats);           // Get admin dashboard stats
app.get('/api/admin/users', verifyUserToken, getAllUsers);             // Get all users with pagination
app.get('/api/admin/users/:userId', verifyUserToken, getUserById);     // Get single user
app.patch('/api/admin/users/:userId/status', verifyUserToken, updateUserStatus); // Update user status
app.delete('/api/admin/users/:userId', verifyUserToken, deleteUser);   // Delete user
app.post('/api/admin/users', verifyUserToken, createUser);             // Create new user
app.put('/api/admin/users/:userId', verifyUserToken, updateUser);      // Update user
app.get('/api/admin/analytics', verifyUserToken, getAnalytics);        // Get analytics data
app.get('/api/admin/analytics/user-growth', verifyUserToken, getUserGrowthData); // Get user growth data
app.post('/api/admin/notification', verifyUserToken, sendNotification); // Send notification to users
app.post('/api/admin/maintenance', verifyUserToken, toggleMaintenanceMode); // Toggle maintenance mode
app.get('/api/maintenance/status', getMaintenanceStatus); // Get maintenance status (public)

// User Routes (Protected - require STRICT authentication)
app.get('/api/user/profile', strictAuthMiddleware, getUserProfile);        // Get user profile
app.put('/api/user/profile', strictAuthMiddleware, updateUserProfile);     // Update user profile
app.delete('/api/user/account', strictAuthMiddleware, deleteUserAccount);  // Delete user account
app.post('/api/user/verify', strictAuthMiddleware, verifyUserAccount);     // Verify user account

// Import and add plan limits route
const { getUserPlanLimits } = require('./middleware/planLimits');
app.get('/api/user/plan-limits', strictAuthMiddleware, getUserPlanLimits);  // Get user plan limits

// Payment Routes (Protected - require STRICT authentication)
app.post('/api/payment/process', strictAuthMiddleware, processPayment);     // Process payment after Razorpay success
app.get('/api/payment/history', strictAuthMiddleware, getPaymentHistory);   // Get payment history
app.get('/api/subscription/status', strictAuthMiddleware, getSubscriptionStatus); // Get subscription status

// Newsletter Routes (Public - no authentication required)
app.post('/api/newsletter/subscribe', subscribeNewsletter);            // Subscribe to newsletter
app.post('/api/newsletter/unsubscribe', unsubscribeNewsletter);        // Unsubscribe from newsletter
app.get('/api/newsletter/subscribers', verifyUserToken, getAllSubscribers); // Get all subscribers (admin only)

// Contact Routes (Public - no authentication required)
app.post('/api/contact/send', sendContactMessage);                     // Send contact form message

// Admin Contact Management Routes (Requires authentication)
app.get('/api/admin/contacts', verifyUserToken, getContactMessages);           // Get all contact messages
app.get('/api/admin/contacts/stats', verifyUserToken, getContactStats);        // Get contact statistics
app.put('/api/admin/contacts/:id', verifyUserToken, updateContactMessage);     // Update contact status/response
app.post('/api/admin/contacts/:id/respond', verifyUserToken, sendEmailResponse); // Send email response
app.delete('/api/admin/contacts/:id', verifyUserToken, deleteContactMessage);  // Delete contact message

// Test email endpoint 
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }
    
    const result = await sendWelcomeEmail(email);
    
    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully!' : 'Failed to send email',
      details: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log based on LOG_LEVEL
  if (process.env.LOG_LEVEL !== 'error' || process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.message);
  }
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});



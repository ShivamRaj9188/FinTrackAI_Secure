
// This file connects everything together!

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
console.log('MONGODB_URI Loaded:', process.env.MONGODB_URI ? 'YES' : 'NO');

// Import database connection
const connectDB = require('./database');

// Import authentication functions from the authentication folder
const signup = require('./authentication/signup');
const login = require('./authentication/login');
const adminLogin = require('./authentication/adminLogin');

// Import Google authentication
const passport = require('./googleAuth');
const authRoutes = require('./routes/authRoutes');
const googleOAuthMetadataRoutes = require('./routes/googleOAuthMetadataRoutes');
const ingestionRoutes = require('./routes/ingestionRoutes');
const categorizationRoutes = require('./routes/categorizationRoutes');
const insightsAnalyticsRoutes = require('./routes/insightsAnalyticsRoutes');

// Import dashboard functions
const { getDashboardData, updateProfile } = require('./dashboard');

// Import validation middleware
const { registerValidation, loginValidation, transactionValidation } = require('./middleware/validation');

// Import upload functions
const { upload, uploadTransactions, generateReport } = require('./uploadController');

// Import transaction functions
const {
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
  createOrder,
  verifyPayment,
  processPayment,
  getPaymentHistory,
  getSubscriptionStatus
} = require('./paymentController');

// Import insights controller
const { generateInsights } = require('./insightsController');

// Import strict auth middleware with role-based access control
const strictAuthMiddleware = require('./middleware/strictAuth');
const { requireRole } = require('./middleware/strictAuth');

// Import email service for testing
const { sendWelcomeEmail } = require('./emailService');

// Create Express app
const app = express();
app.set('trust proxy', 1);

// Basic middleware (what our app needs to work)
app.use(express.json({ limit: '10mb' })); // To read JSON data with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  'https://fin-track-ai-secure.vercel.app',
  'https://fintrackai-delta.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Security Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(xss()); // Sanitize user input from incoming POST, GET, and params
app.use(mongoSanitize()); // Prevent NoSQL injection

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/', globalLimiter);

// Auth Rate Limiting (Stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Limit each IP to 10 auth requests per 15 mins
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  }
});
app.use('/api/auth/', authLimiter);

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

const { getSessionSecret } = require('./utils/secretHelper');
app.use(session({
  secret: getSessionSecret(),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Apply maintenance mode middleware (before other routes)
app.use(checkMaintenanceMode);

// Ensure database is connected before handling any API requests
app.use(async (req, res, next) => {
  try {
    if (req.path.startsWith('/api/') || req.path === '/health') {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection failed in middleware:', error);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});


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
app.post('/api/auth/register', registerValidation, signup);     // User signup (with validation)
app.post('/api/auth/login', loginValidation, login);         // User login (with validation)
app.post('/api/auth/admin/login', loginValidation, adminLogin); // Admin login (with validation)

// Google Authentication Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleOAuthMetadataRoutes);
app.use('/api/ingestion', ingestionRoutes);
app.use('/api/categorization', categorizationRoutes);
app.use('/api/insights', insightsAnalyticsRoutes);

// Endpoint to check if Google Auth is configured (for frontend UI)
app.get('/api/auth/google/status', (req, res) => {
  res.json({
    enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'mock_id'),
    message: (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'mock_id') 
      ? 'Google OAuth is configured' 
      : 'Google OAuth setup required'
  });
});

// AI Insights Route (Protected)
app.post('/api/insights/generate', strictAuthMiddleware, generateInsights);

// Dashboard Routes (Protected - require STRICT authentication)
app.get('/api/dashboard', strictAuthMiddleware, getDashboardData);    // Get user dashboard data
app.put('/api/dashboard/profile', strictAuthMiddleware, updateProfile); // Update user profile

// Transaction Routes (Protected - require STRICT authentication)
app.get('/api/transactions', strictAuthMiddleware, getTransactions);        // Get user transactions
app.post('/api/transactions', strictAuthMiddleware, transactionValidation, addTransaction);        // Add new transaction (with validation)
app.put('/api/transactions/:id', strictAuthMiddleware, transactionValidation, updateTransaction);  // Update transaction (with validation)
app.delete('/api/transactions/:id', strictAuthMiddleware, deleteTransaction); // Delete transaction

// Admin Routes (Protected - require admin role via RBAC)
app.get('/api/admin/stats', strictAuthMiddleware, requireRole('admin'), getAdminStats);
app.get('/api/admin/users', strictAuthMiddleware, requireRole('admin'), getAllUsers);
app.get('/api/admin/users/:userId', strictAuthMiddleware, requireRole('admin'), getUserById);
app.patch('/api/admin/users/:userId/status', strictAuthMiddleware, requireRole('admin'), updateUserStatus);
app.delete('/api/admin/users/:userId', strictAuthMiddleware, requireRole('admin'), deleteUser);
app.post('/api/admin/users', strictAuthMiddleware, requireRole('admin'), createUser);
app.put('/api/admin/users/:userId', strictAuthMiddleware, requireRole('admin'), updateUser);
app.get('/api/admin/analytics', strictAuthMiddleware, requireRole('admin'), getAnalytics);
app.get('/api/admin/analytics/user-growth', strictAuthMiddleware, requireRole('admin'), getUserGrowthData);
app.post('/api/admin/notification', strictAuthMiddleware, requireRole('admin'), sendNotification);
app.post('/api/admin/maintenance', strictAuthMiddleware, requireRole('admin'), toggleMaintenanceMode);
app.get('/api/maintenance/status', getMaintenanceStatus); // Public

// User Routes (Protected - require STRICT authentication)
app.get('/api/user/profile', strictAuthMiddleware, getUserProfile);        // Get user profile
app.put('/api/user/profile', strictAuthMiddleware, updateUserProfile);     // Update user profile
app.delete('/api/user/account', strictAuthMiddleware, deleteUserAccount);  // Delete user account
app.post('/api/user/verify', strictAuthMiddleware, verifyUserAccount);     // Verify user account

// Import and add plan limits route
const { getUserPlanLimits } = require('./middleware/planLimits');
app.get('/api/user/plan-limits', strictAuthMiddleware, getUserPlanLimits);  // Get user plan limits

// Payment Routes (Protected - require STRICT authentication)
app.post('/api/payment/create-order', strictAuthMiddleware, createOrder);   // Step 1: Create Razorpay order
app.post('/api/payment/verify', strictAuthMiddleware, verifyPayment);        // Step 2: Verify signature & activate plan
app.post('/api/payment/process', strictAuthMiddleware, processPayment);      // Legacy fallback
app.get('/api/payment/history', strictAuthMiddleware, getPaymentHistory);    // Get payment history
app.get('/api/subscription/status', strictAuthMiddleware, getSubscriptionStatus); // Get subscription status

// Newsletter Routes (Public - no authentication required)
app.post('/api/newsletter/subscribe', subscribeNewsletter);            // Subscribe to newsletter
app.post('/api/newsletter/unsubscribe', unsubscribeNewsletter);        // Unsubscribe from newsletter
app.get('/api/newsletter/subscribers', strictAuthMiddleware, requireRole('admin'), getAllSubscribers); // Admin only

// Contact Routes (Public - no authentication required)
app.post('/api/contact/send', sendContactMessage);                     // Send contact form message

// Admin Contact Management Routes (Requires admin role)
app.get('/api/admin/contacts', strictAuthMiddleware, requireRole('admin'), getContactMessages);
app.get('/api/admin/contacts/stats', strictAuthMiddleware, requireRole('admin'), getContactStats);
app.put('/api/admin/contacts/:id', strictAuthMiddleware, requireRole('admin'), updateContactMessage);
app.post('/api/admin/contacts/:id/respond', strictAuthMiddleware, requireRole('admin'), sendEmailResponse);
app.delete('/api/admin/contacts/:id', strictAuthMiddleware, requireRole('admin'), deleteContactMessage);

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

// Export app for Vercel Serverless Functions
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Start server locally
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
}

const Transaction = require('./models/Transaction');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { extractTransactionsFromPDF } = require('./pdfUtils');
const { v4: uuidv4 } = require('uuid');
const { checkUploadLimit } = require('./middleware/planLimits');
const User = require('./authentication/User');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Handle file upload and extract transactions
const uploadTransactions = async (req, res) => {
  try {
    // Check upload limits first
    const user = await User.findById(req.user.id);
    const userPlan = user.plan || 'Basic';
    
    // Count uploads this month for Basic users
    if (userPlan === 'Basic') {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const uploadCount = await Transaction.distinct('uploadId', {
        user: req.user.id,
        createdAt: { $gte: startOfMonth }
      }).then(ids => ids.length);
      
      if (uploadCount >= 5) {
        return res.status(403).json({
          success: false,
          message: 'Upload limit reached. Basic plan allows 5 uploads per month. Upgrade to Pro for unlimited uploads.',
          planLimit: true,
          currentPlan: userPlan,
          upgradeRequired: true
        });
      }
    }
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const mimetype = req.file.mimetype;
    let transactions = [];

    // Debug log for file info
    console.log('Upload received:', {
      originalname: req.file.originalname,
      path: filePath,
      ext,
      mimetype
    });

    // Accept .pdf and .csv by extension, and allow application/pdf, text/csv, application/octet-stream
    const isPDF = ext === '.pdf' && (mimetype === 'application/pdf' || mimetype === 'application/octet-stream');
    const isCSV = ext === '.csv' && (mimetype === 'text/csv' || mimetype === 'application/octet-stream');

    // Generate a unique uploadId for this upload
    const uploadId = uuidv4();

    // Get userId from authentication middleware
    const userId = req.user ? (req.user._id || req.user.id) : null;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }
    
    console.log('Upload - Authenticated user ID:', userId);

    if (isPDF) {
      try {
        console.log('Processing PDF with userId:', userId);
        transactions = await extractTransactionsFromPDF(filePath, userId, uploadId);
        fs.unlinkSync(filePath);
        let saved = [];
        if (transactions.length) {
          // Insert transactions
          saved = await Transaction.insertMany(transactions);
          console.log('Saved transactions:', saved.length);
        }
        return res.json({ success: true, message: 'PDF transactions extracted', data: saved, uploadId });
      } catch (pdfError) {
        console.error('PDF extraction error:', pdfError);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(500).json({ success: false, message: 'PDF extraction error', error: pdfError });
      }
    } else if (isCSV) {
      try {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            if (row.date && row.description && row.amount && row.type) {
              transactions.push({
                date: new Date(row.date),
                description: row.description,
                amount: parseFloat(row.amount),
                type: row.type.toLowerCase(),
                category: row.category || '',
                uploadId,
                user: userId
              });
            }
          })
          .on('end', async () => {
            try {
              const saved = await Transaction.insertMany(transactions);
              fs.unlinkSync(filePath);
              res.json({ success: true, message: 'CSV transactions uploaded', data: saved, uploadId });
            } catch (dbError) {
              console.error('CSV DB error:', dbError);
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
              res.status(500).json({ success: false, message: 'DB error', error: dbError });
            }
          })
          .on('error', (csvError) => {
            console.error('CSV parse error:', csvError);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            res.status(500).json({ success: false, message: 'CSV parse error', error: csvError });
          });
      } catch (csvOuterError) {
        console.error('CSV outer error:', csvOuterError);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(500).json({ success: false, message: 'CSV upload error', error: csvOuterError });
      }
    } else {
      console.error('Unsupported file type:', ext, mimetype);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Upload error', error });
  }
};

// Generate report endpoint
const generateReport = async (req, res) => {
  try {
    // Get userId from authenticated user
    const userId = req.user ? req.user._id || req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    // Get fileId from request body or query parameters
    const fileId = req.body?.fileId || req.query?.fileId;
    
    console.log('Generate Report - User ID:', userId, 'File ID:', fileId);
    
    // Build query - always filter by user
    let query = { user: userId };
    
    // If we have a fileId, also filter by that
    if (fileId) {
      query.uploadId = fileId;
    }
    
    console.log('Transaction query:', query);
    
    // Find transactions for this user only
    const transactions = await Transaction.find(query).sort({ date: 1 });
    console.log('Found transactions for user:', transactions.length);
    
    // Calculate date range if transactions exist
    let dateRange = null;
    if (transactions.length > 0) {
      const startDate = new Date(transactions[0].date);
      const endDate = new Date(transactions[transactions.length - 1].date);
      dateRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    }
    
    res.json({ 
      success: true, 
      report: transactions,
      dateRange: dateRange
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ success: false, message: 'Report generation error', error: error.message });
  }
};

module.exports = { upload, uploadTransactions, generateReport };

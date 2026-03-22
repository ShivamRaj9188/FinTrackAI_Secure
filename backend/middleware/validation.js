const { body, validationResult } = require('express-validator');

// Error handling for validation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

// Auth Validations
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

// Transaction Validations
const transactionValidation = [
    body('type').isIn(['debit', 'credit']).withMessage('Type must be either debit or credit'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 200 }),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    transactionValidation
};

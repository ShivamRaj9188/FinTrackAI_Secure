const { normalizeCategoryName } = require('../utils/categoryRules');

const SUPPORTED_FILE_TYPES = {
  csv: {
    extensions: ['.csv'],
    mimeTypes: ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'application/octet-stream']
  },
  pdf: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf', 'application/octet-stream']
  }
};

const DATE_KEYS = ['date', 'transaction date', 'transaction_date', 'value date'];
const DESCRIPTION_KEYS = ['description', 'narration', 'details', 'remarks', 'merchant'];
const AMOUNT_KEYS = ['amount', 'transaction amount', 'value'];
const DEBIT_KEYS = ['debit', 'withdrawal', 'withdrawals'];
const CREDIT_KEYS = ['credit', 'deposit', 'deposits'];
const TYPE_KEYS = ['type', 'transaction type'];
const CATEGORY_KEYS = ['category'];
const BALANCE_KEYS = ['balance', 'closing balance'];

const normalizeText = (value) => {
  return String(value || '').replace(/\s+/g, ' ').trim();
};

const parseAmount = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN;
  }

  const normalized = String(value || '')
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/\((.*?)\)/, '-$1')
    .trim();

  if (!normalized) return NaN;
  return Number.parseFloat(normalized);
};

const parseOptionalAmount = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseAmount(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const compact = String(value).trim();
  const ddmmyyyy = compact.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const next = new Date(`${year}-${month}-${day}`);
    if (!Number.isNaN(next.getTime())) return next;
  }

  return null;
};

const pickValue = (row, keys) => {
  const mapped = Object.entries(row || {}).reduce((acc, [key, value]) => {
    acc[String(key).trim().toLowerCase()] = value;
    return acc;
  }, {});

  for (const key of keys) {
    if (mapped[key] !== undefined && mapped[key] !== null && mapped[key] !== '') {
      return mapped[key];
    }
  }

  return undefined;
};

const resolveType = ({ typeValue, amountValue, debitValue, creditValue }) => {
  const explicitType = normalizeText(typeValue).toLowerCase();
  if (explicitType === 'credit' || explicitType === 'income') return 'credit';
  if (explicitType === 'debit' || explicitType === 'expense') return 'debit';

  if (Number.isFinite(debitValue) && debitValue > 0) return 'debit';
  if (Number.isFinite(creditValue) && creditValue > 0) return 'credit';
  if (Number.isFinite(amountValue) && amountValue < 0) return 'debit';
  if (Number.isFinite(amountValue) && amountValue > 0) return 'credit';

  return '';
};

const validateFileDescriptor = (file) => {
  const originalName = String(file?.originalname || '').toLowerCase();
  const mimeType = String(file?.mimetype || '').toLowerCase();

  for (const [fileType, config] of Object.entries(SUPPORTED_FILE_TYPES)) {
    const matchesExtension = config.extensions.some((extension) => originalName.endsWith(extension));
    const matchesMimeType = config.mimeTypes.includes(mimeType);

    if (matchesExtension && (matchesMimeType || !mimeType)) {
      return { valid: true, fileType };
    }
  }

  return {
    valid: false,
    fileType: null,
    message: 'Unsupported file type. Only CSV and PDF files are supported.'
  };
};

const normalizeCsvRow = (row) => {
  const rawDate = pickValue(row, DATE_KEYS);
  const rawDescription = pickValue(row, DESCRIPTION_KEYS);
  const rawAmount = pickValue(row, AMOUNT_KEYS);
  const rawDebit = pickValue(row, DEBIT_KEYS);
  const rawCredit = pickValue(row, CREDIT_KEYS);
  const rawType = pickValue(row, TYPE_KEYS);
  const rawCategory = pickValue(row, CATEGORY_KEYS);
  const rawBalance = pickValue(row, BALANCE_KEYS);

  const debitValue = parseOptionalAmount(rawDebit);
  const creditValue = parseOptionalAmount(rawCredit);
  let amount = parseOptionalAmount(rawAmount);

  if (!Number.isFinite(amount) && Number.isFinite(debitValue)) amount = debitValue;
  if (!Number.isFinite(amount) && Number.isFinite(creditValue)) amount = creditValue;

  const type = resolveType({
    typeValue: rawType,
    amountValue: amount,
    debitValue,
    creditValue
  });

  const description = normalizeText(rawDescription);
  const date = parseDate(rawDate);
  const warnings = [];
  const errors = [];

  if (!date) errors.push('Invalid or missing transaction date');
  if (!description) errors.push('Missing transaction description');
  if (!Number.isFinite(amount) || amount === 0) errors.push('Invalid or missing transaction amount');
  if (!type) errors.push('Unable to determine transaction type');

  if (!rawCategory) {
    warnings.push('Category missing; will be auto-classified');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    transaction: errors.length === 0 ? {
      date,
      description,
      amount: Math.abs(amount),
      type,
      category: normalizeCategoryName(rawCategory) || '',
      balance: parseOptionalAmount(rawBalance)
    } : null
  };
};

const normalizeParsedTransaction = (transaction = {}) => {
  const date = parseDate(transaction.date);
  const description = normalizeText(transaction.description);
  const amount = parseOptionalAmount(transaction.amount);
  const type = normalizeText(transaction.type).toLowerCase();
  const warnings = [];
  const errors = [];

  if (!date) errors.push('Invalid or missing transaction date');
  if (!description) errors.push('Missing transaction description');
  if (!Number.isFinite(amount) || amount === 0) errors.push('Invalid or missing transaction amount');
  if (!['credit', 'debit'].includes(type)) errors.push('Invalid transaction type');
  if (!transaction.category) warnings.push('Category missing; will be auto-classified');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    transaction: errors.length === 0 ? {
      date,
      description,
      amount: Math.abs(amount),
      type,
      category: normalizeCategoryName(transaction.category) || '',
      balance: parseOptionalAmount(transaction.balance)
    } : null
  };
};

module.exports = {
  validateFileDescriptor,
  normalizeCsvRow,
  normalizeParsedTransaction
};

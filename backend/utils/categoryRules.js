const CATEGORY_RULES = [
  {
    name: 'Income',
    keywords: ['salary', 'payroll', 'bonus', 'income', 'refund', 'interest', 'dividend', 'credited', 'deposit']
  },
  {
    name: 'Food & Dining',
    keywords: ['zomato', 'swiggy', 'restaurant', 'cafe', 'food', 'dining', 'grocery', 'groceries', 'supermarket', 'blinkit', 'zepto']
  },
  {
    name: 'Housing',
    keywords: ['rent', 'maintenance', 'mortgage', 'housing', 'society', 'apartment']
  },
  {
    name: 'Transportation',
    keywords: ['uber', 'ola', 'metro', 'petrol', 'fuel', 'diesel', 'parking', 'transport', 'cab', 'auto']
  },
  {
    name: 'Utilities',
    keywords: ['electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'mobile bill', 'recharge', 'utility']
  },
  {
    name: 'Shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'store', 'retail', 'purchase']
  },
  {
    name: 'Entertainment',
    keywords: ['netflix', 'spotify', 'prime', 'movie', 'cinema', 'hotstar', 'playstation', 'entertainment']
  },
  {
    name: 'Health',
    keywords: ['hospital', 'pharmacy', 'medicine', 'doctor', 'clinic', 'health', 'medical']
  },
  {
    name: 'Education',
    keywords: ['course', 'college', 'school', 'tuition', 'udemy', 'coursera', 'education', 'book']
  },
  {
    name: 'Travel',
    keywords: ['flight', 'train', 'hotel', 'travel', 'trip', 'airbnb', 'booking']
  },
  {
    name: 'Bills & EMI',
    keywords: ['emi', 'loan', 'credit card', 'insurance', 'premium', 'bill payment']
  },
  {
    name: 'Transfers',
    keywords: ['transfer', 'upi', 'imps', 'neft', 'rtgs', 'bank transfer']
  },
  {
    name: 'Other',
    keywords: []
  }
];

const normalizeCategoryName = (value) => {
  if (!value) return '';

  const normalized = String(value).trim().toLowerCase();
  const match = CATEGORY_RULES.find((rule) => rule.name.toLowerCase() === normalized);
  if (match) return match.name;

  if (normalized.includes('food')) return 'Food & Dining';
  if (normalized.includes('transport')) return 'Transportation';
  if (normalized.includes('utilit')) return 'Utilities';
  if (normalized.includes('shop')) return 'Shopping';
  if (normalized.includes('entertain')) return 'Entertainment';
  if (normalized.includes('health') || normalized.includes('medical')) return 'Health';
  if (normalized.includes('educat')) return 'Education';
  if (normalized.includes('travel')) return 'Travel';
  if (normalized.includes('income')) return 'Income';
  if (normalized.includes('rent') || normalized.includes('house')) return 'Housing';

  return String(value).trim();
};

module.exports = {
  CATEGORY_RULES,
  normalizeCategoryName
};

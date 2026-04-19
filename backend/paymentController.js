const crypto = require('crypto');
const User = require('./authentication/User');
const Payment = require('./models/Payment');

// ---------------------------------------------------------------------------
// Razorpay SDK initialisation (lazy so server starts even without keys)
// ---------------------------------------------------------------------------
let razorpayInstance = null;

const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'YOUR_RAZORPAY_KEY_ID') {
    throw new Error(
      'Razorpay keys are not configured. ' +
      'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env'
    );
  }

  const Razorpay = require('razorpay');
  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayInstance;
};

// ---------------------------------------------------------------------------
// Plan pricing (in paise — 1 INR = 100 paise)
// ---------------------------------------------------------------------------
const PLAN_PRICES = {
  Pro: {
    monthly:    14900,   // ₹149
    yearly:    149000,   // ₹1490
  },
  Enterprise: {
    monthly:    99900,   // ₹999
    yearly:    999000,   // ₹9990
  },
};

// ---------------------------------------------------------------------------
// POST /api/payment/create-order
// Creates a Razorpay order and returns it to the frontend
// ---------------------------------------------------------------------------
const createOrder = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { plan, billing = 'monthly' } = req.body;

    if (!plan || !PLAN_PRICES[plan]) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan. Choose from: ${Object.keys(PLAN_PRICES).join(', ')}`,
      });
    }

    if (!['monthly', 'yearly'].includes(billing)) {
      return res.status(400).json({ success: false, message: 'billing must be "monthly" or "yearly"' });
    }

    const amount = PLAN_PRICES[plan][billing];

    let razorpay;
    try {
      razorpay = getRazorpay();
    } catch (err) {
      return res.status(503).json({ success: false, message: err.message });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `order_${req.user.id}_${Date.now()}`.slice(0, 40),
      notes: {
        userId: String(req.user.id),
        plan,
        billing,
      },
    });

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
      billing,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/payment/verify
// Verifies Razorpay signature, saves payment record, upgrades user plan
// ---------------------------------------------------------------------------
const verifyPayment = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      billing = 'monthly',
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required payment fields' });
    }

    // --- Signature verification ---
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret === 'YOUR_RAZORPAY_KEY_SECRET') {
      return res.status(503).json({ success: false, message: 'Payment service not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn('⚠️  Invalid Razorpay signature for payment:', razorpay_payment_id);
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    // --- Compute subscription dates ---
    const startDate = new Date();
    const endDate = new Date();
    if (billing === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // --- Save payment record ---
    const payment = await Payment.create({
      user: req.user.id,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      amount: amount / 100,   // paise → rupees
      plan,
      billing,
      status: 'completed',
      startDate,
      endDate,
      nextPaymentDate: endDate,
    });

    // --- Upgrade user plan ---
    await User.findByIdAndUpdate(req.user.id, {
      plan,
      planStartDate: startDate,
      planEndDate: endDate,
      nextPaymentDate: endDate,
      subscriptionStatus: 'active',
    });

    return res.json({
      success: true,
      message: `Successfully upgraded to ${plan} plan!`,
      data: {
        paymentId: razorpay_payment_id,
        plan,
        billing,
        validUntil: endDate,
        nextPayment: endDate,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/payment/process  (legacy — kept for backward compat)
// ---------------------------------------------------------------------------
const processPayment = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { razorpay_payment_id, razorpay_order_id, amount, plan, billing = 'monthly' } = req.body;

    if (!razorpay_payment_id || !amount || !plan) {
      return res.status(400).json({ success: false, message: 'Missing required payment details' });
    }

    const startDate = new Date();
    const endDate = new Date();
    if (billing === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    await Payment.create({
      user: req.user.id,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id || `order_${Date.now()}`,
      amount: amount / 100,
      plan,
      billing,
      status: 'completed',
      startDate,
      endDate,
      nextPaymentDate: endDate,
    });

    await User.findByIdAndUpdate(req.user.id, {
      plan,
      planStartDate: startDate,
      planEndDate: endDate,
      nextPaymentDate: endDate,
      subscriptionStatus: 'active',
    });

    return res.json({
      success: true,
      message: 'Payment processed successfully',
      data: { paymentId: razorpay_payment_id, plan, billing, validUntil: endDate },
    });
  } catch (error) {
    console.error('Process payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process payment' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/payment/history
// ---------------------------------------------------------------------------
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get payment history' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/subscription/status
// ---------------------------------------------------------------------------
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('plan planEndDate nextPaymentDate subscriptionStatus planStartDate');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const isExpired = user.planEndDate && new Date(user.planEndDate) < now;
    const daysRemaining = user.planEndDate
      ? Math.max(0, Math.ceil((new Date(user.planEndDate) - now) / (1000 * 60 * 60 * 24)))
      : 0;

    return res.json({
      success: true,
      data: {
        currentPlan: user.plan || 'Basic',
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate,
        nextPaymentDate: user.nextPaymentDate,
        subscriptionStatus: isExpired ? 'expired' : (user.subscriptionStatus || 'inactive'),
        daysRemaining,
        isActive: !isExpired && user.subscriptionStatus === 'active',
      },
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get subscription status' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  processPayment,
  getPaymentHistory,
  getSubscriptionStatus,
};
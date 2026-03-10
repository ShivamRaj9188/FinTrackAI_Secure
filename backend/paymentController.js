const User = require('./authentication/User');
const Payment = require('./models/Payment');

// Process payment after Razorpay success
const processPayment = async (req, res) => {
  try {
    console.log('Payment processing attempt:', {
      hasUser: !!req.user,
      userId: req.user?.id,
      userEmail: req.user?.email
    });
    
    // HARD AUTHENTICATION BLOCK
    if (!req.user || !req.user.id || !req.user.email) {
      console.log('BLOCKED: Payment attempt without proper authentication');
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: You must be logged in to process payments'
      });
    }
    
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      amount, 
      plan, 
      billing 
    } = req.body;

    const userId = req.user.id || req.user._id;
    console.log('Processing payment for user:', userId);

    console.log('Payment request body:', req.body);
    
    if (!razorpay_payment_id || !amount || !plan || !billing) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details: payment_id, amount, plan, billing'
      });
    }
    
    // Use fallback order ID if not provided (for demo payments)
    const orderIdToUse = razorpay_order_id || `demo_order_${Date.now()}`;

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    const nextPaymentDate = new Date();

    if (billing === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    }

    // Create payment record
    const payment = new Payment({
      user: userId,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: orderIdToUse,
      amount: amount / 100, // Convert from paise to rupees
      plan,
      billing,
      status: 'completed',
      startDate,
      endDate,
      nextPaymentDate
    });

    await payment.save();

    // Update user plan
    await User.findByIdAndUpdate(userId, {
      plan: plan,
      planStartDate: startDate,
      planEndDate: endDate,
      nextPaymentDate: nextPaymentDate,
      subscriptionStatus: 'active'
    });

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: razorpay_payment_id,
        plan: plan,
        billing: billing,
        validUntil: endDate,
        nextPayment: nextPaymentDate
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// Get user's payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
};

// Get current subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select('plan planEndDate nextPaymentDate subscriptionStatus');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if subscription is expired
    const now = new Date();
    const isExpired = user.planEndDate && new Date(user.planEndDate) < now;

    res.json({
      success: true,
      data: {
        currentPlan: user.plan || 'Basic',
        planEndDate: user.planEndDate,
        nextPaymentDate: user.nextPaymentDate,
        subscriptionStatus: isExpired ? 'expired' : (user.subscriptionStatus || 'inactive'),
        daysRemaining: user.planEndDate ? Math.ceil((new Date(user.planEndDate) - now) / (1000 * 60 * 60 * 24)) : 0
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status'
    });
  }
};

module.exports = {
  processPayment,
  getPaymentHistory,
  getSubscriptionStatus
};
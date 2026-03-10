const Newsletter = require('./Newsletter');
const { sendWelcomeEmail } = require('./emailService');

// Subscribe to newsletter
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        await existingSubscription.save();
        
        // Send welcome back email
        try {
          await sendWelcomeEmail(email);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the subscription if email fails
        }
        
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your newsletter subscription has been reactivated. Check your email for confirmation! 🎉',
          data: { email }
        });
      }
    }

    // Create new subscription
    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    // Send welcome email to new subscriber
    try {
      await sendWelcomeEmail(email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter! Check your email for a warm welcome message! 🎉',
      data: { email }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed to our newsletter'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// Unsubscribe from newsletter
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscription = await Newsletter.findOne({ email });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter list'
      });
    }

    if (!subscription.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Email is already unsubscribed'
      });
    }

    // Deactivate subscription instead of deleting
    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: { email }
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// Get all newsletter subscribers (admin only)
const getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 10, active = true } = req.query;
    
    const filter = { isActive: active === 'true' };
    
    const subscribers = await Newsletter.find(filter)
      .select('email subscribedAt isActive')
      .sort({ subscribedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Newsletter.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Newsletter subscribers retrieved successfully',
      data: {
        subscribers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

module.exports = {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getAllSubscribers
};

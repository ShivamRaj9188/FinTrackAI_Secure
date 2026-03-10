const Contact = require('./models/Contact');
const { sendContactNotification, sendContactConfirmation, sendContactResponse } = require('./emailService');

// Contact form handler
const sendContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, department, message } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Save contact message to database
    const contactMessage = new Contact({
      firstName,
      lastName,
      email,
      department: department || '',
      message,
      status: 'new',
      priority: 'medium'
    });

    const savedContact = await contactMessage.save();

    // Send notification email to admin
    try {
      await sendContactNotification({ 
        name: `${firstName} ${lastName}`, 
        email, 
        subject: department || 'General Inquiry', 
        message,
        contactId: savedContact._id 
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    // Send confirmation email to user
    try {
      await sendContactConfirmation(email, firstName);
    } catch (emailError) {
      console.error('Failed to send user confirmation:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We\'ve received it and will get back to you within 24 hours. Check your email for confirmation! 📧',
      data: { 
        id: savedContact._id,
        name: `${firstName} ${lastName}`, 
        email, 
        department: department || 'General Inquiry'
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

// Get all contact messages for admin (with pagination and filters)
const getContactMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      department, 
      priority,
      search 
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (priority) filter.priority = priority;
    
    // Search in name, email, or message
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
};

// Get contact message statistics for admin dashboard
const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Contact.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email department createdAt status');

    res.json({
      success: true,
      data: {
        statusStats: stats,
        departmentStats: departmentStats,
        recentContacts: recentContacts,
        totalContacts: await Contact.countDocuments()
      }
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
};

// Update contact message status and add admin response
const updateContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse, priority } = req.body;

    const updateData = { updatedAt: Date.now() };
    
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.respondedBy = req.user?.email || 'Admin';
      updateData.respondedAt = Date.now();
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      data: contact,
      message: 'Contact message updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact message'
    });
  }
};

// Send email response to contact
const sendEmailResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseMessage } = req.body;

    if (!responseMessage) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Send email response (you'll need to implement this in emailService)
    try {
      await sendContactResponse(contact.email, contact.firstName, responseMessage);
      
      // Update contact with response
      await Contact.findByIdAndUpdate(id, {
        adminResponse: responseMessage,
        respondedBy: req.user?.email || 'Admin',
        respondedAt: Date.now(),
        status: 'resolved',
        updatedAt: Date.now()
      });

      res.json({
        success: true,
        message: 'Response sent successfully'
      });
    } catch (emailError) {
      console.error('Failed to send email response:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send email response'
      });
    }
  } catch (error) {
    console.error('Error sending contact response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response'
    });
  }
};

// Delete contact message
const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message'
    });
  }
};

module.exports = {
  sendContactMessage,
  getContactMessages,
  getContactStats,
  updateContactMessage,
  sendEmailResponse,
  deleteContactMessage
};

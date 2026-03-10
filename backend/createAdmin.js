const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./authentication/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintech-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fintack.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@fintack.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@fintack.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      location: 'Admin Location',
      isVerified: true,
      status: 'Active'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@fintack.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser();

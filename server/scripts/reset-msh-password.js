require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetMSHPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacare');
    console.log('✅ Connected to MongoDB');

    const mshEmail = 'msh-admin@health.gov';
    const newPassword = process.env.MSH_PASSWORD || 'msh-admin-2024';

    const mshAdmin = await User.findOne({ email: mshEmail, role: 'msh' });
    
    if (!mshAdmin) {
      console.log('❌ MSH admin not found');
      process.exit(1);
    }

    // Update password (will be hashed by pre-save hook)
    mshAdmin.password = newPassword;
    await mshAdmin.save();

    console.log('✅ MSH admin password reset successfully!');
    console.log('\n📧 MSH Admin Credentials:');
    console.log('   Email:', mshEmail);
    console.log('   Password:', newPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }
};

resetMSHPassword();


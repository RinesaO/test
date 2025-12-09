require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createMSHAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacare');
    console.log('✅ Connected to MongoDB');

    const mshEmail = 'msh-admin@health.gov';
    const mshPassword = process.env.MSH_PASSWORD || 'msh-admin-2024';

    // Check if MSH admin already exists
    const existingMSH = await User.findOne({ role: 'msh' });
    if (existingMSH) {
      console.log('⚠️  MSH admin already exists');
      console.log('   Email:', existingMSH.email);
      process.exit(0);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: mshEmail });
    if (existingUser) {
      console.log('⚠️  User with this email already exists');
      process.exit(1);
    }

    // Create MSH admin
    const mshAdmin = await User.create({
      email: mshEmail,
      password: mshPassword,
      name: 'Ministry of Health Admin',
      role: 'msh'
    });

    console.log('✅ MSH admin created successfully!');
    console.log('\n📧 MSH Admin Credentials:');
    console.log('   Email:', mshEmail);
    console.log('   Password:', mshPassword);
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating MSH admin:', error.message);
    process.exit(1);
  }
};

createMSHAdmin();


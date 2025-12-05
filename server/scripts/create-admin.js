const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacare');
    console.log('✅ Connected to MongoDB');

    // Admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pharmacare.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('⚠️  Admin user already exists with email:', adminEmail);
        console.log('   You can login with these credentials:');
        console.log('   Email:', adminEmail);
        console.log('   Password: (the password you set when creating this user)');
        process.exit(0);
      } else {
        // Update existing user to admin
        existingAdmin.role = 'admin';
        existingAdmin.name = adminName;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin');
        console.log('\n📧 Admin Credentials:');
        console.log('   Email:', adminEmail);
        console.log('   Password: (your existing password)');
        process.exit(0);
      }
    }

    // Create new admin user
    const admin = await User.create({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Admin Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();


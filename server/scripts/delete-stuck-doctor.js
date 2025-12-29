require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

const deleteStuckDoctor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacare');
    console.log('✅ Connected to MongoDB');

    // Target account details
    const targetEmail = 'rinesa1@gmail.com';
    const targetName = 'Rinesa Rinesa';
    const targetRole = 'doctor';
    const targetStatus = 'pending_ministry_review';

    console.log(`\n🔍 Searching for account:`);
    console.log(`   Email: ${targetEmail}`);
    console.log(`   Name: ${targetName}`);
    console.log(`   Role: ${targetRole}`);
    console.log(`   Status: ${targetStatus}`);

    // Find user by email
    const user = await User.findOne({ email: targetEmail });
    
    if (!user) {
      console.log('\n❌ User account not found with email:', targetEmail);
      process.exit(1);
    }

    console.log(`\n✅ Found user account: ${user.email}`);

    // Validate role
    if (user.role !== targetRole) {
      console.log(`\n❌ User role mismatch. Expected: ${targetRole}, Found: ${user.role}`);
      console.log('   Aborting deletion for safety.');
      process.exit(1);
    }

    // Find doctor profile
    const doctorProfile = await DoctorProfile.findOne({ user: user._id });

    if (!doctorProfile) {
      console.log('\n❌ Doctor profile not found for this user');
      process.exit(1);
    }

    // Validate status
    if (doctorProfile.status !== targetStatus) {
      console.log(`\n❌ Doctor status mismatch. Expected: ${targetStatus}, Found: ${doctorProfile.status}`);
      console.log('   Aborting deletion for safety.');
      process.exit(1);
    }

    // Validate name (case-insensitive partial match for safety)
    const fullName = `${doctorProfile.firstName} ${doctorProfile.lastName}`;
    if (!fullName.toLowerCase().includes('rinesa')) {
      console.log(`\n❌ Name mismatch. Expected to contain "Rinesa", Found: ${fullName}`);
      console.log('   Aborting deletion for safety.');
      process.exit(1);
    }

    console.log(`\n✅ Validation passed:`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   Doctor Profile ID: ${doctorProfile._id}`);
    console.log(`   Full Name: ${fullName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${doctorProfile.status}`);

    // Delete DoctorProfile first
    await DoctorProfile.findByIdAndDelete(doctorProfile._id);
    console.log('\n✅ DoctorProfile deleted');

    // Delete User account
    await User.findByIdAndDelete(user._id);
    console.log('✅ User account deleted');

    console.log('\n✅ Cleanup completed successfully!');
    console.log(`   Account ${targetEmail} has been permanently deleted.`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    process.exit(1);
  }
};

deleteStuckDoctor();


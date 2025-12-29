require('dotenv').config();
const mongoose = require('mongoose');
const DoctorProfile = require('../models/DoctorProfile');

const normalizeDoctorStatuses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacare');
    console.log('✅ Connected to MongoDB');

    // Valid statuses for active doctors
    const validStatuses = ['approved', 'pending', 'rejected'];
    const removedStatus = 'removed';
    
    // Invalid statuses that need normalization
    const statusMappings = {
      'approved_by_ministry': 'approved',
      'rejected_by_ministry': 'rejected',
      'pending_ministry_review': 'pending'
    };

    console.log('\n🔍 Searching for doctors with invalid statuses...\n');

    // Find all doctors that are not 'removed' and not in valid statuses
    const invalidStatusDoctors = await DoctorProfile.find({
      status: { 
        $nin: [...validStatuses, removedStatus],
        $ne: null
      }
    }).populate('user', 'email');

    if (invalidStatusDoctors.length === 0) {
      console.log('✅ All doctors already have valid statuses');
      process.exit(0);
    }

    console.log(`Found ${invalidStatusDoctors.length} doctors with invalid statuses:\n`);

    let updated = 0;
    let skipped = 0;

    for (const doctor of invalidStatusDoctors) {
      const currentStatus = doctor.status;
      const newStatus = statusMappings[currentStatus];
      
      const email = doctor.user?.email || 'N/A';
      const name = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'N/A';
      
      if (newStatus) {
        // Update to normalized status
        doctor.status = newStatus;
        await doctor.save();
        
        console.log(`✅ Updated: ${name} (${email})`);
        console.log(`   ${currentStatus} → ${newStatus}`);
        updated++;
      } else {
        // Unknown status - skip for safety
        console.log(`⚠️  Skipped: ${name} (${email})`);
        console.log(`   Unknown status: ${currentStatus} - requires manual review`);
        skipped++;
      }
      console.log('');
    }

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updated} doctors`);
    if (skipped > 0) {
      console.log(`   Skipped: ${skipped} doctors (require manual review)`);
    }

    // Verify counts after normalization
    console.log('\n📈 Verification:');
    const totalActive = await DoctorProfile.countDocuments({ 
      status: { $in: validStatuses } 
    });
    const totalRemoved = await DoctorProfile.countDocuments({ 
      status: removedStatus 
    });
    const approvedCount = await DoctorProfile.countDocuments({ status: 'approved' });
    const pendingCount = await DoctorProfile.countDocuments({ status: 'pending' });
    const rejectedCount = await DoctorProfile.countDocuments({ status: 'rejected' });

    console.log(`   Total Active Doctors: ${totalActive}`);
    console.log(`   - Approved: ${approvedCount}`);
    console.log(`   - Pending: ${pendingCount}`);
    console.log(`   - Rejected: ${rejectedCount}`);
    console.log(`   Total Removed Doctors: ${totalRemoved}`);

    // Check for any remaining invalid statuses
    const remainingInvalid = await DoctorProfile.countDocuments({
      status: { 
        $nin: [...validStatuses, removedStatus],
        $ne: null
      }
    });

    if (remainingInvalid > 0) {
      console.log(`\n⚠️  Warning: ${remainingInvalid} doctors still have invalid statuses`);
      console.log('   These require manual review');
    } else {
      console.log('\n✅ All doctors now have valid statuses');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during normalization:', error.message);
    process.exit(1);
  }
};

normalizeDoctorStatuses();


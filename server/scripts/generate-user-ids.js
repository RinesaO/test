const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const generateUserIDs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacare');
    console.log('✅ Connected to MongoDB');

    // Find all users without userID
    const usersWithoutID = await User.find({ $or: [{ userID: { $exists: false } }, { userID: null }] });
    
    console.log(`Found ${usersWithoutID.length} users without userID`);

    if (usersWithoutID.length === 0) {
      console.log('✅ All users already have userIDs');
      process.exit(0);
    }

    let generated = 0;
    let failed = 0;

    for (const user of usersWithoutID) {
      try {
        // Generate unique user ID
        let userID;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
          const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
          userID = `USR-${randomNum}`;
          const existingUser = await User.findOne({ userID });
          if (!existingUser) {
            isUnique = true;
          }
          attempts++;
        }

        if (isUnique) {
          user.userID = userID;
          await user.save();
          console.log(`✅ Generated ${userID} for ${user.email}`);
          generated++;
        } else {
          console.error(`❌ Failed to generate unique ID for ${user.email} after ${maxAttempts} attempts`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error.message);
        failed++;
      }
    }

    console.log(`\n✅ Generated ${generated} userIDs`);
    if (failed > 0) {
      console.log(`❌ Failed to generate ${failed} userIDs`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

generateUserIDs();


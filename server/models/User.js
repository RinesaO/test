const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'pharmacy', 'doctor', 'admin', 'ministry_admin'],
    default: 'user'
  },
  doctorStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'pending_ministry_review', 'approved_by_ministry', 'rejected_by_ministry', null],
    default: null
  },
  userID: {
    type: String,
    unique: true,
    sparse: true
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate user ID before saving (if new user)
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.userID) {
    try {
      // Generate unique user ID: USR-XXXXX format
      let userID;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
        userID = `USR-${randomNum}`;
        const existingUser = await mongoose.model('User').findOne({ userID });
        if (!existingUser) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (isUnique) {
        this.userID = userID;
      } else {
        return next(new Error('Failed to generate unique user ID'));
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: 'Kosovo' }
  },
  bio: {
    type: String,
    trim: true
  },
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  experience: [{
    position: String,
    institution: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'pending_ministry_review', 'approved_by_ministry', 'rejected_by_ministry', 'removed'],
    default: 'pending_ministry_review'
  },
  documents: {
    license: { type: String, default: '' },
    idCard: { type: String, default: '' },
    certificate: { type: String, default: '' }
  },
  licenseFile: {
    type: String,
    default: ''
  },
  idCardFile: {
    type: String,
    default: ''
  },
  certificateFile: {
    type: String,
    default: ''
  },
  approvalSeen: {
    type: Boolean,
    default: false
  },
  workplaceName: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
doctorProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);


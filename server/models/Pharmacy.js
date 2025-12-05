const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: 'Kosovo' }
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  contact: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    website: { type: String, trim: true }
  },
  openingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  logo: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  services: [{
    type: String,
    trim: true
  }],
  subscription: {
    status: {
      type: String,
      enum: ['inactive', 'active', 'pending', 'expired'],
      default: 'inactive'
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    currentPeriodEnd: { type: Date },
    plan: { type: String, default: 'monthly' }
  },
  isActive: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  advertisement: {
    paid: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    image: { type: String, default: '' },
    offerText: { type: String, default: '' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
pharmacySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Only show active pharmacies in public queries
pharmacySchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  if (this.subscription.status !== 'active' || !this.isActive) {
    return null;
  }
  return obj;
};

module.exports = mongoose.model('Pharmacy', pharmacySchema);


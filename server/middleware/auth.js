const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    
    // If user is a pharmacy, attach pharmacy data
    if (user.role === 'pharmacy' && user.pharmacy) {
      const pharmacy = await Pharmacy.findById(user.pharmacy);
      req.pharmacy = pharmacy;
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Restrict to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

// Check if pharmacy subscription is active
exports.checkSubscription = async (req, res, next) => {
  if (req.user.role !== 'pharmacy') {
    return next();
  }

  if (!req.pharmacy) {
    return res.status(404).json({ message: 'Pharmacy not found' });
  }

  // Allow access to dashboard even if subscription is inactive
  // But restrict certain features
  if (req.pharmacy.subscription.status !== 'active' && !req.pharmacy.isActive) {
    req.subscriptionActive = false;
  } else {
    req.subscriptionActive = true;
  }

  next();
};


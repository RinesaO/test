const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user (pharmacy or normal user)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, role, pharmacyName, phone, address, name } = req.body;

    // Validate role
    const userRole = role || 'user';
    if (!['user', 'pharmacy'].includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "pharmacy"' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate pharmacy-specific fields
    if (userRole === 'pharmacy' && !pharmacyName) {
      return res.status(400).json({ message: 'Pharmacy name is required' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: userRole,
      name: userRole === 'user' ? name : undefined
    });

    let pharmacy = null;

    // If pharmacy, create pharmacy profile
    if (userRole === 'pharmacy') {
      // Auto-activate pharmacy in development mode for easier testing
      const autoActivate = process.env.NODE_ENV !== 'production';
      
      pharmacy = await Pharmacy.create({
        name: pharmacyName,
        contact: { phone, email },
        address: address || {},
        user: user._id,
        isActive: autoActivate // Auto-activate in development
      });

      // Link pharmacy to user
      user.pharmacy = pharmacy._id;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name || null,
        userID: user.userID || null,
        pharmacy: pharmacy ? pharmacy._id : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Block doctor login if not approved
    let showApprovalMessage = false;
    if (user.role === 'doctor') {
      const DoctorProfile = require('../models/DoctorProfile');
      const doctorProfile = await DoctorProfile.findOne({ user: user._id });
      if (!doctorProfile || doctorProfile.status !== 'approved') {
        return res.status(403).json({ 
          message: 'Your account is still under review by the Ministry of Health.' 
        });
      }
      // Check if this is first login after approval
      if (doctorProfile.status === 'approved' && !doctorProfile.approvalSeen) {
        showApprovalMessage = true;
      }
    }

    // Get pharmacy if exists
    let pharmacy = null;
    if (user.pharmacy) {
      pharmacy = await Pharmacy.findById(user.pharmacy);
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      showApprovalMessage,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name || null,
        userID: user.userID || null,
        pharmacy: pharmacy ? {
          id: pharmacy._id,
          name: pharmacy.name,
          subscriptionStatus: pharmacy.subscription.status
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('pharmacy');
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name || null,
        userID: user.userID || null,
        pharmacy: user.pharmacy
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


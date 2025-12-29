const Pharmacy = require('../models/Pharmacy');
const User = require('../models/User');
const Product = require('../models/Product');
const DoctorProfile = require('../models/DoctorProfile');
const path = require('path');
const fs = require('fs');

// @desc    Get all pharmacies
// @route   GET /api/admin/pharmacies
// @access  Private (Admin)
exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find()
      .populate('user', 'email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, pharmacies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single pharmacy
// @route   GET /api/admin/pharmacies/:id
// @access  Private (Admin)
exports.getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('user', 'email');
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json({ success: true, pharmacy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activate/Deactivate pharmacy
// @route   PUT /api/admin/pharmacies/:id/status
// @access  Private (Admin)
exports.updatePharmacyStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const pharmacy = await Pharmacy.findById(req.params.id);
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    pharmacy.isActive = isActive;
    await pharmacy.save();

    res.json({ success: true, pharmacy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete pharmacy
// @route   DELETE /api/admin/pharmacies/:id
// @access  Private (Admin)
exports.deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Delete associated products
    await Product.deleteMany({ pharmacy: pharmacy._id });
    
    // Delete user
    await User.findByIdAndDelete(pharmacy.user);
    
    // Delete pharmacy
    await Pharmacy.findByIdAndDelete(pharmacy._id);

    res.json({ success: true, message: 'Pharmacy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private (Admin)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('pharmacy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(product._id);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('pharmacy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('pharmacy');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['user', 'pharmacy', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user has a pharmacy, delete it and its products
    if (user.pharmacy) {
      const pharmacy = await Pharmacy.findById(user.pharmacy);
      if (pharmacy) {
        await Product.deleteMany({ pharmacy: pharmacy._id });
        await Pharmacy.findByIdAndDelete(pharmacy._id);
      }
    }

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalPharmacies = await Pharmacy.countDocuments();
    const activePharmacies = await Pharmacy.countDocuments({ 
      'subscription.status': 'active',
      isActive: true 
    });
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRegularUsers = await User.countDocuments({ role: 'user' });
    const totalPharmacyUsers = await User.countDocuments({ role: 'pharmacy' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    res.json({
      success: true,
      stats: {
        totalPharmacies,
        activePharmacies,
        totalProducts,
        totalUsers,
        totalRegularUsers,
        totalPharmacyUsers,
        totalAdmins
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doctor requests (pending)
// @route   GET /api/admin/doctors/requests
// @access  Private (Admin)
exports.getDoctorRequests = async (req, res) => {
  try {
    const requests = await DoctorProfile.find({ status: 'pending' })
      .populate('user', 'email name createdAt')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doctors (approved)
// @route   GET /api/admin/doctors
// @access  Private (Admin)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find({ status: 'approved' })
      .populate('user', 'email name')
      .populate('reviewedBy', 'email name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve doctor request
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private (Admin)
exports.approveDoctor = async (req, res) => {
  try {
    const doctorProfile = await DoctorProfile.findById(req.params.id)
      .populate('user');
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (doctorProfile.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update doctor profile
    doctorProfile.status = 'approved';
    doctorProfile.reviewedBy = req.user.id;
    doctorProfile.reviewedAt = new Date();
    await doctorProfile.save();

    // Update user
    const user = doctorProfile.user;
    user.role = 'doctor';
    user.doctorStatus = 'approved';
    await user.save();

    res.json({
      success: true,
      message: 'Doctor request approved successfully',
      doctor: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject doctor request
// @route   PUT /api/admin/doctors/:id/reject
// @access  Private (Admin)
exports.rejectDoctor = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const doctorProfile = await DoctorProfile.findById(req.params.id)
      .populate('user');
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (doctorProfile.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update doctor profile
    doctorProfile.status = 'rejected';
    doctorProfile.rejectionReason = rejectionReason || 'Request rejected by admin';
    doctorProfile.reviewedBy = req.user.id;
    doctorProfile.reviewedAt = new Date();
    await doctorProfile.save();

    // Update user - revert to regular user
    const user = doctorProfile.user;
    user.role = 'user';
    user.doctorStatus = 'rejected';
    await user.save();

    res.json({
      success: true,
      message: 'Doctor request rejected',
      doctor: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get file info (shared logic)
const getAdminFileInfo = async (doctorId, fileType) => {
  // Validate fileType to prevent directory traversal
  if (!['license', 'idCard', 'certificate'].includes(fileType)) {
    return { error: 'Invalid file type', status: 400 };
  }

  const doctorProfile = await DoctorProfile.findById(doctorId);
  if (!doctorProfile) {
    return { error: 'Doctor profile not found', status: 404 };
  }

  // Check documents object first, then fallback to individual file fields
  let filePath = doctorProfile.documents?.[fileType] || 
                 doctorProfile[`${fileType}File`] || 
                 '';

  if (!filePath) {
    return { error: 'File not found', status: 404 };
  }

  // Remove leading slash if present and construct absolute path
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  const absolutePath = path.join(__dirname, '..', cleanPath);

  // Security check: Ensure the file is within the /uploads/doctors directory
  const uploadsDir = path.join(__dirname, '../uploads/doctors');
  if (!absolutePath.startsWith(uploadsDir)) {
    return { error: 'Access denied: Invalid file path', status: 403 };
  }

  if (!fs.existsSync(absolutePath)) {
    return { error: 'File not found on server', status: 404 };
  }

  return { absolutePath, filePath: cleanPath };
};

// @desc    View doctor uploaded file
// @route   GET /api/admin/view-file/:doctorId/:fileType
// @access  Private (Admin)
exports.viewFile = async (req, res) => {
  try {
    const { doctorId, fileType } = req.params;

    const fileInfo = await getAdminFileInfo(doctorId, fileType);
    if (fileInfo.error) {
      return res.status(fileInfo.status).json({ message: fileInfo.error });
    }

    // Determine Content-Type based on file extension
    const ext = path.extname(fileInfo.absolutePath).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(fileInfo.absolutePath)}"`);
    res.sendFile(fileInfo.absolutePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download doctor uploaded file
// @route   GET /api/admin/download-file/:doctorId/:fileType
// @access  Private (Admin)
exports.downloadFile = async (req, res) => {
  try {
    const { doctorId, fileType } = req.params;

    const fileInfo = await getAdminFileInfo(doctorId, fileType);
    if (fileInfo.error) {
      return res.status(fileInfo.status).json({ message: fileInfo.error });
    }

    // Determine Content-Type based on file extension
    const ext = path.extname(fileInfo.absolutePath).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    const fileName = path.basename(fileInfo.absolutePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(fileInfo.absolutePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


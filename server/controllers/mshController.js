const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const path = require('path');
const fs = require('fs');

// @desc    Get all pending doctors
// @route   GET /api/msh/pending-doctors
// @access  Private (MSH)
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find({ status: 'pending' })
      .populate('user', 'email name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      doctors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve doctor
// @route   POST /api/msh/approve-doctor
// @access  Private (MSH)
exports.approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const doctorProfile = await DoctorProfile.findById(doctorId).populate('user');
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctorProfile.status !== 'pending') {
      return res.status(400).json({ message: 'Doctor status is not pending' });
    }

    doctorProfile.status = 'approved';
    doctorProfile.reviewedBy = req.user.id;
    doctorProfile.reviewedAt = new Date();
    await doctorProfile.save();

    res.json({
      success: true,
      message: 'Doctor approved successfully',
      doctor: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject doctor
// @route   POST /api/msh/reject-doctor
// @access  Private (MSH)
exports.rejectDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const doctorProfile = await DoctorProfile.findById(doctorId).populate('user');
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctorProfile.status !== 'pending') {
      return res.status(400).json({ message: 'Doctor status is not pending' });
    }

    doctorProfile.status = 'rejected';
    doctorProfile.reviewedBy = req.user.id;
    doctorProfile.reviewedAt = new Date();
    await doctorProfile.save();

    res.json({
      success: true,
      message: 'Doctor rejected successfully',
      doctor: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove doctor
// @route   POST /api/msh/remove-doctor
// @access  Private (MSH)
exports.removeDoctor = async (req, res) => {
  try {
    const { doctorId, removalReason } = req.body;

    // Validate removal reason is provided
    if (!removalReason) {
      return res.status(400).json({ message: 'Removal reason is required' });
    }

    // Validate removal reason is from allowed list
    const allowedReasons = [
      'Did not follow platform guidelines',
      'License or documentation issues',
      'Violation of pharmaceutical regulations',
      'Inactive or unresponsive account',
      'False or misleading information',
      'Ethical or professional misconduct',
      'Other (internal review decision)'
    ];

    if (!allowedReasons.includes(removalReason)) {
      return res.status(400).json({ message: 'Invalid removal reason' });
    }

    const doctorProfile = await DoctorProfile.findById(doctorId).populate('user');
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Only allow removal of approved or rejected doctors
    if (doctorProfile.status !== 'approved' && doctorProfile.status !== 'rejected') {
      return res.status(400).json({ message: 'Only approved or rejected doctors can be removed' });
    }

    // Mark doctor as removed
    doctorProfile.status = 'removed';
    doctorProfile.rejectionReason = removalReason;
    doctorProfile.reviewedBy = req.user.id;
    doctorProfile.reviewedAt = new Date();
    await doctorProfile.save();

    // Delete the linked user account
    const user = doctorProfile.user;
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'Doctor removed successfully',
      doctor: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get file path and validate
const getFileInfo = async (doctorId, fileType) => {
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
// @route   GET /api/msh/view-file/:doctorId/:fileType
// @access  Private (MSH)
exports.viewFile = async (req, res) => {
  try {
    const { doctorId, fileType } = req.params;

    const fileInfo = await getFileInfo(doctorId, fileType);
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
// @route   GET /api/msh/download-file/:doctorId/:fileType
// @access  Private (MSH)
exports.downloadFile = async (req, res) => {
  try {
    const { doctorId, fileType } = req.params;

    const fileInfo = await getFileInfo(doctorId, fileType);
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

// @desc    Get all doctors
// @route   GET /api/msh/all-doctors
// @access  Private (MSH)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find({ status: { $ne: 'removed' } })
      .populate('user', 'email name createdAt')
      .sort({ createdAt: -1 });

    // Filter out deleted account by email
    const filteredDoctors = doctors.filter(doctor => {
      return doctor.user && doctor.user.email !== 'rinesa1@gmail.com';
    });

    // Get prescription counts for each doctor
    const doctorsWithCounts = await Promise.all(
      filteredDoctors.map(async (doctor) => {
        const prescriptionCount = await Prescription.countDocuments({ doctor: doctor.user._id });
        return {
          ...doctor.toObject(),
          prescriptionCount
        };
      })
    );

    res.json({
      success: true,
      doctors: doctorsWithCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/msh/doctor/:id
// @access  Private (MSH)
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctorProfile = await DoctorProfile.findById(id)
      .populate('user', 'email name createdAt');

    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get all prescriptions by this doctor
    const prescriptions = await Prescription.find({ doctor: doctorProfile.user._id })
      .populate('patient', 'name email')
      .populate('pharmacy', 'name')
      .sort({ createdAt: -1 });

    // Get prescription count
    const prescriptionCount = prescriptions.length;

    res.json({
      success: true,
      doctor: doctorProfile,
      prescriptions,
      prescriptionCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get statistics overview
// @route   GET /api/msh/stats/overview
// @access  Private (MSH)
exports.getStatsOverview = async (req, res) => {
  try {
    const totalDoctors = await DoctorProfile.countDocuments({ status: { $ne: 'removed' } });
    const approvedDoctors = await DoctorProfile.countDocuments({ status: 'approved' });
    const pendingDoctors = await DoctorProfile.countDocuments({ status: 'pending' });
    const rejectedDoctors = await DoctorProfile.countDocuments({ status: 'rejected' });

    // Find most active doctor (excluding removed)
    const prescriptionCounts = await Prescription.aggregate([
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);

    let mostActiveDoctor = null;
    if (prescriptionCounts.length > 0) {
      const doctorProfile = await DoctorProfile.findOne({ 
        user: prescriptionCounts[0]._id,
        status: { $ne: 'removed' }
      }).populate('user', 'name email');
      if (doctorProfile) {
        mostActiveDoctor = {
          name: doctorProfile.user.name || `${doctorProfile.firstName} ${doctorProfile.lastName}`,
          prescriptionCount: prescriptionCounts[0].count
        };
      }
    }

    res.json({
      success: true,
      stats: {
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        rejectedDoctors,
        mostActiveDoctor
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top doctors by prescription count
// @route   GET /api/msh/stats/top-doctors
// @access  Private (MSH)
exports.getTopDoctors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const prescriptionCounts = await Prescription.aggregate([
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      }
    ]);

    const topDoctors = await Promise.all(
      prescriptionCounts.map(async (item) => {
        const doctorProfile = await DoctorProfile.findOne({ 
          user: item._id,
          status: { $ne: 'removed' }
        }).populate('user', 'name email');
        if (doctorProfile) {
          return {
            doctorId: doctorProfile._id,
            name: doctorProfile.user.name || `${doctorProfile.firstName} ${doctorProfile.lastName}`,
            specialization: doctorProfile.specialization,
            prescriptionCount: item.count
          };
        }
        return null;
      })
    );

    res.json({
      success: true,
      topDoctors: topDoctors.filter(doctor => doctor !== null)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get prescriptions from last 7 days
// @route   GET /api/msh/stats/prescriptions-last-week
// @access  Private (MSH)
exports.getPrescriptionsLastWeek = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const prescriptions = await Prescription.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      prescriptions: prescriptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


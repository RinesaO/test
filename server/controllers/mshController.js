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

// @desc    View doctor uploaded file
// @route   GET /api/msh/view-file/:doctorId/:fileType
// @access  Private (MSH)
exports.viewFile = async (req, res) => {
  try {
    const { doctorId, fileType } = req.params;

    // Validate fileType to prevent directory traversal
    if (!['license', 'idCard', 'certificate'].includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    const doctorProfile = await DoctorProfile.findById(doctorId);
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Check documents object first, then fallback to individual file fields
    let filePath = doctorProfile.documents?.[fileType] || 
                   doctorProfile[`${fileType}File`] || 
                   '';

    if (!filePath) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Remove leading slash if present and construct absolute path
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const absolutePath = path.join(__dirname, '..', cleanPath);

    // Security check: Ensure the file is within the /uploads/doctors directory
    const uploadsDir = path.join(__dirname, '../uploads/doctors');
    if (!absolutePath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: 'Access denied: Invalid file path' });
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.sendFile(absolutePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doctors
// @route   GET /api/msh/all-doctors
// @access  Private (MSH)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find()
      .populate('user', 'email name createdAt')
      .sort({ createdAt: -1 });

    // Get prescription counts for each doctor
    const doctorsWithCounts = await Promise.all(
      doctors.map(async (doctor) => {
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
    const totalDoctors = await DoctorProfile.countDocuments();
    const approvedDoctors = await DoctorProfile.countDocuments({ status: 'approved' });
    const pendingDoctors = await DoctorProfile.countDocuments({ status: 'pending' });
    const rejectedDoctors = await DoctorProfile.countDocuments({ status: 'rejected' });

    // Find most active doctor
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
      const doctorProfile = await DoctorProfile.findOne({ user: prescriptionCounts[0]._id })
        .populate('user', 'name email');
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
        const doctorProfile = await DoctorProfile.findOne({ user: item._id })
          .populate('user', 'name email');
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


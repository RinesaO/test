const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

// @desc    Get pending doctor applications
// @route   GET /api/ministry/pending-doctors
// @access  Private (Ministry Admin)
exports.getPendingDoctors = async (req, res) => {
  try {
    const applications = await DoctorProfile.find({ status: 'pending_ministry_review' })
      .populate('user', 'email name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve doctor application
// @route   POST /api/ministry/approveDoctor
// @access  Private (Ministry Admin)
exports.approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const doctorProfile = await DoctorProfile.findById(doctorId).populate('user');
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor application not found' });
    }

    if (doctorProfile.status !== 'pending_ministry_review') {
      return res.status(400).json({ message: 'This application has already been processed' });
    }

    // Update doctor profile
    doctorProfile.status = 'approved_by_ministry';
    doctorProfile.reviewedBy = req.user.id;
    doctorProfile.reviewedAt = new Date();
    await doctorProfile.save();

    // Update user status
    const user = doctorProfile.user;
    user.doctorStatus = 'approved_by_ministry';
    await user.save();

    res.json({
      success: true,
      message: 'Doctor application approved successfully',
      doctor: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject doctor application
// @route   POST /api/ministry/rejectDoctor
// @access  Private (Ministry Admin)
exports.rejectDoctor = async (req, res) => {
  try {
    const { doctorId, rejectionReason } = req.body;

    const doctorProfile = await DoctorProfile.findById(doctorId).populate('user');
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor application not found' });
    }

    if (doctorProfile.status !== 'pending_ministry_review') {
      return res.status(400).json({ message: 'This application has already been processed' });
    }

    // Update doctor profile
    doctorProfile.status = 'rejected_by_ministry';
    doctorProfile.rejectionReason = rejectionReason || 'Application rejected by Ministry of Health';
    doctorProfile.reviewedBy = req.user.id;
    doctorProfile.reviewedAt = new Date();
    await doctorProfile.save();

    // Update user status
    const user = doctorProfile.user;
    user.doctorStatus = 'rejected_by_ministry';
    await user.save();

    res.json({
      success: true,
      message: 'Doctor application rejected',
      doctor: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


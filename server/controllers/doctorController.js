const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const upload = require('../config/upload');

// @desc    Submit doctor profile for review
// @route   POST /api/doctor/profile
// @access  Private (Doctor)
exports.submitProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      specialization,
      licenseNumber,
      phone,
      address,
      bio,
      education,
      experience
    } = req.body;

    // Check if user is a doctor
    const user = await User.findById(userId);
    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can submit profiles' });
    }

    // Check if profile already exists
    let doctorProfile = await DoctorProfile.findOne({ user: userId });

    if (doctorProfile) {
      // Update existing profile
      doctorProfile.firstName = firstName;
      doctorProfile.lastName = lastName;
      doctorProfile.specialization = specialization;
      doctorProfile.licenseNumber = licenseNumber;
      doctorProfile.phone = phone;
      doctorProfile.address = address || {};
      doctorProfile.bio = bio;
      doctorProfile.education = education || [];
      doctorProfile.experience = experience || [];
      doctorProfile.status = 'pending';
      doctorProfile.rejectionReason = undefined;
      doctorProfile.reviewedBy = undefined;
      doctorProfile.reviewedAt = undefined;
    } else {
      // Create new profile
      doctorProfile = await DoctorProfile.create({
        user: userId,
        firstName,
        lastName,
        specialization,
        licenseNumber,
        phone,
        address: address || {},
        bio,
        education: education || [],
        experience: experience || [],
        status: 'pending'
      });
    }

    // Update user's doctor status
    user.doctorStatus = 'pending';
    await user.save();

    await doctorProfile.save();

    res.json({
      success: true,
      message: 'Doctor profile submitted for review',
      profile: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor profile
// @route   GET /api/doctor/profile
// @access  Private (Doctor)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctorProfile = await DoctorProfile.findOne({ user: userId });

    if (!doctorProfile) {
      return res.json({
        success: true,
        profile: null,
        message: 'No profile found. Please complete your profile.'
      });
    }

    res.json({
      success: true,
      profile: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor profile status
// @route   GET /api/doctor/status
// @access  Private (Doctor)
exports.getStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('doctorStatus role');

    const doctorProfile = await DoctorProfile.findOne({ user: userId });

    res.json({
      success: true,
      role: user.role,
      doctorStatus: user.doctorStatus,
      profileStatus: doctorProfile?.status || null,
      hasProfile: !!doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for doctor registration (public sign-up)
// @route   POST /api/doctors/apply
// @access  Public
exports.applyForDoctor = async (req, res) => {
  try {
    // Handle file uploads first
    const uploadFields = upload.fields([
      { name: 'license', maxCount: 1 },
      { name: 'idCard', maxCount: 1 },
      { name: 'certificate', maxCount: 1 }
    ]);

    uploadFields(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        // Read body fields after upload middleware processes the request
        const { fullName, email, password, licenseNumber, specialization, workplaceName, phone } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !licenseNumber || !specialization || !workplaceName || !phone) {
          return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create user with doctor role
        const user = await User.create({
          email,
          password,
          role: 'doctor',
          name: fullName,
          doctorStatus: 'pending_ministry_review'
        });

        const documents = {
          license: req.files?.license?.[0] ? `/uploads/${req.files.license[0].filename}` : '',
          idCard: req.files?.idCard?.[0] ? `/uploads/${req.files.idCard[0].filename}` : '',
          certificate: req.files?.certificate?.[0] ? `/uploads/${req.files.certificate[0].filename}` : ''
        };

        // Create doctor profile
        const nameParts = fullName.split(' ').filter(part => part.trim() !== '');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || firstName; // Use firstName as fallback if no lastName

        const doctorProfile = await DoctorProfile.create({
          user: user._id,
          firstName,
          lastName,
          specialization,
          licenseNumber,
          workplaceName,
          phone,
          documents,
          status: 'pending_ministry_review'
        });

        res.status(201).json({
          success: true,
          message: 'Doctor application submitted successfully. Waiting for Ministry of Health approval.',
          applicationId: doctorProfile._id
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


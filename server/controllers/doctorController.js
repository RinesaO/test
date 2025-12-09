const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const upload = require('../config/upload');
const { upload: doctorUpload, createDoctorUploadDir } = require('../config/doctorUpload');
const fs = require('fs');
const path = require('path');

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

// @desc    Mark approval message as seen
// @route   POST /api/doctor/mark-approval-seen
// @access  Private (Doctor)
exports.markApprovalSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctorProfile = await DoctorProfile.findOne({ user: userId });
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctorProfile.approvalSeen = true;
    await doctorProfile.save();

    res.json({
      success: true,
      message: 'Approval message marked as seen'
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

// @desc    Mark approval message as seen
// @route   POST /api/doctor/mark-approval-seen
// @access  Private (Doctor)
exports.markApprovalSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctorProfile = await DoctorProfile.findOne({ user: userId });
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctorProfile.approvalSeen = true;
    await doctorProfile.save();

    res.json({
      success: true,
      message: 'Approval message marked as seen'
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

// @desc    Mark approval message as seen
// @route   POST /api/doctor/mark-approval-seen
// @access  Private (Doctor)
exports.markApprovalSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctorProfile = await DoctorProfile.findOne({ user: userId });
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctorProfile.approvalSeen = true;
    await doctorProfile.save();

    res.json({
      success: true,
      message: 'Approval message marked as seen'
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
    const uploadFields = doctorUpload.fields([
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

        // Validate required files
        if (!req.files?.license?.[0] || !req.files?.idCard?.[0] || !req.files?.certificate?.[0]) {
          return res.status(400).json({ message: 'All document files are required (License PDF, ID Card, Certificate)' });
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
          doctorStatus: 'pending'
        });

        // Create doctor-specific upload directory
        const doctorDir = createDoctorUploadDir(user._id.toString());
        
        // Move files to doctor-specific directory
        const moveFile = (file, newName) => {
          const oldPath = path.join(__dirname, '../uploads/doctors', file.filename);
          const newPath = path.join(doctorDir, newName);
          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            return `/uploads/doctors/${user._id}/${newName}`;
          }
          return '';
        };

        const licenseFileName = `license-${Date.now()}${path.extname(req.files.license[0].originalname)}`;
        const idCardFileName = `idcard-${Date.now()}${path.extname(req.files.idCard[0].originalname)}`;
        const certificateFileName = `certificate-${Date.now()}${path.extname(req.files.certificate[0].originalname)}`;

        const licenseFile = moveFile(req.files.license[0], licenseFileName);
        const idCardFile = moveFile(req.files.idCard[0], idCardFileName);
        const certificateFile = moveFile(req.files.certificate[0], certificateFileName);

        // Create doctor profile
        const nameParts = fullName.split(' ').filter(part => part.trim() !== '');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || firstName;

        const doctorProfile = await DoctorProfile.create({
          user: user._id,
          firstName,
          lastName,
          specialization,
          licenseNumber,
          workplaceName,
          phone,
          licenseFile,
          idCardFile,
          certificateFile,
          status: 'pending'
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

// @desc    Mark approval message as seen
// @route   POST /api/doctor/mark-approval-seen
// @access  Private (Doctor)
exports.markApprovalSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctorProfile = await DoctorProfile.findOne({ user: userId });
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctorProfile.approvalSeen = true;
    await doctorProfile.save();

    res.json({
      success: true,
      message: 'Approval message marked as seen'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


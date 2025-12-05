const Prescription = require('../models/Prescription');
const User = require('../models/User');

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
exports.createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const {
      patientID,
      patientName,
      medications,
      diagnosis,
      notes,
      expiryDate
    } = req.body;

    // Verify doctor role
    const doctor = await User.findById(doctorId);
    if (doctor.role !== 'doctor' || doctor.doctorStatus !== 'approved') {
      return res.status(403).json({ message: 'Only approved doctors can create prescriptions' });
    }

    // Find patient by ID and verify name matches
    const patient = await User.findOne({ userID: patientID });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found with the provided ID' });
    }

    // Verify patient name matches (case-insensitive, trim whitespace)
    const patientFullName = (patient.name || patient.email || '').trim();
    const providedName = (patientName || '').trim();
    
    if (!patientFullName || patientFullName.toLowerCase() !== providedName.toLowerCase()) {
      return res.status(400).json({ 
        message: `Patient name does not match the ID. Expected: "${patientFullName}", Provided: "${providedName}". Please verify the patient information.` 
      });
    }

    // Validate medications
    if (!medications || medications.length === 0) {
      return res.status(400).json({ message: 'At least one medication is required' });
    }

    // Generate unique prescription number
    let prescriptionNumber;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
      prescriptionNumber = `RX-${randomNum}`;
      const existingPrescription = await Prescription.findOne({ prescriptionNumber });
      if (!existingPrescription) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: 'Failed to generate unique prescription number. Please try again.' });
    }

    // Create prescription (use verified patient name from database)
    const prescription = await Prescription.create({
      prescriptionNumber,
      doctor: doctorId,
      patient: patient._id,
      patientID: patientID,
      patientName: patientFullName, // Use verified name from database
      medications,
      diagnosis,
      notes,
      expiryDate: expiryDate ? new Date(expiryDate) : null
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all prescriptions (for doctor)
// @route   GET /api/prescriptions
// @access  Private (Doctor)
exports.getMyPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const prescriptions = await Prescription.find({ doctor: doctorId })
      .populate('patient', 'userID name email')
      .sort({ dateIssued: -1 });

    res.json({
      success: true,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private (Doctor or Patient)
exports.getPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const prescription = await Prescription.findById(req.params.id)
      .populate('doctor', 'name email')
      .populate('patient', 'userID name email');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if user is the doctor or patient
    if (prescription.doctor._id.toString() !== userId && prescription.patient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this prescription' });
    }

    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lookup patient by ID
// @route   GET /api/prescriptions/patient-lookup/:patientID
// @access  Private (Doctor)
exports.lookupPatient = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientID } = req.params;

    // Verify doctor role
    const doctor = await User.findById(doctorId);
    if (doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can lookup patients' });
    }

    const patient = await User.findOne({ userID: patientID }).select('userID name email');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found with the provided ID' });
    }

    res.json({
      success: true,
      patient: {
        userID: patient.userID,
        name: patient.name || patient.email,
        email: patient.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient prescriptions
// @route   GET /api/prescriptions/patient/:patientID
// @access  Private (Doctor)
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientID } = req.params;

    // Verify doctor role
    const doctor = await User.findById(doctorId);
    if (doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can view patient prescriptions' });
    }

    const patient = await User.findOne({ userID: patientID });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate('doctor', 'name email')
      .sort({ dateIssued: -1 });

    res.json({
      success: true,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my prescriptions (for patient)
// @route   GET /api/prescriptions/my-prescriptions
// @access  Private (Patient)
exports.getMyPrescriptionsAsPatient = async (req, res) => {
  try {
    const patientId = req.user.id;

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'name email')
      .sort({ dateIssued: -1 });

    res.json({
      success: true,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update prescription status
// @route   PUT /api/prescriptions/:id/status
// @access  Private (Doctor)
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { status } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.doctor.toString() !== doctorId) {
      return res.status(403).json({ message: 'Not authorized to update this prescription' });
    }

    prescription.status = status;
    await prescription.save();

    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


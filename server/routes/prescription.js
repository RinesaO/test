const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getMyPrescriptions,
  getPrescription,
  lookupPatient,
  getPatientPrescriptions,
  getMyPrescriptionsAsPatient,
  updatePrescriptionStatus
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Doctor routes
router.post('/', createPrescription);
router.get('/', getMyPrescriptions);
router.get('/patient-lookup/:patientID', lookupPatient);
router.get('/patient/:patientID', getPatientPrescriptions);
router.put('/:id/status', updatePrescriptionStatus);

// Patient routes
router.get('/my-prescriptions', getMyPrescriptionsAsPatient);

// Shared routes
router.get('/:id', getPrescription);

module.exports = router;


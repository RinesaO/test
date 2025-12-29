const express = require('express');
const router = express.Router();
const {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  removeDoctor,
  viewFile,
  downloadFile,
  getAllDoctors,
  getDoctorById,
  getStatsOverview,
  getTopDoctors,
  getPrescriptionsLastWeek
} = require('../controllers/mshController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('msh'));

router.get('/pending-doctors', getPendingDoctors);
router.post('/approve-doctor', approveDoctor);
router.post('/reject-doctor', rejectDoctor);
router.post('/remove-doctor', removeDoctor);
router.get('/view-file/:doctorId/:fileType', viewFile);
router.get('/download-file/:doctorId/:fileType', downloadFile);
router.get('/all-doctors', getAllDoctors);
router.get('/doctor/:id', getDoctorById);
router.get('/stats/overview', getStatsOverview);
router.get('/stats/top-doctors', getTopDoctors);
router.get('/stats/prescriptions-last-week', getPrescriptionsLastWeek);

module.exports = router;


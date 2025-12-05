const express = require('express');
const router = express.Router();
const {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor
} = require('../controllers/ministryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ministry_admin'));

router.get('/pending-doctors', getPendingDoctors);
router.post('/approveDoctor', approveDoctor);
router.post('/rejectDoctor', rejectDoctor);

module.exports = router;


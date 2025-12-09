const express = require('express');
const router = express.Router();
const {
  submitProfile,
  getProfile,
  getStatus,
  markApprovalSeen
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/profile', submitProfile);
router.get('/profile', getProfile);
router.get('/status', getStatus);
router.post('/mark-approval-seen', markApprovalSeen);

module.exports = router;


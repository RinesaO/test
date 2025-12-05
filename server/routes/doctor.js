const express = require('express');
const router = express.Router();
const {
  submitProfile,
  getProfile,
  getStatus
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/profile', submitProfile);
router.get('/profile', getProfile);
router.get('/status', getStatus);

module.exports = router;


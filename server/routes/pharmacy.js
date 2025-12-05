const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadLogo,
  getAnalytics,
  incrementView,
  purchaseAdSlot,
  publishAd
} = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, authorize('pharmacy'), getProfile);
router.put('/profile', protect, authorize('pharmacy'), updateProfile);
router.post('/logo', protect, authorize('pharmacy'), uploadLogo);
router.get('/analytics', protect, authorize('pharmacy'), getAnalytics);
router.post('/view', incrementView);
router.post('/purchase-ad', protect, authorize('pharmacy'), purchaseAdSlot);
router.post('/publish-ad', protect, authorize('pharmacy'), publishAd);

module.exports = router;


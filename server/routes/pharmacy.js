const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadLogo,
  getAnalytics,
  incrementView,
  purchaseAdSlot,
  publishAd,
  getPromotions,
  trackPromotionClick,
  trackPromotionPurchase
} = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, authorize('pharmacy'), getProfile);
router.put('/profile', protect, authorize('pharmacy'), updateProfile);
router.post('/logo', protect, authorize('pharmacy'), uploadLogo);
router.get('/analytics', protect, authorize('pharmacy'), getAnalytics);
router.get('/promotions', protect, authorize('pharmacy'), getPromotions);
router.post('/view', incrementView);
router.post('/purchase-ad', protect, authorize('pharmacy'), purchaseAdSlot);
router.post('/publish-ad', protect, authorize('pharmacy'), publishAd);
router.post('/promotions/:id/click', trackPromotionClick);
router.post('/promotions/:id/purchase', trackPromotionPurchase);

module.exports = router;


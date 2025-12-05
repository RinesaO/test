const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
  webhook
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

// Webhook handler (raw body is handled in server.js)
router.post('/webhook', webhook);

router.post('/create-checkout-session', protect, authorize('pharmacy'), createCheckoutSession);
router.get('/status', protect, authorize('pharmacy'), getSubscriptionStatus);
router.post('/cancel', protect, authorize('pharmacy'), cancelSubscription);

module.exports = router;


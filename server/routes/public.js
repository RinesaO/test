const express = require('express');
const router = express.Router();
const {
  getPharmacies,
  getPharmacy,
  getPharmacyProducts,
  getCities,
  getActiveAds
} = require('../controllers/publicController');

router.get('/pharmacies', getPharmacies);
router.get('/pharmacies/:id', getPharmacy);
router.get('/pharmacies/:id/products', getPharmacyProducts);
router.get('/cities', getCities);
router.get('/ads', getActiveAds);

module.exports = router;


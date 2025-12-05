const express = require('express');
const router = express.Router();
const {
  getProductsByPharmacy,
  getMyProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getCategories
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/pharmacy/:pharmacyId', getProductsByPharmacy);
router.get('/:id', getProduct);
router.get('/', protect, authorize('pharmacy'), getMyProducts);
router.post('/', protect, authorize('pharmacy'), createProduct);
router.put('/:id', protect, authorize('pharmacy'), updateProduct);
router.delete('/:id', protect, authorize('pharmacy'), deleteProduct);
router.post('/:id/image', protect, authorize('pharmacy'), uploadProductImage);

module.exports = router;


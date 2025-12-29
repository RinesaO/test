const express = require('express');
const router = express.Router();
const {
  getAllPharmacies,
  getPharmacy,
  updatePharmacyStatus,
  deletePharmacy,
  getAllProducts,
  deleteProduct,
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getStats,
  getDoctorRequests,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  viewFile,
  downloadFile
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/pharmacies', getAllPharmacies);
router.get('/pharmacies/:id', getPharmacy);
router.put('/pharmacies/:id/status', updatePharmacyStatus);
router.delete('/pharmacies/:id', deletePharmacy);
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/doctors/requests', getDoctorRequests);
router.get('/doctors', getAllDoctors);
router.put('/doctors/:id/approve', approveDoctor);
router.put('/doctors/:id/reject', rejectDoctor);
router.get('/view-file/:doctorId/:fileType', viewFile);
router.get('/download-file/:doctorId/:fileType', downloadFile);

module.exports = router;


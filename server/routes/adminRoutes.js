const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllDoctorsForAdmin,
  getAllPatientsForAdmin,
  setUserActiveStatus,
  getUserDetail,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Every route here requires a logged-in admin
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/doctors', getAllDoctorsForAdmin);
router.get('/patients', getAllPatientsForAdmin);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', setUserActiveStatus);

module.exports = router;

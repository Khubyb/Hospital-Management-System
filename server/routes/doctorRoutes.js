const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  updateAvailability,
  approveDoctor,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/availability', protect, authorize('doctor'), updateAvailability);
router.patch('/:id/approve', protect, authorize('admin'), approveDoctor);

module.exports = router;

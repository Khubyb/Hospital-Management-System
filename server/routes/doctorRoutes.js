const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  updateAvailability,
  cancelAvailabilitySlot,
  approveDoctor,
  rejectDoctor,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/available-slots', getAvailableSlots);
router.put('/availability', protect, authorize('doctor'), updateAvailability);
router.patch('/availability/cancel', protect, authorize('doctor'), cancelAvailabilitySlot);
router.patch('/:id/approve', protect, authorize('admin'), approveDoctor);
router.patch('/:id/reject', protect, authorize('admin'), rejectDoctor);

module.exports = router;

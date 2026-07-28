const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // every appointment route requires authentication

router.post('/', authorize('patient'), bookAppointment);
router.get('/', getAppointments);
router.patch('/:id/status', authorize('patient', 'doctor', 'admin'), updateAppointmentStatus);
router.patch('/:id/reschedule', authorize('patient'), rescheduleAppointment);

module.exports = router;

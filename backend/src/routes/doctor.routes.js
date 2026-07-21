import express from 'express';
import { getDoctorProfile, updateDoctorProfile } from '../controllers/doctor.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply protection to all doctor endpoints
router.use(protect);
router.use(authorize('doctor'));

router.route('/profile')
  .get(getDoctorProfile)
  .put(updateDoctorProfile);

export default router;

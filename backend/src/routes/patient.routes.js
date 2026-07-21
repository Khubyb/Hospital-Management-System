import express from 'express';
import { getPatientProfile, updatePatientProfile } from '../controllers/patient.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply protection to all patient endpoints
router.use(protect);
router.use(authorize('patient'));

router.route('/profile')
  .get(getPatientProfile)
  .put(updatePatientProfile);

export default router;

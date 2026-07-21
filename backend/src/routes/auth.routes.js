import express from 'express';
import {
  signup,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser
} from '../controllers/auth.controller.js';
import {
  registerPatientValidator,
  registerDoctorValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Signup routes
router.post('/signup/patient', registerPatientValidator, validate, signup);
router.post('/signup/doctor', registerDoctorValidator, validate, signup);

// Verification routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Login & Logout
router.post('/login', loginValidator, validate, login);
router.post('/logout', logout);

// Password recovery
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

// Get current active session
router.get('/me', protect, getCurrentUser);

export default router;

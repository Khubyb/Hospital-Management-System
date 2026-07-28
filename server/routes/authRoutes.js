const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const {
  signupPatient,
  signupDoctor,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  patientSignupRules,
  doctorSignupRules,
  loginRules,
  otpRules,
} = require('../validators/authValidators');

// Stricter limiter on sensitive auth endpoints to slow down brute-force / credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup/patient', authLimiter, patientSignupRules, signupPatient);
router.post('/signup/doctor', authLimiter, doctorSignupRules, signupDoctor);
router.post('/verify-otp', authLimiter, otpRules, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/login', authLimiter, loginRules, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;

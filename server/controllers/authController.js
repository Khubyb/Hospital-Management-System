const { validationResult } = require('express-validator');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const sendTokenResponse = require('../utils/sendTokenResponse');
const { sendOTPEmail } = require('../utils/sendEmail');

// Small helper to bail out early with formatted express-validator errors
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    throw new ApiError(400, message);
  }
};

// @desc    Register a new patient
// @route   POST /api/auth/signup/patient
// @access  Public
exports.signupPatient = asyncHandler(async (req, res) => {
  checkValidation(req);

  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const emergencyContact = req.body.emergencyContact || {};
  const cleanedEmergencyContact = {
    name: emergencyContact.name || undefined,
    relationship: emergencyContact.relationship || undefined,
    phone: emergencyContact.phone || undefined,
  };

  const patient = await Patient.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    bloodGroup: req.body.bloodGroup || undefined,
    address: req.body.address,
    emergencyContact: cleanedEmergencyContact,
    acceptedTerms: req.body.acceptedTerms === 'true' || req.body.acceptedTerms === true,
    role: 'patient',
  });

  const otp = patient.generateOTP('verify_email');
  await patient.save({ validateBeforeSave: false });

  await sendOTPEmail({ to: patient.email, name: patient.fullName, otp, purpose: 'verify_email' });

  res.status(201).json({
    success: true,
    message: 'Account created. Please check your email for the verification code.',
    email: patient.email,
  });
});

// @desc    Register a new doctor (goes live only after admin approval)
// @route   POST /api/auth/signup/doctor
// @access  Public
exports.signupDoctor = asyncHandler(async (req, res) => {
  checkValidation(req);

  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const licenseTaken = await Doctor.findOne({ medicalLicenseNumber: req.body.medicalLicenseNumber });
  if (licenseTaken) throw new ApiError(409, 'This medical license number is already registered');

  const doctor = await Doctor.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    medicalLicenseNumber: req.body.medicalLicenseNumber,
    specialization: req.body.specialization,
    qualification: req.body.qualification,
    yearsOfExperience: req.body.yearsOfExperience,
    department: req.body.department || undefined,
    profilePicture: req.body.profilePicture || undefined,
    acceptedTerms: req.body.acceptedTerms === 'true' || req.body.acceptedTerms === true,
    role: 'doctor',
  });

  const otp = doctor.generateOTP('verify_email');
  await doctor.save({ validateBeforeSave: false });

  await sendOTPEmail({ to: doctor.email, name: doctor.fullName, otp, purpose: 'verify_email' });

  res.status(201).json({
    success: true,
    message:
      'Account created. Please verify your email, then wait for admin approval of your credentials before logging in.',
    email: doctor.email,
  });
});

// @desc    Verify OTP sent after signup and activate the account
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res) => {
  checkValidation(req);

  const user = await User.findOne({ email: req.body.email }).select('+otpCode +otpExpires +otpPurpose');
  if (!user) throw new ApiError(404, 'No account found with this email');

  const isValid = user.verifyOTP(req.body.otp, 'verify_email');
  if (!isValid) throw new ApiError(400, 'Invalid or expired verification code');

  user.isEmailVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  user.otpPurpose = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });
});

// @desc    Resend a fresh OTP (verification or password reset)
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account found with this email');

  const otp = user.generateOTP(purpose === 'reset_password' ? 'reset_password' : 'verify_email');
  await user.save({ validateBeforeSave: false });

  await sendOTPEmail({ to: user.email, name: user.fullName, otp, purpose: purpose || 'verify_email' });

  res.status(200).json({ success: true, message: 'A new verification code has been sent to your email.' });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact support.');
  }

  if (user.role === 'doctor' && !user.isApprovedByAdmin) {
    throw new ApiError(403, 'Your credentials are still pending admin approval');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Logout - clears the auth cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get currently authenticated user (used for auto-login on app load)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

// Fields any logged-in user may edit about themselves. Deliberately excludes
// password, role, email-verification, and approval-workflow fields.
const SELF_EDITABLE_FIELDS = [
  'fullName',
  'phone',
  // patient-only
  'dateOfBirth',
  'gender',
  'bloodGroup',
  'address',
  'emergencyContact',
  // doctor-only
  'specialization',
  'qualification',
  'yearsOfExperience',
  'consultationFee',
];

// @desc    Update the logged-in user's own profile info
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  // Important: User.findByIdAndUpdate() only knows the base User schema, so
  // discriminator-only fields (e.g. a doctor's consultationFee) would get
  // silently stripped by strict-mode casting before the update even runs.
  // findById() correctly hydrates the document as its real discriminator
  // type (Doctor/Patient), so assigning + save() respects those fields.
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  SELF_EDITABLE_FIELDS.forEach((field) => {
    if (req.body[field] === undefined) return;
    user[field] = req.body[field] === '' ? undefined : req.body[field];
  });

  await user.save();

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Step 1 of forgot password - request an OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // Respond the same way whether or not the account exists, to avoid leaking which emails are registered
  if (!user) {
    return res
      .status(200)
      .json({ success: true, message: 'If that account exists, a reset code has been sent to it.' });
  }

  const otp = user.generateOTP('reset_password');
  await user.save({ validateBeforeSave: false });
  await sendOTPEmail({ to: user.email, name: user.fullName, otp, purpose: 'reset_password' });

  res.status(200).json({ success: true, message: 'If that account exists, a reset code has been sent to it.' });
});

// @desc    Step 2 of forgot password - verify OTP and set a new password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email }).select('+otpCode +otpExpires +otpPurpose');
  if (!user) throw new ApiError(404, 'No account found with this email');

  const isValid = user.verifyOTP(otp, 'reset_password');
  if (!isValid) throw new ApiError(400, 'Invalid or expired reset code');

  user.password = newPassword; // pre-save hook re-hashes it
  user.otpCode = undefined;
  user.otpExpires = undefined;
  user.otpPurpose = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

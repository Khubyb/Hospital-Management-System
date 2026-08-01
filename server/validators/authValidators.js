const { body } = require('express-validator');

// Shared password strength rule: min 8 chars, upper, lower, number, special char
const strongPassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain at least one special character');

exports.patientSignupRules = [
  body('fullName').trim().isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  strongPassword,
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('phone').matches(/^\+?[0-9]{10,15}$/).withMessage('Please provide a valid phone number'),
  body('dateOfBirth').isISO8601().toDate().withMessage('Please provide a valid date of birth'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Please select a valid gender'),
  body('bloodGroup')
    .optional({ checkFalsy: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please select a valid blood group'),
  body('emergencyContact.name').optional({ checkFalsy: true }).isString(),
  body('emergencyContact.phone')
    .optional({ checkFalsy: true })
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Please provide a valid emergency contact phone'),
  body('acceptedTerms').equals('true').withMessage('You must accept the terms and conditions'),
];

exports.doctorSignupRules = [
  body('fullName').trim().isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  strongPassword,
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('phone').matches(/^\+?[0-9]{10,15}$/).withMessage('Please provide a valid phone number'),
  body('medicalLicenseNumber').trim().notEmpty().withMessage('Medical license number is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('qualification').trim().notEmpty().withMessage('Qualification is required'),
  body('yearsOfExperience')
    .isInt({ min: 0, max: 70 })
    .withMessage('Please provide a valid number of years of experience'),
  body('department').isMongoId().withMessage('Please select a valid department'),
  body('acceptedTerms').equals('true').withMessage('You must accept the terms and conditions'),
];

exports.loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.otpRules = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

import { body } from 'express-validator';

// Common validation fields
const commonSignupRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('gender')
    .trim()
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['patient', 'doctor'])
    .withMessage('Role must be either patient or doctor')
];

/**
 * Validator rules for Patient Signup
 */
export const registerPatientValidator = [
  ...commonSignupRules,
  body('role')
    .equals('patient')
    .withMessage('Role must be patient for patient registration'),
  body('bloodGroup')
    .optional({ checkFalsy: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''])
    .withMessage('Please enter a valid blood group')
];

/**
 * Validator rules for Doctor Signup
 */
export const registerDoctorValidator = [
  ...commonSignupRules,
  body('role')
    .equals('doctor')
    .withMessage('Role must be doctor for doctor registration'),
  body('qualification')
    .trim()
    .notEmpty()
    .withMessage('Qualification is required'),
  body('specialization')
    .trim()
    .notEmpty()
    .withMessage('Specialization is required'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('medicalLicenseNumber')
    .trim()
    .notEmpty()
    .withMessage('Medical license number is required'),
  body('yearsOfExperience')
    .notEmpty()
    .withMessage('Years of experience is required')
    .isInt({ min: 0 })
    .withMessage('Years of experience must be a non-negative integer')
];

/**
 * Validator rules for Login
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validator rules for Forgot Password Request
 */
export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
];

/**
 * Validator rules for Reset Password Action
 */
export const resetPasswordValidator = [
  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

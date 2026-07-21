import { User } from '../models/user.model.js';
import { Patient } from '../models/patient.model.js';
import { Doctor } from '../models/doctor.model.js';
import { generateVerificationToken, generateResetPasswordToken } from '../services/token.service.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { generateToken } from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Helper to set JWT token cookie
 */
const sendTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days matching JWT expiration default
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Register User (Patient/Doctor)
 */
export const signup = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      phone,
      gender,
      address,
      profileImage,
      // Doctor fields
      qualification,
      specialization,
      department,
      medicalLicenseNumber,
      yearsOfExperience,
      // Patient optional fields
      bloodGroup,
      allergies,
      emergencyContact,
      medicalHistory
    } = req.body;

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'An account with this email address already exists.');
    }

    // 2. If registering as a doctor, ensure license is unique
    if (role === 'doctor') {
      const existingDoctor = await Doctor.findOne({ medicalLicenseNumber });
      if (existingDoctor) {
        return errorResponse(res, 400, 'A doctor account with this license number already exists.');
      }
    }

    // 3. Generate verification token
    const { token: verificationToken, expiry: verificationTokenExpiry } = generateVerificationToken();

    // 4. Create User instance
    const user = new User({
      fullName,
      email,
      password,
      role,
      phone,
      gender,
      address,
      profileImage: profileImage || '',
      isVerified: false,
      verificationToken,
      verificationTokenExpiry
    });

    // Save User
    const savedUser = await user.save();

    // 5. Create role-specific document
    if (role === 'patient') {
      await Patient.create({
        userId: savedUser._id,
        bloodGroup: bloodGroup || '',
        allergies: allergies || [],
        emergencyContact: emergencyContact || { name: '', relationship: '', phone: '' },
        medicalHistory: medicalHistory || []
      });
    } else if (role === 'doctor') {
      await Doctor.create({
        userId: savedUser._id,
        qualification,
        specialization,
        department,
        medicalLicenseNumber,
        yearsOfExperience
      });
    }

    // 6. Send verification email
    await sendVerificationEmail(savedUser.email, savedUser.fullName, verificationToken);

    return successResponse(
      res,
      201,
      'Registration successful! Please check your email to verify your account.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Email Address
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, 400, 'Verification token is required.');
    }

    // 1. Find user by token and verify it hasn't expired
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 400, 'Verification token is invalid or has expired.');
    }

    // 2. Set user as verified, clear token fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // 3. Send welcome email
    await sendWelcomeEmail(user.email, user.fullName, user.role);

    return successResponse(res, 200, 'Congratulations! Your account has been verified successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Resend Verification Email
 */
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    if (user.isVerified) {
      return errorResponse(res, 400, 'This account is already verified.');
    }

    // Generate new token
    const { token: verificationToken, expiry: verificationTokenExpiry } = generateVerificationToken();

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send email
    await sendVerificationEmail(user.email, user.fullName, verificationToken);

    return successResponse(res, 200, 'Verification email has been resent successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // 2. Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // 3. Check if verified
    if (!user.isVerified) {
      return errorResponse(
        res,
        403,
        'Your email address is not verified. Please verify your email first.'
      );
    }

    // Remove password from user object
    user.password = undefined;

    // 4. Generate JWT
    const token = generateToken(user._id, user.role);

    // 5. Send cookie
    sendTokenCookie(res, token);

    // Load role profile details
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
    }

    return successResponse(res, 200, 'Logged in successfully.', {
      token,
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password Request
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return success response to prevent email enumeration
      return successResponse(
        res,
        200,
        'If an account exists with this email address, a password reset link has been sent.'
      );
    }

    // 1. Generate reset token
    const { token: resetPasswordToken, expiry: resetPasswordExpiry } = generateResetPasswordToken();

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiry = resetPasswordExpiry;
    await user.save();

    // 2. Send email
    await sendPasswordResetEmail(user.email, user.fullName, resetPasswordToken);

    return successResponse(
      res,
      200,
      'If an account exists with this email address, a password reset link has been sent.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return errorResponse(res, 400, 'Reset token is required.');
    }

    // 1. Find user by reset token and ensure it has not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 400, 'Password reset token is invalid or has expired.');
    }

    // 2. Set new password, clear token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return successResponse(res, 200, 'Password has been updated successfully. You can now login.');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout User
 */
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    return successResponse(res, 200, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Active User
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;

    // Load role profile details
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
    }

    return successResponse(res, 200, 'User profile fetched successfully.', {
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
};

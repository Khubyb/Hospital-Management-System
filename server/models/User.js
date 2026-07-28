const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Base schema shared by every account type (Patient, Doctor, Admin).
// Role-specific fields live on discriminators (Patient.js, Doctor.js) so we
// avoid one giant schema full of optional fields.
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters'],
      maxlength: [80, 'Full name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned by default in queries
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[0-9]{10,15}$/, 'Please provide a valid phone number'],
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true,
    },
    profilePicture: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }, // Cloudinary public_id, for deletion
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true, // admin can deactivate accounts
    },
    acceptedTerms: {
      type: Boolean,
      required: [true, 'You must accept the terms and conditions'],
    },

    // --- OTP based email verification / password reset ---
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpPurpose: { type: String, enum: ['verify_email', 'reset_password'], select: false },

    // --- Password reset token (alternative link-based flow, kept for flexibility) ---
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    discriminatorKey: 'role', // Doctor/Patient/Admin models extend this via discriminator
  }
);

// Hash password before saving, only if it was modified
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Instance method: compare plaintext password with hashed password
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: generate a 6-digit OTP, hash it before storing, return the raw OTP
userSchema.methods.generateOTP = function generateOTP(purpose) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpCode = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.otpPurpose = purpose;
  return otp; // raw OTP is emailed to the user, hashed version stored in DB
};

// Instance method: verify a raw OTP against the stored hash
userSchema.methods.verifyOTP = function verifyOTP(candidateOTP, purpose) {
  if (!this.otpCode || !this.otpExpires || this.otpPurpose !== purpose) return false;
  if (this.otpExpires < Date.now()) return false;
  const hashedCandidate = crypto.createHash('sha256').update(candidateOTP).digest('hex');
  return hashedCandidate === this.otpCode;
};

// Never leak sensitive fields, even if accidentally selected
userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otpCode;
  delete obj.otpExpires;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

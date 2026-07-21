import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Avoid sending password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor'],
        message: 'Role must be either patient or doctor'
      },
      required: [true, 'Role is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be male, female, or other'
      },
      required: [true, 'Gender is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    profileImage: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    themePreference: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);

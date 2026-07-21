import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    medicalLicenseNumber: {
      type: String,
      required: [true, 'Medical License Number is required'],
      unique: true,
      trim: true
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Years of experience cannot be negative']
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: [0, 'Consultation fee cannot be negative']
    },
    availableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    availableTime: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }
  },
  {
    timestamps: true
  }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);

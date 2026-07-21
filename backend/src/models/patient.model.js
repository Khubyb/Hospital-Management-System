import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        message: 'Please provide a valid blood group'
      },
      default: ''
    },
    allergies: {
      type: [String],
      default: []
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    medicalHistory: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const Patient = mongoose.model('Patient', patientSchema);

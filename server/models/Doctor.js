const mongoose = require('mongoose');
const User = require('./User');

const doctorSchema = new mongoose.Schema({
  medicalLicenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true,
    trim: true,
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [70, 'Please enter a realistic value'],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
  },
  consultationFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  availability: [
    {
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true,
      },
      slots: [
        {
          startTime: { type: String, required: true }, // "09:00"
          endTime: { type: String, required: true }, // "09:30"
          isBooked: { type: Boolean, default: false },
        },
      ],
    },
  ],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  isApprovedByAdmin: {
    type: Boolean,
    default: false, // admin must vet doctor credentials before they go live
  },
});

const Doctor = User.discriminator('doctor', doctorSchema);

module.exports = Doctor;

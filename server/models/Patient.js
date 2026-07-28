const mongoose = require('mongoose');
const User = require('./User');

const patientSchema = new mongoose.Schema({
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function isAtLeastOneYearOld(dob) {
        const ageInMs = Date.now() - new Date(dob).getTime();
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
        return ageInYears >= 0 && ageInYears <= 130;
      },
      message: 'Please provide a valid date of birth',
    },
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required'],
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: {
    name: { type: String, required: [true, 'Emergency contact name is required'] },
    relationship: String,
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      match: [/^\+?[0-9]{10,15}$/, 'Please provide a valid emergency contact phone'],
    },
  },
  favouriteDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  healthProfile: {
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    height: Number, // cm
    weight: Number, // kg
  },
});

const Patient = User.discriminator('patient', patientSchema);

module.exports = Patient;

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional: doctors aren't required to have a department assigned anymore,
    // so an appointment may not have one either.
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "09:30"
    reasonForVisit: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    cancellationReason: { type: String },
    rejectionReason: { type: String },
    consultationFee: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
);

// Prevent double-booking the same doctor for the same date + time slot
appointmentSchema.index(
  { doctor: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'approved'] } },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Book a new appointment (patient)
// @route   POST /api/appointments
// @access  Private/Patient
exports.bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, departmentId, date, startTime, endTime, reasonForVisit } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') throw new ApiError(404, 'Doctor not found');
  if (!doctor.isApprovedByAdmin) throw new ApiError(400, 'This doctor is not currently accepting appointments');

  // The unique compound index on Appointment (doctor+date+startTime for
  // pending/approved statuses) is the real guard against race conditions;
  // this pre-check just gives a friendlier error message.
  const clash = await Appointment.findOne({
    doctor: doctorId,
    date,
    startTime,
    status: { $in: ['pending', 'approved'] },
  });
  if (clash) throw new ApiError(409, 'This time slot is no longer available. Please choose another.');

  let appointment;
  try {
    appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      department: departmentId,
      date,
      startTime,
      endTime,
      reasonForVisit,
      consultationFee: doctor.consultationFee,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'This time slot was just booked by someone else. Please choose another.');
    }
    throw err;
  }

  await sendEmail({
    to: req.user.email,
    subject: 'Appointment Request Received',
    html: `<p>Hi ${req.user.fullName}, your appointment request with Dr. ${doctor.fullName} on ${new Date(
      date
    ).toDateString()} at ${startTime} has been received and is pending confirmation.</p>`,
  });

  res.status(201).json({ success: true, appointment });
});

// @desc    Get appointments for the logged-in user (patient sees own, doctor sees own, admin sees all)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'patient') filter.patient = req.user._id;
  if (req.user.role === 'doctor') filter.doctor = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const appointments = await Appointment.find(filter)
    .populate('patient', 'fullName email phone profilePicture')
    .populate('doctor', 'fullName specialization profilePicture')
    .populate('department', 'name')
    .sort('-date');

  // Safety net for any appointments left over from before deleting an
  // account also cleaned up its appointments (see adminController.deleteUser):
  // if the referenced doctor or patient no longer exists, populate() leaves
  // that field null. Hide those instead of rendering a broken "Dr. " card.
  const validAppointments = appointments.filter((a) => a.patient && a.doctor);

  res.status(200).json({ success: true, count: validAppointments.length, appointments: validAppointments });
});

// @desc    Update appointment status (doctor approves/rejects/completes, patient cancels)
// @route   PATCH /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const isOwnerPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user._id.toString();
  const isOwnerDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwnerPatient && !isOwnerDoctor && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to update this appointment');
  }

  // Patients may only cancel; doctors may approve/reject/complete
  if (isOwnerPatient && status !== 'cancelled') {
    throw new ApiError(403, 'Patients can only cancel appointments');
  }

  appointment.status = status;
  if (status === 'cancelled') appointment.cancellationReason = reason;
  if (status === 'rejected') appointment.rejectionReason = reason;

  await appointment.save();

  res.status(200).json({ success: true, appointment });
});

// @desc    Reschedule an appointment (patient)
// @route   PATCH /api/appointments/:id/reschedule
// @access  Private/Patient
exports.rescheduleAppointment = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to reschedule this appointment');
  }
  if (!['pending', 'approved'].includes(appointment.status)) {
    throw new ApiError(400, 'Only pending or approved appointments can be rescheduled');
  }

  const clash = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctor: appointment.doctor,
    date,
    startTime,
    status: { $in: ['pending', 'approved'] },
  });
  if (clash) throw new ApiError(409, 'This time slot is not available. Please choose another.');

  appointment.date = date;
  appointment.startTime = startTime;
  appointment.endTime = endTime;
  appointment.status = 'pending'; // needs re-approval after reschedule
  await appointment.save();

  res.status(200).json({ success: true, appointment });
});

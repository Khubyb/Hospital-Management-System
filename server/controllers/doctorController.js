const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Search / list doctors with filters, pagination and sorting
// @route   GET /api/doctors?department=&specialization=&minExperience=&search=&page=&limit=&sort=
// @access  Public
exports.getDoctors = asyncHandler(async (req, res) => {
  const { department, specialization, minExperience, search, sort } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const filter = { role: 'doctor', isApprovedByAdmin: true, isActive: true };
  if (department) filter.department = department;
  if (specialization) filter.specialization = new RegExp(specialization, 'i');
  if (minExperience) filter.yearsOfExperience = { $gte: Number(minExperience) };
  if (search) {
    filter.$or = [
      { fullName: new RegExp(search, 'i') },
      { specialization: new RegExp(search, 'i') },
      { qualification: new RegExp(search, 'i') },
    ];
  }

  const sortMap = {
    experience: '-yearsOfExperience',
    rating: '-rating.average',
    name: 'fullName',
    fee: 'consultationFee',
  };

  const total = await Doctor.countDocuments(filter);
  const doctors = await Doctor.find(filter)
    .select('-password')
    .populate('department', 'name')
    .sort(sortMap[sort] || '-rating.average')
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: doctors.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    doctors,
  });
});

// @desc    Get a single doctor's public profile
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ _id: req.params.id, role: 'doctor' })
    .select('-password')
    .populate('department', 'name');
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  res.status(200).json({ success: true, doctor });
});

const SLOT_MINUTES = 30;
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHHMM = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

// @desc    Get a doctor's actual bookable time slots for a given date, derived
//          from their configured shifts, with already-booked slots removed
// @route   GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
// @access  Public
exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) throw new ApiError(400, 'A date is required, e.g. ?date=2026-08-05');

  const doctor = await Doctor.findOne({ _id: req.params.id, role: 'doctor' });
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const dayName = DAY_NAMES[new Date(`${date}T00:00:00`).getDay()];
  const hasConfiguredAvailability = doctor.availability && doctor.availability.length > 0;

  let generated = [];
  if (!hasConfiguredAvailability) {
    // Doctor hasn't set up their weekly shifts yet - fall back to a generic
    // open window so patients aren't blocked from booking entirely.
    const FALLBACK_START = '09:00';
    const FALLBACK_END = '17:00';
    let start = toMinutes(FALLBACK_START);
    const end = toMinutes(FALLBACK_END);
    while (start + SLOT_MINUTES <= end) {
      generated.push({ startTime: toHHMM(start), endTime: toHHMM(start + SLOT_MINUTES) });
      start += SLOT_MINUTES;
    }
  } else {
    const dayEntry = doctor.availability.find((a) => a.day === dayName);
    if (dayEntry) {
      dayEntry.slots.forEach((shift) => {
        let start = toMinutes(shift.startTime);
        const end = toMinutes(shift.endTime);
        while (start + SLOT_MINUTES <= end) {
          generated.push({ startTime: toHHMM(start), endTime: toHHMM(start + SLOT_MINUTES) });
          start += SLOT_MINUTES;
        }
      });
    }
  }

  // Remove slots someone else already holds (pending or approved) for that date
  const taken = await Appointment.find({
    doctor: req.params.id,
    date: new Date(`${date}T00:00:00`),
    status: { $in: ['pending', 'approved'] },
  }).select('startTime');
  const takenTimes = new Set(taken.map((a) => a.startTime));

  const available = generated.filter((s) => !takenTimes.has(s.startTime));

  res.status(200).json({ success: true, day: dayName, usingFallback: !hasConfiguredAvailability, slots: available });
});

// @desc    Update the logged-in doctor's own availability schedule
// @route   PUT /api/doctors/availability
// @access  Private/Doctor
exports.updateAvailability = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.user._id);
  doctor.availability = req.body.availability;
  await doctor.save();
  res.status(200).json({ success: true, availability: doctor.availability });
});

// @desc    Cancel one specific already-saved shift (e.g. doctor is suddenly busy
//          that day) without touching the rest of their weekly schedule
// @route   PATCH /api/doctors/availability/cancel
// @access  Private/Doctor
exports.cancelAvailabilitySlot = asyncHandler(async (req, res) => {
  const { day, startTime, endTime } = req.body;
  if (!day || !startTime || !endTime) {
    throw new ApiError(400, 'day, startTime and endTime are required');
  }

  const doctor = await Doctor.findById(req.user._id);
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const dayEntry = doctor.availability.find((a) => a.day === day);
  const shiftExists = dayEntry?.slots.some((s) => s.startTime === startTime && s.endTime === endTime);
  if (!shiftExists) throw new ApiError(404, 'That shift was not found — it may have already been removed');

  // Note: this only removes the recurring weekly shift so patients can no
  // longer book new appointments in it. It does not touch appointments a
  // patient already booked in that window — those are managed separately
  // from the doctor's Appointments tab (approve/reject/cancel).
  doctor.availability = doctor.availability
    .map((a) =>
      a.day === day
        ? { day: a.day, slots: a.slots.filter((s) => !(s.startTime === startTime && s.endTime === endTime)) }
        : a
    )
    .filter((a) => a.slots.length > 0);

  await doctor.save();
  res.status(200).json({ success: true, availability: doctor.availability });
});

// @desc    Admin: approve a doctor's credentials so they appear in search / can log in
// @route   PATCH /api/doctors/:id/approve
// @access  Private/Admin
exports.approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isApprovedByAdmin: true, approvalStatus: 'approved', rejectionReason: undefined },
    { new: true }
  ).select('-password');
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  res.status(200).json({ success: true, doctor });
});

// @desc    Admin: reject a doctor's application, optionally with a reason
// @route   PATCH /api/doctors/:id/reject
// @access  Private/Admin
exports.rejectDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    {
      isApprovedByAdmin: false,
      approvalStatus: 'rejected',
      rejectionReason: req.body.reason || 'Application did not meet requirements',
    },
    { new: true }
  ).select('-password');
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  res.status(200).json({ success: true, doctor });
});

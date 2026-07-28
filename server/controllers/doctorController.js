const Doctor = require('../models/Doctor');
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

// @desc    Update the logged-in doctor's own availability schedule
// @route   PUT /api/doctors/availability
// @access  Private/Doctor
exports.updateAvailability = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.user._id);
  doctor.availability = req.body.availability;
  await doctor.save();
  res.status(200).json({ success: true, availability: doctor.availability });
});

// @desc    Admin: approve a doctor's credentials so they appear in search / can log in
// @route   PATCH /api/doctors/:id/approve
// @access  Private/Admin
exports.approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isApprovedByAdmin: true },
    { new: true }
  ).select('-password');
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  res.status(200).json({ success: true, doctor });
});

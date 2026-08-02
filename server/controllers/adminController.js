const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get high-level counts for the admin dashboard overview
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalPatients, totalDoctors, pendingDoctorApprovals, totalDepartments, appointmentsByStatus] =
    await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'doctor', approvalStatus: 'pending' }),
      Department.countDocuments({ isActive: true }),
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

  // Turn [{ _id: 'pending', count: 3 }, ...] into { pending: 3, approved: 5, ... }
  const statusCounts = appointmentsByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
  const totalAppointments = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);

  res.status(200).json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      pendingDoctorApprovals,
      totalDepartments,
      totalAppointments,
      appointmentsByStatus: statusCounts,
    },
  });
});

// @desc    List every doctor (approved and pending) for admin review
// @route   GET /api/admin/doctors
// @access  Private/Admin
exports.getAllDoctorsForAdmin = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ role: 'doctor' })
    .select('-password')
    .populate('department', 'name')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: doctors.length, doctors });
});

// @desc    List every patient for admin review
// @route   GET /api/admin/patients
// @access  Private/Admin
exports.getAllPatientsForAdmin = asyncHandler(async (req, res) => {
  const patients = await User.find({ role: 'patient' }).select('-password').sort('-createdAt');
  res.status(200).json({ success: true, count: patients.length, patients });
});

// @desc    Get full details of a single patient or doctor
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').populate('department', 'name');
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, user });
});

// Fields an admin is allowed to edit. Deliberately excludes password, role,
// email-verification and approval-workflow fields (those go through their
// own dedicated endpoints/flows) to avoid accidental corruption.
const EDITABLE_FIELDS = [
  'fullName',
  'email',
  'phone',
  // patient-only
  'dateOfBirth',
  'gender',
  'bloodGroup',
  'address',
  'emergencyContact',
  // doctor-only
  'specialization',
  'qualification',
  'yearsOfExperience',
  'department',
  'consultationFee',
  'medicalLicenseNumber',
];

// @desc    Edit a patient's or doctor's own details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  // See the note in authController.updateProfile: findByIdAndUpdate() on the
  // base User model silently drops discriminator-only fields (like a
  // doctor's consultationFee or specialization), so we hydrate the real
  // document first and save() it instead.
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  EDITABLE_FIELDS.forEach((field) => {
    if (req.body[field] === undefined) return;
    const value = req.body[field];
    user[field] = value === '' ? undefined : value;
  });

  await user.save();
  await user.populate('department', 'name');

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Permanently delete a patient's or doctor's account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  // Deleting an account used to leave its appointments behind, pointing at
  // a doctor/patient that no longer exists. Those "dangling" appointments
  // would still show up on the other side's dashboard, e.g. a patient
  // seeing a nameless "Dr. " card for a doctor an admin removed. Cleaning
  // them up here means a deleted account disappears everywhere, not just
  // from the admin's own list.
  const deletedAppointments = await Appointment.deleteMany(
    user.role === 'doctor' ? { doctor: user._id } : { patient: user._id }
  );

  res.status(200).json({
    success: true,
    message: `${user.fullName}'s account was deleted${
      deletedAppointments.deletedCount
        ? ` along with ${deletedAppointments.deletedCount} related appointment(s)`
        : ''
    }`,
  });
});

// @desc    Activate/deactivate any account (patient or doctor)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
exports.setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, user });
});

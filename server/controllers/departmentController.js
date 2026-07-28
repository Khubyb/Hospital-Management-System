const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all active departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort('name');
  res.status(200).json({ success: true, count: departments.length, departments });
});

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, department });
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) throw new ApiError(404, 'Department not found');
  res.status(200).json({ success: true, department });
});

// @desc    Deactivate a department (soft delete)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!department) throw new ApiError(404, 'Department not found');
  res.status(200).json({ success: true, message: 'Department deactivated' });
});

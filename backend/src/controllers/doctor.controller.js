import { Doctor } from '../models/doctor.model.js';
import { User } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Get Doctor profile details
 */
export const getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', '-password');
    if (!doctor) {
      return errorResponse(res, 404, 'Doctor profile not found.');
    }
    return successResponse(res, 200, 'Doctor profile fetched successfully.', doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Doctor profile details
 */
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      qualification,
      specialization,
      department,
      yearsOfExperience,
      consultationFee,
      availableDays,
      availableTime,
      fullName,
      phone,
      gender,
      address
    } = req.body;

    // 1. Find the doctor profile
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return errorResponse(res, 404, 'Doctor profile not found.');
    }

    // 2. Update user core fields
    const userUpdates = {};
    if (fullName) userUpdates.fullName = fullName;
    if (phone) userUpdates.phone = phone;
    if (gender) userUpdates.gender = gender;
    if (address) userUpdates.address = address;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    // 3. Update doctor-specific fields
    if (qualification !== undefined) doctor.qualification = qualification;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (department !== undefined) doctor.department = department;
    if (yearsOfExperience !== undefined) doctor.yearsOfExperience = yearsOfExperience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availableDays !== undefined) doctor.availableDays = availableDays;
    if (availableTime !== undefined) doctor.availableTime = availableTime;

    const updatedDoctor = await doctor.save();

    // Populate user references for response
    const result = await Doctor.findById(updatedDoctor._id).populate('userId', '-password');

    return successResponse(res, 200, 'Doctor profile updated successfully.', result);
  } catch (error) {
    next(error);
  }
};

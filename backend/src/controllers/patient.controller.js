import { Patient } from '../models/patient.model.js';
import { User } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Get Patient profile details
 */
export const getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id }).populate('userId', '-password');
    if (!patient) {
      return errorResponse(res, 404, 'Patient profile not found.');
    }
    return successResponse(res, 200, 'Patient profile fetched successfully.', patient);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Patient profile details
 */
export const updatePatientProfile = async (req, res, next) => {
  try {
    const { bloodGroup, allergies, emergencyContact, medicalHistory, fullName, phone, gender, address } = req.body;

    // 1. Find the patient profile
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return errorResponse(res, 404, 'Patient profile not found.');
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

    // 3. Update patient-specific fields
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (allergies !== undefined) patient.allergies = allergies;
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;
    if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;

    const updatedPatient = await patient.save();
    
    // Populate user references for response
    const result = await Patient.findById(updatedPatient._id).populate('userId', '-password');

    return successResponse(res, 200, 'Patient profile updated successfully.', result);
  } catch (error) {
    next(error);
  }
};

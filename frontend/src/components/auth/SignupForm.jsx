import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, FileText, Award, Layers, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../common/Button.jsx';

const SignupForm = ({ showToast }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';

  const { signupPatient, signupDoctor } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'male',
    address: '',
    password: '',
    confirmPassword: '',
    // Patient specific
    dateOfBirth: '',
    // Doctor specific
    qualification: '',
    specialization: '',
    department: '',
    medicalLicenseNumber: '',
    yearsOfExperience: ''
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setLoading(true);

    let result;
    if (role === 'patient') {
      const patientPayload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'patient',
        dateOfBirth: formData.dateOfBirth
      };
      result = await signupPatient(patientPayload);
    } else {
      const doctorPayload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'doctor',
        qualification: formData.qualification,
        specialization: formData.specialization,
        department: formData.department,
        medicalLicenseNumber: formData.medicalLicenseNumber,
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10)
      };
      result = await signupDoctor(doctorPayload);
    }

    if (result.success) {
      showToast(result.message, 'success');
      navigate(`/login?role=${role}`); // redirect to login
    } else {
      setGeneralError(result.message);
      if (result.errors) {
        const errorsMap = {};
        result.errors.forEach((err) => {
          errorsMap[err.field] = err.message;
        });
        setFieldErrors(errorsMap);
      }
      showToast(result.message, 'error');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {generalError && (
        <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">
          {generalError}
        </div>
      )}

      {/* Grid for core fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              required
            />
          </div>
          {fieldErrors.fullName && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              required
            />
          </div>
          {fieldErrors.email && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1234567890"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              required
            />
          </div>
          {fieldErrors.phone && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.phone}</p>}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. 123 Main St, New York, NY"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            required
          />
        </div>
        {fieldErrors.address && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.address}</p>}
      </div>

      {/* Role-Specific Fields */}
      {role === 'patient' ? (
        /* Patient - Date of Birth */
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Date of Birth
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              required
            />
          </div>
          {fieldErrors.dateOfBirth && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.dateOfBirth}</p>}
        </div>
      ) : (
        /* Doctor - Doctor specifics */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Qualification */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Qualification
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Award className="w-4 h-4" />
                </div>
                <input
                  name="qualification"
                  type="text"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g. MBBS, MD"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  required
                />
              </div>
              {fieldErrors.qualification && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.qualification}</p>}
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Specialization
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Award className="w-4 h-4" />
                </div>
                <input
                  name="specialization"
                  type="text"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  required
                />
              </div>
              {fieldErrors.specialization && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.specialization}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
                <input
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Outpatient"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  required
                />
              </div>
              {fieldErrors.department && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.department}</p>}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Experience (Years)
              </label>
              <input
                name="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                required
              />
              {fieldErrors.yearsOfExperience && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.yearsOfExperience}</p>}
            </div>
          </div>

          {/* License */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Medical License Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                name="medicalLicenseNumber"
                type="text"
                value={formData.medicalLicenseNumber}
                onChange={handleChange}
                placeholder="e.g. LIC12345678"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                required
              />
            </div>
            {fieldErrors.medicalLicenseNumber && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.medicalLicenseNumber}</p>}
          </div>
        </div>
      )}

      {/* Passwords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              required
            />
          </div>
          {fieldErrors.password && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              required
            />
          </div>
          {fieldErrors.confirmPassword && <p className="text-[10px] text-red-500 font-semibold mt-1">{fieldErrors.confirmPassword}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="flex-1 shadow-md shadow-primary-500/10"
        >
          Create Account
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => navigate(`/role-selection?mode=signup`)}
          className="sm:w-1/4"
        >
          Back
        </Button>
      </div>

      <div className="text-center pt-3 text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate(`/role-selection?mode=login`)}
          className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Sign In
        </button>
      </div>
    </form>
  );
};

export default SignupForm;

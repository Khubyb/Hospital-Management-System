import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

// Strong password rule mirrored from the backend validator, so the user
// gets instant feedback instead of a round-trip failure.
const PASSWORD_PATTERN = {
  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  message: 'Min 8 chars, with uppercase, lowercase, number & special character',
};

const PatientSignup = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        emergencyContact: { name: data.emergencyName, relationship: data.emergencyRelationship, phone: data.emergencyPhone },
        acceptedTerms: data.acceptedTerms,
      };
      const res = await authService.signupPatient(payload);
      toast.success(res.message);
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-2xl p-8"
      >
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Patient Sign Up</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create your patient account to start booking appointments.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name" error={errors.fullName}>
            <input className="input-field" {...register('fullName', { required: 'Full name is required', minLength: { value: 3, message: 'Too short' } })} />
          </Field>

          <Field label="Email" error={errors.email}>
            <input type="email" className="input-field" {...register('email', { required: 'Email is required' })} />
          </Field>

          <Field label="Password" error={errors.password}>
            <input type="password" className="input-field" {...register('password', { required: 'Password is required', pattern: PASSWORD_PATTERN })} />
          </Field>

          <Field label="Confirm Password" error={errors.confirmPassword}>
            <input
              type="password"
              className="input-field"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />
          </Field>

          <Field label="Phone Number" error={errors.phone}>
            <input className="input-field" placeholder="+911234567890" {...register('phone', { required: 'Phone is required', pattern: { value: /^\+?[0-9]{10,15}$/, message: 'Invalid phone number' } })} />
          </Field>

          <Field label="Date of Birth" error={errors.dateOfBirth}>
            <input type="date" className="input-field" {...register('dateOfBirth', { required: 'Date of birth is required' })} />
          </Field>

          <Field label="Gender" error={errors.gender}>
            <select className="input-field" {...register('gender', { required: 'Gender is required' })}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field label="Blood Group" error={errors.bloodGroup}>
            <select className="input-field" {...register('bloodGroup', { required: 'Blood group is required' })}>
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Address" error={errors.addressStreet} full>
            <input className="input-field" placeholder="Street, City, State" {...register('addressStreet')} />
          </Field>

          <Field label="Emergency Contact Name" error={errors.emergencyName}>
            <input className="input-field" {...register('emergencyName', { required: 'Required' })} />
          </Field>

          <Field label="Emergency Contact Phone" error={errors.emergencyPhone}>
            <input className="input-field" {...register('emergencyPhone', { required: 'Required', pattern: { value: /^\+?[0-9]{10,15}$/, message: 'Invalid phone number' } })} />
          </Field>

          <label className="col-span-full flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" {...register('acceptedTerms', { required: 'You must accept the terms' })} />
            I accept the Terms &amp; Conditions
          </label>
          {errors.acceptedTerms && <p className="col-span-full -mt-2 text-xs text-red-500">{errors.acceptedTerms.message}</p>}

          <button type="submit" disabled={submitting} className="btn-primary col-span-full">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login/patient" className="font-medium text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

// Small local helper to keep the form markup readable
const Field = ({ label, error, children, full }) => (
  <div className={full ? 'col-span-full' : ''}>
    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
  </div>
);

export default PatientSignup;

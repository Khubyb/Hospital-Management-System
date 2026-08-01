import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService, departmentService } from '../services/authService';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

const PASSWORD_PATTERN = {
  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  message: 'Min 8 chars, with uppercase, lowercase, number & special character',
};

const DoctorSignup = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await departmentService.getAll();
        setDepartments(res.departments || []);
      } catch {
        // Non-critical: signup can still proceed without a department chosen
      }
    };
    loadDepartments();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await authService.signupDoctor(data);
      toast.success(res.message);
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      <ThemeToggle className="absolute right-6 top-6 z-20" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-2xl p-8"
      >
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Doctor Sign Up</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your account will need admin approval before you can log in.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name" error={errors.fullName}>
            <input className="input-field" {...register('fullName', { required: 'Full name is required' })} />
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
              {...register('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === password || 'Passwords do not match' })}
            />
          </Field>

          <Field label="Phone Number" error={errors.phone}>
            <input className="input-field" placeholder="+911234567890" {...register('phone', { required: 'Phone is required', pattern: { value: /^\+?[0-9]{10,15}$/, message: 'Invalid phone number' } })} />
          </Field>

          <Field label="Medical License Number" error={errors.medicalLicenseNumber}>
            <input className="input-field" {...register('medicalLicenseNumber', { required: 'Required' })} />
          </Field>

          <Field label="Specialization" error={errors.specialization}>
            <input className="input-field" placeholder="Cardiology" {...register('specialization', { required: 'Required' })} />
          </Field>

          <Field label="Department" error={errors.department}>
            <select className="input-field" defaultValue="" {...register('department', { required: 'Please select a department' })}>
              <option value="" disabled>
                Select a department
              </option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Qualification" error={errors.qualification}>
            <input className="input-field" placeholder="MBBS, MD" {...register('qualification', { required: 'Required' })} />
          </Field>

          <Field label="Years of Experience" error={errors.yearsOfExperience}>
            <input type="number" className="input-field" {...register('yearsOfExperience', { required: 'Required', min: { value: 0, message: 'Cannot be negative' } })} />
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
          <Link to="/login/doctor" className="font-medium text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
  </div>
);

export default DoctorSignup;

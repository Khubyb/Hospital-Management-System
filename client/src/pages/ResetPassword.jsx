import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

const PASSWORD_PATTERN = {
  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  message: 'Min 8 chars, with uppercase, lowercase, number & special character',
};

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, otp } = location.state || {};
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  if (!email || !otp) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-slate-500">Missing verification details. Please restart the password reset flow.</p>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await authService.resetPassword({ email, otp, newPassword: data.newPassword });
      toast.success(res.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <ThemeToggle className="absolute right-6 top-6 z-20" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Set a New Password</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="New password"
            className="input-field"
            {...register('newPassword', { required: 'Password is required', pattern: PASSWORD_PATTERN })}
          />
          {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}

          <input
            type="password"
            placeholder="Confirm new password"
            className="input-field"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === newPassword || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

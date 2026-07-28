import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

// Reused for both "verify email after signup" and "verify OTP during password reset".
// The purpose is passed through location.state; defaults to email verification.
const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const purpose = location.state?.purpose || 'verify_email';
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-slate-500">
          No email found for verification. Please{' '}
          <button className="text-primary-600 underline" onClick={() => navigate('/signup')}>
            sign up
          </button>{' '}
          again.
        </p>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (purpose === 'reset_password') {
        navigate('/reset-password', { state: { email, otp: data.otp } });
        return;
      }
      const res = await authService.verifyOTP({ email, otp: data.otp });
      toast.success(res.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await authService.resendOTP({ email, purpose });
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 text-center"
      >
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Verify Your Email</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          We sent a 6-digit code to <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <input
            maxLength={6}
            className="input-field text-center text-2xl font-bold tracking-[0.5em]"
            placeholder="------"
            {...register('otp', { required: 'Enter the 6-digit code', minLength: { value: 6, message: 'Code must be 6 digits' } })}
          />
          {errors.otp && <p className="text-xs text-red-500">{errors.otp.message}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <button onClick={handleResend} disabled={resending} className="mt-4 text-sm font-medium text-primary-600 hover:underline">
          {resending ? 'Sending...' : "Didn't get a code? Resend"}
        </button>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;

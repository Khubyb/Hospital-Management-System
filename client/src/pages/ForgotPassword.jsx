import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(data);
      toast.success(res.message);
      navigate('/verify-otp', { state: { email: data.email, purpose: 'reset_password' } });
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
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we'll send you a reset code.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <input type="email" placeholder="you@example.com" className="input-field" {...register('email', { required: 'Email is required' })} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

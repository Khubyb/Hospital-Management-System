import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShieldHalved, FaEnvelope, FaLock } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../../components/ui/ThemeToggle.jsx';

// Intentionally NOT linked from anywhere in the public UI (Welcome/RoleSelect
// pages only offer Patient/Doctor). Reach this page directly at /admin/login.
// Admin accounts are provisioned in the database (see server/utils/seed.js),
// never through public signup.
const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await login(data);
      if (user.role !== 'admin') {
        toast.error('This login is for administrators only.');
        return;
      }
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <ThemeToggle className="absolute right-6 top-6 z-20" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900">
          <FaShieldHalved className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-center font-display text-2xl font-bold text-slate-800 dark:text-white">
          Administrator Login
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Restricted access. Hospital staff only.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
            <div className="relative">
              <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input type="email" className="input-field pl-12" {...register('email', { required: 'Email is required' })} />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Password</label>
            <div className="relative">
              <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input type="password" className="input-field pl-12" {...register('password', { required: 'Password is required' })} />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full !bg-gradient-to-r !from-slate-700 !to-slate-900">
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

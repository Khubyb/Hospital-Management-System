import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, HeartPulse } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import Button from '../components/common/Button.jsx';
import Toast from '../components/common/Toast.jsx';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      setErrorMsg('Reset token is missing from the URL. Please verify your link.');
      showToast('Missing reset token.', 'error');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    if (result.success) {
      setSuccess(true);
      showToast(result.message, 'success');
    } else {
      setErrorMsg(result.message);
      showToast(result.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 dark:bg-primary-900/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-400/20 dark:bg-accent-900/10 blur-[120px]" />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md p-8 rounded-3xl border border-white/40 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 glass-panel shadow-2xl z-20 text-center"
      >
        <div className="inline-flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2 bg-primary-600 dark:bg-primary-500 rounded-xl text-white">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
            Hospital Care
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">Reset Password</h3>

        {!success ? (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Please enter your new password below. Ensure it is secure and at least 6 characters long.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-semibold text-red-500 animate-pulse">{errorMsg}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full shadow-md shadow-primary-500/10"
              >
                Update Password
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-center text-emerald-500">
              <CheckCircle className="w-16 h-16 stroke-[1.5]" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-4">
              Congratulations! Your password has been updated successfully. You can now access your account using the link below.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/role-selection?mode=login')}
            >
              Go to Login
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;

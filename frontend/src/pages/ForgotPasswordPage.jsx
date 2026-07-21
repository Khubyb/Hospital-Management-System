import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, HeartPulse } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import Button from '../components/common/Button.jsx';
import Toast from '../components/common/Toast.jsx';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    if (result.success) {
      setSubmitted(true);
      showToast(result.message, 'success');
    } else {
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

        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">Forgot Password</h3>
        
        {!submitted ? (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed px-4">
              Enter your registered email address below, and we will send you a secure link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="e.g. name@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full shadow-md shadow-primary-500/10"
              >
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-sm leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a recovery link has been dispatched. Please review your inbox (including your spam folder).
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setSubmitted(false)}
            >
              Try another email
            </Button>
          </div>
        )}

        <button
          onClick={() => navigate('/role-selection?mode=login')}
          className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mt-6 mx-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

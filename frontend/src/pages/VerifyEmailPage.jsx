import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Mail, HeartPulse } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Toast from '../components/common/Toast.jsx';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { verifyEmail, resendVerification } = useAuth();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Prevent duplicate verification trigger in React StrictMode
  const verifiedRef = useRef(false);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
  };

  useEffect(() => {
    const triggerVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token. Please check your verification link.');
        return;
      }

      if (verifiedRef.current) return;
      verifiedRef.current = true;

      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Congratulations! Your account has been verified successfully.');
        } else {
          setStatus('error');
          setMessage(result.message || 'Verification token is invalid or has expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    triggerVerification();
  }, [token, verifyEmail]);

  const handleResendSubmit = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setResending(true);
    const result = await resendVerification(resendEmail);
    if (result.success) {
      showToast('Verification email resent! Please check your inbox.', 'success');
      setResendEmail('');
    } else {
      showToast(result.message, 'error');
    }
    setResending(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      {/* Glows */}
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
        <div className="inline-flex items-center gap-2 mb-8 cursor-pointer animate-pulse" onClick={() => navigate('/')}>
          <div className="p-2 bg-primary-600 dark:bg-primary-500 rounded-xl text-white">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
            Hospital Care
          </span>
        </div>

        {status === 'verifying' && (
          <div className="py-8 space-y-4">
            <Loader size="lg" color="primary" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Verifying Account...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Please wait while we validate your activation token.</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 py-4"
          >
            <div className="flex justify-center text-emerald-500">
              <CheckCircle className="w-16 h-16 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Email Verified!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-4">{message}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-lg shadow-primary-500/10"
              onClick={() => navigate('/role-selection?mode=login')}
            >
              Go to Login
            </Button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 py-2"
          >
            <div className="flex justify-center text-red-500">
              <XCircle className="w-16 h-16 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Verification Failed</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">{message}</p>
            </div>

            <hr className="border-slate-200 dark:border-slate-800/80 my-4" />

            {/* Form to resend verification link */}
            <form onSubmit={handleResendSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Resend Verification Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={resending}
                className="w-full"
              >
                Send Verification Link
              </Button>
            </form>
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;

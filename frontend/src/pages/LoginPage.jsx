import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Stethoscope, Heart } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import Toast from '../components/common/Toast.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const roleMeta = {
    patient: {
      title: 'Patient Login',
      icon: Heart,
      colorClass: 'text-rose-500 bg-rose-500/10'
    },
    doctor: {
      title: 'Doctor Login',
      icon: Stethoscope,
      colorClass: 'text-primary-500 bg-primary-500/10'
    }
  };

  const activeRole = roleMeta[role] || roleMeta.patient;
  const ActiveIcon = activeRole.icon;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 dark:bg-primary-900/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-400/20 dark:bg-accent-900/10 blur-[120px]" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Global Toast */}
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
        className="relative w-full max-w-md p-8 rounded-3xl border border-white/40 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 glass-panel shadow-2xl z-20"
      >
        {/* Header Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-primary-600 dark:bg-primary-500 rounded-xl text-white">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
              Hospital Care
            </span>
          </div>

          <div className="flex items-center justify-center gap-2.5 mt-2">
            <div className={`p-2 rounded-lg ${activeRole.colorClass}`}>
              <ActiveIcon className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {activeRole.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Please enter your registered credentials to enter the workspace.
          </p>
        </div>

        {/* LoginForm Insertion */}
        <LoginForm showToast={showToast} />
      </motion.div>
    </div>
  );
};

export default LoginPage;

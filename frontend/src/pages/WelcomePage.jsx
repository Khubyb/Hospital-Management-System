import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, HeartPulse } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import Button from '../components/common/Button.jsx';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      {/* Decorative Glowing Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 dark:bg-primary-900/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-400/20 dark:bg-accent-900/10 blur-[120px]" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center gap-12 z-20">
        {/* Animated Illustration / Brand Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex-1 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-primary-600 dark:bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/20 text-white animate-pulse">
              <HeartPulse className="w-8 h-8" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
              Hospital Care
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
            Advanced Healthcare <br />
            <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              Management Portal
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
            Welcome to our modern medical administration system. Seamlessly book consultations, view medical records, and stay connected with professional healthcare providers.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/role-selection?mode=login')}
              className="px-8 shadow-lg shadow-primary-500/20 dark:shadow-none"
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/role-selection?mode=signup')}
              className="px-8 bg-white/20 dark:bg-slate-900/10"
            >
              Create Account
            </Button>
          </div>
        </motion.div>

        {/* Visual Graphic Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="flex-1 w-full max-w-[360px] md:max-w-none flex justify-center"
        >
          <div className="relative w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden glass-panel flex flex-col justify-between p-8 border border-white/40 shadow-xl">
            {/* Minimalist Graphic Element */}
            <div className="w-14 h-14 rounded-2xl bg-accent-500/10 dark:bg-accent-500/20 flex items-center justify-center text-accent-600 dark:text-accent-400 mb-4">
              <Activity className="w-7 h-7" />
            </div>
            
            <div className="space-y-4">
              <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-full animate-pulse" />
              <div className="h-4 w-4/5 bg-slate-200/40 dark:bg-slate-700/40 rounded-full animate-pulse" />
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">System Status: Active</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">v1.0.0</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;

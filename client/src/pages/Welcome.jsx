import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHeartPulse, FaUserDoctor } from 'react-icons/fa6';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

// First screen the app shows: brand moment + the Login / Sign Up fork.
// Admin is intentionally not listed here - admin accounts are provisioned
// directly in the database, never through public signup.
const Welcome = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <ThemeToggle className="absolute right-6 top-6 z-20" />

      {/* Floating ambient icons for a lively but subtle medical feel */}
      <FaHeartPulse className="absolute left-[8%] top-[18%] h-16 w-16 text-primary-200 dark:text-slate-800 animate-float" />
      <FaUserDoctor
        className="absolute right-[10%] bottom-[20%] h-20 w-20 text-cyan-200 dark:text-slate-800 animate-float"
        style={{ animationDelay: '1.5s' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-card relative z-10 w-full max-w-md p-10 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-cyan-500 shadow-soft">
          <FaHeartPulse className="h-8 w-8 text-white" />
        </div>

        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
          Welcome to <span className="gradient-text">Hospital Management System</span>
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Book appointments, manage care, and stay connected with your health — all in one place.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/login" className="btn-primary w-full">
            Log In
          </Link>
          <Link to="/signup" className="btn-outline w-full">
            Sign Up
          </Link>
        </div>

        <Link to="/" className="mt-6 inline-block text-xs text-slate-400 hover:text-primary-600">
          &larr; Back to home
        </Link>
      </motion.div>
    </div>
  );
};

export default Welcome;

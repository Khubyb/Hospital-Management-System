import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-md transition-all duration-300 ease-out"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-amber-500 fill-amber-100" />
            ) : (
              <Moon className="w-5 h-5 text-sky-300 fill-sky-950/20" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </button>
  );
};

export default ThemeToggle;

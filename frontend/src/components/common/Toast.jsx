import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />
  };

  const borderColors = {
    success: 'border-emerald-500/20 dark:border-emerald-500/30',
    error: 'border-red-500/20 dark:border-red-500/30',
    info: 'border-sky-500/20 dark:border-sky-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 shadow-lg backdrop-blur-md ${borderColors[type]} max-w-sm`}
    >
      <div className="flex-shrink-0">{icons[type] || icons.success}</div>
      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-auto p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;

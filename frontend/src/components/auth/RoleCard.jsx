import React from 'react';
import { motion } from 'framer-motion';

const RoleCard = ({ role, title, description, icon: Icon, selected, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`relative cursor-pointer p-8 rounded-2xl border transition-all duration-300 ${
        selected
          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 ring-2 ring-primary-500/30 shadow-md'
          : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/35 hover:border-slate-300 dark:hover:border-slate-700'
      } glass-card flex flex-col items-center text-center`}
    >
      <div
        className={`p-4 rounded-2xl mb-5 transition-colors duration-300 ${
          selected
            ? 'bg-primary-600 text-white dark:bg-primary-500'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
        }`}
      >
        <Icon className="w-9 h-9" />
      </div>
      <h3 className="text-xl font-bold mb-2.5 text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">{description}</p>
    </motion.div>
  );
};

export default RoleCard;

import React from 'react';

const Loader = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    primary: 'border-primary-500 border-t-transparent dark:border-primary-400 dark:border-t-transparent',
    accent: 'border-accent-500 border-t-transparent dark:border-accent-400 dark:border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${
          colorClasses[color] || colorClasses.primary
        }`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default Loader;

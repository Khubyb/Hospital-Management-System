import React from 'react';
import Loader from './Loader.jsx';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500 border border-transparent dark:bg-primary-500 dark:hover:bg-primary-600',
    secondary: 'bg-accent-600 hover:bg-accent-700 text-white shadow-sm focus:ring-accent-500 border border-transparent dark:bg-accent-500 dark:hover:bg-accent-600',
    outline: 'border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700 focus:ring-primary-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500 border border-transparent dark:bg-red-500 dark:hover:bg-red-600'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base'
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader size="sm" color="white" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

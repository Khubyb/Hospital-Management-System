import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../common/Button.jsx';

const LoginForm = ({ showToast }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlRole = searchParams.get('role') || 'patient';

  const { login, resendVerification } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isNotVerified, setIsNotVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load email from localStorage if Remember Me was previously checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('hms_saved_email');
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMsg('');
    setIsNotVerified(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsNotVerified(false);

    if (!formData.email || !formData.password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (formData.rememberMe) {
        localStorage.setItem('hms_saved_email', formData.email);
      } else {
        localStorage.removeItem('hms_saved_email');
      }
      showToast(result.message, 'success');
      navigate('/dashboard'); // Direct to landing dashboard
    } else {
      setErrorMsg(result.message);
      if (result.message.toLowerCase().includes('not verified')) {
        setIsNotVerified(true);
      }
      showToast(result.message, 'error');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!formData.email) {
      setErrorMsg('Please provide your email address to resend link.');
      return;
    }

    setSendingVerification(true);
    const result = await resendVerification(formData.email);
    if (result.success) {
      showToast('Verification email resent successfully. Please check your inbox.', 'success');
    } else {
      showToast(result.message, 'error');
      setErrorMsg(result.message);
    }
    setSendingVerification(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dynamic unverified warning alert */}
      {isNotVerified && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300 flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>Your email address is not verified. Please verify your email first.</span>
          </div>
          <button
            type="button"
            onClick={handleResend}
            disabled={sendingVerification}
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline text-left disabled:opacity-50"
          >
            {sendingVerification ? 'Sending link...' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="space-y-4">
        {/* Email */}
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
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. name@hospital.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate(`/forgot-password?role=${urlRole}`)}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={handleChange}
          className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-800 text-primary-600 focus:ring-primary-500 bg-transparent"
        />
        <label htmlFor="rememberMe" className="ml-2.5 block text-sm text-slate-600 dark:text-slate-400 font-medium select-none">
          Remember Me
        </label>
      </div>

      {errorMsg && !isNotVerified && (
        <p className="text-xs font-semibold text-red-500 animate-pulse">{errorMsg}</p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="flex-1 shadow-md shadow-primary-500/10"
        >
          Sign In
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => navigate(`/role-selection?mode=login`)}
          className="sm:w-1/3"
        >
          Back
        </Button>
      </div>

      <div className="text-center pt-4 text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => navigate(`/role-selection?mode=signup`)}
          className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;

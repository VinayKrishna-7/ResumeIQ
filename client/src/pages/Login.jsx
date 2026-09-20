import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  LogIn,
  UserPlus
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = ({ initialMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register: registerUser } = useAuth();

  // Mode can be 'login' or 'register'
  const [mode, setMode] = useState(
    initialMode || (location.pathname === '/register' ? 'register' : 'login')
  );

  // Sync mode with route changes if user clicks browser back/forward
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setFormError('');
    navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Strict validation
    if (!trimmedEmail) {
      setFormError('Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFormError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (!trimmedName) {
        setFormError('Please enter your full name.');
        return;
      }
      if (trimmedName.length < 2) {
        setFormError('Full name must be at least 2 characters.');
        return;
      }
      if (!confirmPassword) {
        setFormError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }

      try {
        setIsSubmitting(true);
        const res = await registerUser(trimmedName, trimmedEmail, password, confirmPassword);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setFormError(res.message || 'Registration failed. Please try again.');
        }
      } catch (err) {
        setFormError(err.message || 'Unable to register account. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Login mode
      try {
        setIsSubmitting(true);
        const res = await login(trimmedEmail, password);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setFormError(res.message || 'Invalid email or password. Please verify your credentials.');
        }
      } catch (err) {
        setFormError(err.message || 'Login failed. Please verify your network connection and try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-[#0B1120]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-[#F8FAFC]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md dark:bg-[#818CF8] dark:text-[#0B1120]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span>
            Resume<span className="text-indigo-600 dark:text-[#818CF8]">IQ</span>
          </span>
        </Link>
        <h2 className="mt-5 text-2xl font-extrabold font-display tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8]">
          {mode === 'login'
            ? 'Enter your verified credentials to access your workspace.'
            : 'Get started with ATS analysis and resume intelligence.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white py-8 px-6 shadow-sm dark:border-[#243044] dark:bg-[#111827] sm:px-8">
          {/* Top Segmented Tab Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-[#172033] mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-[#243044] dark:text-[#F8FAFC]'
                  : 'text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-[#243044] dark:text-[#F8FAFC]'
                  : 'text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Form Error Alert Banner */}
          {formError && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Name field for registration */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                  <input
                    type="text"
                    value={name}
                    onChange={handleInputChange(setName)}
                    placeholder="Alex Morgan"
                    required
                    autoComplete="name"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type="email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                  Password <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
                  At least 6 characters
                </span>
              </div>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field for registration */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleInputChange(setConfirmPassword)}
                    placeholder="Repeat your password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 focus:outline-hidden disabled:opacity-60 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500 dark:border-[#243044] dark:text-[#94A3B8]">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-[#818CF8] hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-[#818CF8] hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

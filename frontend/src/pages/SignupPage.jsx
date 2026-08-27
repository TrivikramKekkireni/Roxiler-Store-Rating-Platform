import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation Rules
  const isNameValid = name.length >= 20 && name.length <= 60;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPassLengthValid = password.length >= 8 && password.length <= 16;
  const hasPassUpper = /[A-Z]/.test(password);
  const hasPassSpecial = /[!@#$%^&*]/.test(password);
  const isPasswordValid = isPassLengthValid && hasPassUpper && hasPassSpecial;
  const isAddressValid = address.trim().length > 0 && address.length <= 400;

  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isAddressValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isNameValid) {
      setError('Name must be between 20 and 60 characters long.');
      return;
    }
    if (!isEmailValid) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password does not meet all security requirements.');
      return;
    }
    if (!isAddressValid) {
      setError('Address is required and must not exceed 400 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, password, address });
      navigate('/stores');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'An error occurred while creating your account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <div className="glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Top header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Create Normal User Account</h1>
            <p className="text-xs text-slate-400 mt-1">
              Join the Roxiler platform to rate and review stores
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Full Name
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    isNameValid
                      ? 'text-emerald-400 font-semibold'
                      : name.length > 0
                      ? 'text-amber-400'
                      : 'text-slate-500'
                  }`}
                >
                  {name.length}/60 chars (Min 20)
                </span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alice Robinson Henderson (20-60 chars)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
              {name.length > 0 && !isNameValid && (
                <p className="text-[11px] text-amber-400 mt-1">
                  Must be between 20 and 60 characters (currently {name.length} chars).
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    isPasswordValid ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {password.length}/16 chars (8-16)
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8-16 chars, 1 uppercase, 1 special char"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirement Checklist */}
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
                <div
                  className={`p-1.5 rounded-lg flex items-center gap-1 border transition-colors ${
                    isPassLengthValid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isPassLengthValid ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  <span>8-16 Chars</span>
                </div>
                <div
                  className={`p-1.5 rounded-lg flex items-center gap-1 border transition-colors ${
                    hasPassUpper
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasPassUpper ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  <span>1 Uppercase (A-Z)</span>
                </div>
                <div
                  className={`p-1.5 rounded-lg flex items-center gap-1 border transition-colors ${
                    hasPassSpecial
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasPassSpecial ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  <span>1 Special (!@#$%^&*)</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Address
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {address.length}/400 max
                </span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full physical address (up to 400 characters)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

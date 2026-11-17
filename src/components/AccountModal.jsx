import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { authApi } from '../services/authApi';

export default function AccountModal({
  isOpen,
  onClose,
  onShowToast,
  currentUser,
  onAuthSuccess,
  onLogoutSuccess
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset' | 'verify'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      if (currentUser) {
        setMode('profile');
      } else {
        setMode('login');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      onAuthSuccess?.(res.data.user);
      onShowToast?.(`Signed in as ${res.data.user.fullName || res.data.user.email}`);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.register({
        fullName,
        email,
        password,
        confirmPassword
      });
      onAuthSuccess?.(res.data.user);
      onShowToast?.(`Welcome to the grid, ${res.data.user.fullName}!`);
      setSuccessMsg('Account created! A verification token has been generated.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      setSuccessMsg(res.message);
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.resetPassword({
        token,
        password,
        confirmPassword
      });
      setSuccessMsg(res.message);
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('You can now sign in with your new password.');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Verification
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.verifyEmail({ token, email });
      if (currentUser) {
        onAuthSuccess?.({ ...currentUser, isVerified: true });
      }
      setSuccessMsg('Email successfully verified! Your account is active.');
      onShowToast?.('Driver account verified successfully!');
      setTimeout(() => {
        setMode(currentUser ? 'profile' : 'login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      onLogoutSuccess?.();
      onShowToast?.('Signed out successfully');
      onClose();
    } catch (err) {
      onShowToast?.('Signed out');
      onLogoutSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-[#0f0003] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              {mode === 'profile'
                ? 'Driver Profile'
                : mode === 'register'
                ? 'New Driver Registration'
                : mode === 'forgot'
                ? 'Reset Driver Password'
                : mode === 'reset'
                ? 'Enter New Password'
                : mode === 'verify'
                ? 'Verify Email Address'
                : 'Driver Account'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Toggle Tabs (when not logged in & in login/register) */}
        {!currentUser && (mode === 'login' || mode === 'register') && (
          <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Subtitle / Description */}
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          {mode === 'profile'
            ? 'Manage your Slidescoiety driver profile, synchronized setup configurations, and telemetry preferences.'
            : mode === 'register'
            ? 'Create your Slidescoiety account to preserve customized rig configurations, hardware telemetry, and order histories.'
            : mode === 'forgot'
            ? 'Enter your registered email address. We will dispatch instructions to securely reset your driver password.'
            : mode === 'verify'
            ? 'Enter the verification token sent to your email to activate all account privileges.'
            : 'Welcome to Slidescoiety Sim Racing Store. Sign in to synchronize your saved custom builds, telemetry preferences, and cart items.'}
        </p>

        {/* Alert Messages */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#e50914]/15 border border-[#e50914]/40 text-xs text-red-200 mb-4 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-[#e50914] shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 mb-4 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: PROFILE (AUTHENTICATED CUSTOMER) */}
        {mode === 'profile' && currentUser && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e50914]/20 border border-[#e50914]/40 flex items-center justify-center text-[#e50914]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{currentUser.fullName}</h4>
                    <p className="text-[11px] font-mono text-neutral-400">{currentUser.email}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-neutral-300 border border-white/10">
                  {currentUser.role}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Account Status:</span>
                {currentUser.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Driver
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('verify');
                      setError('');
                    }}
                    className="text-[#e50914] hover:underline font-medium text-xs flex items-center gap-1"
                  >
                    Pending Verification (Verify Now)
                  </button>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#e50914]/10 border border-[#e50914]/20 flex items-center gap-2.5 text-xs text-neutral-300">
              <Sparkles className="w-4 h-4 text-[#e50914] shrink-0" />
              <span>Cart items & custom rig setups are synchronized with your driver profile.</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="w-full py-3 rounded-full bg-white/10 hover:bg-[#e50914] hover:text-white text-neutral-200 font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* VIEW 2: SIGN IN FORM */}
        {mode === 'login' && !currentUser && (
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@slidescoiety.com"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono uppercase text-neutral-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[10px] font-mono text-neutral-400 hover:text-[#e50914] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Driver Portal'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('verify');
                  setError('');
                }}
                className="text-[11px] text-neutral-400 hover:text-white transition-colors"
              >
                Have a verification code? Click here
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: REGISTRATION FORM */}
        {mode === 'register' && !currentUser && (
          <form onSubmit={handleRegister} className="space-y-3.5 mb-6">
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Max Apex"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@slidescoiety.com"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Password (min 8 chars, letters & numbers)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
            >
              {loading ? 'Registering Driver...' : 'Complete Driver Registration'}
            </button>
          </form>
        )}

        {/* VIEW 4: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 mb-6">
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@slidescoiety.com"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
            >
              {loading ? 'Dispatching...' : 'Send Reset Link'}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-neutral-400 hover:text-white"
              >
                Have a reset token?
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#e50914] hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* VIEW 5: RESET PASSWORD FORM */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 mb-6">
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Reset Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter 64-character token"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                New Password (min 8 chars, letters & numbers)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#e50914] hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* VIEW 6: EMAIL VERIFICATION */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4 mb-6">
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@slidescoiety.com"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Verification Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste verification token"
                  className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] font-mono text-[11px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Driver Account'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(currentUser ? 'profile' : 'login')}
                className="text-xs text-[#e50914] hover:underline"
              >
                Cancel and return
              </button>
            </div>
          </form>
        )}

        {/* Global Modal Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full text-xs font-bold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}

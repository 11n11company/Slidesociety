import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { authApi } from '../services/authApi';

export default function AdminLogin({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both administrative email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.login({ email: email.trim(), password });
      const user = res?.data?.user;

      if (!user) {
        throw new Error('Authentication succeeded but user profile was missing.');
      }

      // Check role authorization on login
      if (user.role !== 'ADMIN') {
        // Driver accounts are forbidden from management console
        await authApi.logout().catch(() => {});
        throw new Error('Access denied. Restricted to administrator personnel only.');
      }

      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#e50914]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Login Box */}
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-200 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#e50914] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#e50914]" />
            <h2 className="font-bold text-2xl text-slate-900 tracking-tight uppercase">
              SLIDESCOIETY
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            MANAGEMENT CONSOLE
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Restricted to authorized ADMIN personnel only.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 mb-5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@slidescoiety.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#e50914] transition-colors"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#e50914] transition-colors"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#e50914] hover:bg-[#ff1801] disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#e50914]/20 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Enter Admin Console</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Customer Storefront */}
        <div className="pt-6 mt-6 border-t border-slate-200 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
}

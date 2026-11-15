import React, { useState } from 'react';
import { X, User, Lock, Mail, CheckCircle } from 'lucide-react';

export default function AccountModal({ isOpen, onClose, onShowToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onShowToast?.(`Signed in as ${email || 'Driver'} (demo session)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-md bg-[#0f0003] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              Driver Account
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          Welcome to Slidescoiety Sim Racing Store. Sign in to synchronize your saved custom builds, telemetry preferences, and demo cart items.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
              Password
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

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2"
          >
            Sign In to Driver Portal
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full text-xs font-bold text-neutral-400 hover:text-white border border-white/10"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


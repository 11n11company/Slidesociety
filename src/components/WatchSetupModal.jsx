import React from 'react';
import { X, Play, Wrench, ShieldCheck, Gauge, ArrowRight } from 'lucide-react';

export default function WatchSetupModal({ isOpen, onClose, onGoToBuilder }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-[#0f0003] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e50914] animate-pulse" />
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              P1-X Setup & Assembly Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview Card */}
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 bg-black border border-white/10 group cursor-pointer">
          <img
            src="/hero-backdrop-ultra-hd.webp?v=4"
            alt="P1-X Setup Preview"
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-2xl shadow-[#e50914]/60 mb-3 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-white ml-1" />
            </div>
            <h4 className="text-white font-bold text-lg tracking-tight">
              P1-X Chassis Calibration & Hardware Walkthrough
            </h4>
            <p className="text-neutral-300 text-xs mt-1">
              4K Ultra HD &bull; Step-by-Step Extrusion Assembly &amp; Direct-Drive Mounting
            </p>
          </div>
        </div>

        {/* Three Spec Pillars */}
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <Wrench className="w-4 h-4 text-[#e50914] mb-2" />
            <strong className="text-white text-xs block mb-1">01 / Chassis Build</strong>
            <span className="text-[11px] text-neutral-400">45 Mins &bull; Zero Chassis Flex</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <Gauge className="w-4 h-4 text-[#e50914] mb-2" />
            <strong className="text-white text-xs block mb-1">02 / Wheel Deck</strong>
            <span className="text-[11px] text-neutral-400">Up to 35Nm Direct Drive</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#e50914] mb-2" />
            <strong className="text-white text-xs block mb-1">03 / Pedal Incline</strong>
            <span className="text-[11px] text-neutral-400">Multi-axis tilt &amp; slide</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-neutral-300 hover:text-white border border-white/20 hover:bg-white/5"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToBuilder();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-[#e50914] hover:bg-[#ff1f2d] text-white shadow-lg shadow-[#e50914]/40"
          >
            <span>Configure Rig</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}


import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-white/[0.08] bg-[#070001] mt-20">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 py-12 flex flex-wrap justify-between items-center gap-6">
        <div>
          <img
            src="/slidescoiety-logo-hd.png"
            alt="Slidescoiety SIM RACING STORE"
            className="h-8 w-auto mb-2"
          />
          <p className="text-neutral-500 text-xs font-mono">
            SLIDESCOIETY // SIM RACING STORE &bull; DEMO HARDWARE COLLECTION
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs font-semibold" aria-label="Footer navigation">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            Shop All
          </button>
          <button
            type="button"
            onClick={() => onNavigate('shop', 'Cockpit frames')}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            Cockpits
          </button>
          <button
            type="button"
            onClick={() => onNavigate('shop', 'Accessories')}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            Accessories
          </button>
          <button
            type="button"
            onClick={() => onNavigate('builder')}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            Build My Setup
          </button>
        </nav>
      </div>
    </footer>
  );
}


import React, { useState, useEffect } from 'react';
import { stages, byId, fmt } from '../data/products';
import { Check, ArrowLeft, ArrowRight, Download, ShoppingCart, AlertCircle, MessageCircle } from 'lucide-react';

export default function RigBuilder({ onAddToCart, onShowToast }) {
  const [step, setStep] = useState(0);
  const [, setCatalogTick] = useState(0);
  const [build, setBuild] = useState({
    'frame-x': true,
    'seat-lite': true,
    'wheel': true,
    'pedals-pro': true
  });
  const [buildName, setBuildName] = useState('Apex Championship GT3');

  // React to catalog updates in real-time
  useEffect(() => {
    const handleUpdated = () => setCatalogTick((t) => t + 1);
    window.addEventListener('slidescoiety:products-updated', handleUpdated);
    return () => window.removeEventListener('slidescoiety:products-updated', handleUpdated);
  }, []);

  const currentStage = stages[step];

  // Toggle or select component
  const handleToggle = (id, multi) => {
    setBuild((prev) => {
      const next = { ...prev };
      if (!multi) {
        currentStage.ids.forEach((x) => delete next[x]);
        next[id] = true;
      } else {
        if (next[id]) delete next[id];
        else next[id] = true;
      }
      return next;
    });
  };

  // Calculate total
  const selectedItems = Object.keys(build)
    .filter((id) => build[id])
    .map((id) => byId(id))
    .filter(Boolean);

  const total = selectedItems.reduce((acc, p) => acc + p.price, 0);

  // Check if frame selected
  const hasFrame = ['frame-x', 'frame-p', 'frame-s'].some((id) => build[id]);

  // Connect with Technician on WhatsApp
  const handleConsultWhatsApp = () => {
    const technicianPhone = import.meta.env.VITE_WHATSAPP_NUMBER || '917902482052';
    const text = [
      `🏎️ *SLIDESCOIETY COCKPIT CONFIGURATION: ${buildName.toUpperCase()}*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📅 *Date:* ${new Date().toLocaleDateString()}`,
      `🛠️ *Configured Components (${selectedItems.length} items):*`,
      ...selectedItems.map((p, idx) => `  ${idx + 1}. *${p.name}* (${p.cat}) — ${fmt(p.price)}`),
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💰 *Estimated Build Total:* ${fmt(total)}`,
      ``,
      `💬 *Inquiry Message:*`,
      `Hi Slidescoiety Engineering Team! I have configured this custom sim racing setup (${buildName}) on the interactive builder. I would like to consult with a professional technician regarding direct-drive wheelbase torque, pedal angle rigidity, custom bracket mounting, and completing the order process.`
    ].join('\n');

    const waUrl = `https://wa.me/${technicianPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    onShowToast?.('Opening WhatsApp to connect with our sim racing technician...');
  };

  // Download summary text
  const handleExport = () => {
    const text = [
      `SLIDESCOIETY COCKPIT CONFIGURATION: ${buildName}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '------------------------------------------------',
      ...selectedItems.map((p) => `${p.name} — ${fmt(p.price)}`),
      '------------------------------------------------',
      `ESTIMATED BUILD TOTAL: ${fmt(total)}`,
      '',
      'Engineering Compatibility: Verified 100% Direct Drive Compatible.'
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${buildName.toLowerCase().replace(/\s+/g, '-')}-build.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Cockpit configuration downloaded');
  };

  const handleAddBuildToCart = () => {
    selectedItems.forEach((p) => onAddToCart(p.id, 1));
    onShowToast?.(`Added configured ${buildName} rig to your cart`);
  };

  return (
    <section className="py-14 sm:py-20 max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12" id="builder-section">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[#e50914] font-mono text-[11px] font-bold tracking-widest uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
          INTERACTIVE RIG CONFIGURATOR
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight leading-none mb-3">
          BUILD YOUR RIG.
        </h2>
        <p className="text-neutral-400 text-sm max-w-xl">
          Customize your extruded aluminum profile foundation, motorsport bucket seat, direct-drive wheelbase, and load-cell pedals.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Configurator Interactive Steps (8 cols) */}
        <div className="lg:col-span-8 bg-[#111111] border border-white/10 rounded-2xl p-5 sm:p-8">
          
          {/* Progress Stage Pills */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-6">
            {stages.map((stg, i) => (
              <button
                key={stg.name}
                type="button"
                onClick={() => setStep(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  step === i
                    ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/40 scale-105'
                    : 'bg-black/40 text-neutral-400 hover:text-white border border-white/10'
                }`}
              >
                {i + 1}. {stg.name}
              </button>
            ))}
          </div>

          {/* Current Stage Title & Info */}
          <div className="mb-6">
            <span className="font-mono text-xs uppercase tracking-wider text-[#e50914] font-bold">
              STAGE {step + 1} OF {stages.length}
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-white mt-1">
              {currentStage.name}
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">{currentStage.help}</p>
          </div>

          {/* Stage Component Options */}
          {step === 6 ? (
            /* Review & Name Your Rig Stage */
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-black/60 border border-white/10">
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                  Name Your Custom Cockpit
                </label>
                <input
                  type="text"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  className="w-full bg-[#181818] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-base focus:outline-none focus:border-[#e50914]"
                  placeholder="e.g. Night Shift Apex GT"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Spec Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={handleConsultWhatsApp}
                  disabled={!hasFrame}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#25D366]/30 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Discuss with Technician on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddBuildToCart}
                  disabled={!hasFrame}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#e50914]/40"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add Rig to Cart ({fmt(total)})</span>
                </button>
              </div>
            </div>
          ) : (
            /* Component Selection Grid */
            <div className="grid sm:grid-cols-2 gap-4">
              {currentStage.ids.map((id) => {
                const item = byId(id);
                if (!item) return null;
                const isSelected = !!build[id];

                return (
                  <div
                    key={id}
                    onClick={() => handleToggle(id, currentStage.multi)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? 'border-[#e50914] bg-[#e50914]/10 shadow-lg shadow-[#e50914]/15'
                        : 'border-white/10 bg-black/40 hover:border-white/30'
                    }`}
                  >
                    <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-black/60 border border-white/5 flex items-center justify-center p-2">
                      <img
                        src={item.image || item.imageUrl || '/hero-backdrop-hd.jpg'}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.currentTarget.src = '/hero-backdrop-hd.jpg'; }}
                        className="w-full h-full object-contain object-center transition-all"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-white text-sm tracking-tight">{item.name}</h4>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-[#e50914] text-white shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-[#e50914] font-bold mb-2">
                      {fmt(item.price)}
                    </p>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">{item.spec}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all ${
                step === 0
                  ? 'opacity-30 cursor-not-allowed text-neutral-500'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/20'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {step < 6 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(6, s + 1))}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white text-xs font-bold uppercase transition-all shadow-md shadow-[#e50914]/30"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Live Estimate Summary (4 cols) */}
        <div className="lg:col-span-4 bg-[#111111] border border-white/10 rounded-2xl p-6 sticky top-24">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE TELEMETRY ESTIMATE
          </div>
          <h3 className="font-display font-black text-2xl uppercase text-white mb-4">
            YOUR CONFIGURATION
          </h3>

          {/* Line Items */}
          <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 text-xs border-b border-white/5 pb-2"
              >
                <div>
                  <div className="font-bold text-white tracking-tight">{item.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">{item.cat}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-white font-bold">{fmt(item.price)}</div>
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id, true)}
                    className="text-[10px] text-[#e50914] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-white/10 flex items-end justify-between mb-6">
            <div>
              <span className="text-neutral-400 text-xs block">Estimated Total</span>
              <span className="text-2xl font-black font-mono text-white">{fmt(total)}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Demo INR</span>
          </div>

          {!hasFrame && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Select a chassis frame to complete this cockpit.</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddBuildToCart}
            disabled={!hasFrame}
            className={`w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              hasFrame
                ? 'bg-[#e50914] hover:bg-[#ff1f2d] text-white shadow-lg shadow-[#e50914]/40 hover:scale-105 active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add Configured Rig to Cart</span>
          </button>

          <button
            type="button"
            onClick={handleConsultWhatsApp}
            disabled={!hasFrame}
            className={`w-full mt-2.5 py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${
              hasFrame
                ? 'bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-black border-[#25D366]/40 shadow-md shadow-[#25D366]/20'
                : 'bg-transparent text-neutral-600 border-neutral-800 cursor-not-allowed'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consult Technician on WhatsApp</span>
          </button>
        </div>

      </div>
    </section>
  );
}


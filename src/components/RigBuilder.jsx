import React, { useState, useEffect, useMemo } from 'react';
import { RIG_SECTIONS, QUICK_PRESETS, fmt, getAllLiveProducts, byId } from '../data/products';
import {
  Check,
  ShoppingCart,
  MessageCircle,
  AlertCircle,
  Download,
  Ban,
  Sparkles,
  X,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';

export default function RigBuilder({ onAddToCart, onShowToast }) {
  const [catalogTick, setCatalogTick] = useState(0);
  const [build, setBuild] = useState({});
  const [skippedStations, setSkippedStations] = useState({});
  const [buildName, setBuildName] = useState('Custom Sim Rig');
  const [activePreset, setActivePreset] = useState(null);

  // Generate consistent daily build reference code
  const buildRef = useMemo(() => {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `SLIDE-${yy}${mm}${dd}`;
  }, []);

  // React to catalog updates in real-time
  useEffect(() => {
    const handleUpdated = () => setCatalogTick((t) => t + 1);
    window.addEventListener('slidescoiety:products-updated', handleUpdated);
    return () => window.removeEventListener('slidescoiety:products-updated', handleUpdated);
  }, []);

  // Get all live products from memory/API
  const allProducts = useMemo(() => {
    return getAllLiveProducts();
  }, [catalogTick]);

  // Group products by station
  const stationProductsMap = useMemo(() => {
    const map = {};
    RIG_SECTIONS.forEach((sec) => {
      const allowedCats = (sec.categories || [sec.title]).map((c) => c.toLowerCase());
      const prods = allProducts.filter((p) => {
        const pCat = (p.category || p.cat || '').toLowerCase().trim();
        return (
          allowedCats.includes(pCat) ||
          allowedCats.some((allowed) => pCat.includes(allowed) || allowed.includes(pCat))
        );
      });
      map[sec.id] = prods;
    });
    return map;
  }, [allProducts]);

  // Calculate selected items list
  const selectedItems = useMemo(() => {
    return Object.keys(build)
      .filter((id) => build[id])
      .map((id) => byId(id))
      .filter(Boolean);
  }, [build, catalogTick]);

  // Total build calculation
  const total = useMemo(() => {
    return selectedItems.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
  }, [selectedItems]);

  // Check if at least one foundation piece (e.g. wheelbase or cockpit) is selected
  const hasItems = selectedItems.length > 0;

  // Toggle selection for a product
  const handleToggleProduct = (sectionId, productId, multi) => {
    setActivePreset(null);
    setSkippedStations((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });

    setBuild((prev) => {
      const next = { ...prev };
      const secProds = stationProductsMap[sectionId] || [];

      if (!multi) {
        // Single selection: deselect all other items in this station
        secProds.forEach((p) => {
          if (p.id !== productId) {
            delete next[p.id];
          }
        });

        if (next[productId]) {
          delete next[productId];
        } else {
          next[productId] = true;
        }
      } else {
        // Multi selection: toggle on/off
        if (next[productId]) {
          delete next[productId];
        } else {
          next[productId] = true;
        }
      }
      return next;
    });
  };

  // Skip an optional station
  const handleSkipStation = (sectionId) => {
    setActivePreset(null);
    const secProds = stationProductsMap[sectionId] || [];
    setBuild((prev) => {
      const next = { ...prev };
      secProds.forEach((p) => {
        delete next[p.id];
      });
      return next;
    });
    setSkippedStations((prev) => ({
      ...prev,
      [sectionId]: true
    }));
  };

  // Apply a quick setup preset
  const handleApplyPreset = (preset) => {
    setActivePreset(preset.id);
    setBuildName(`${preset.name} Cockpit`);
    setSkippedStations({});

    const nextBuild = {};
    const handles = preset.productIds || [];

    allProducts.forEach((p) => {
      if (handles.some((h) => p.id === h || p.id.includes(h) || h.includes(p.id))) {
        nextBuild[p.id] = true;
      }
    });

    setBuild(nextBuild);
    onShowToast?.(`Applied ${preset.name} setup preset`);
  };

  // Add all selected items to cart
  const handleAddBuildToCart = () => {
    if (!hasItems) return;
    selectedItems.forEach((p) => onAddToCart(p.id, 1));
    onShowToast?.(`Added all ${selectedItems.length} build components to cart!`);
  };

  // Open WhatsApp with detailed inquiry
  const handleSendToRaceEngineer = () => {
    const technicianPhone = import.meta.env.VITE_WHATSAPP_NUMBER || '917902482052';

    const itemsText = selectedItems
      .map((p, idx) => `  ${idx + 1}. *${p.name}* (${p.category || p.cat}) — ${fmt(p.price)}`)
      .join('\n');

    const message = [
      `🏎️ *SLIDESCOIETY SIM RIG SPEC SHEET*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📋 *Build Ref:* ${buildRef}`,
      `🏷️ *Configuration:* ${buildName.toUpperCase()}`,
      `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🛠️ *SELECTED COMPONENTS (${selectedItems.length} items):*`,
      itemsText || '  (No components selected)',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💰 *ESTIMATED TOTAL: ${fmt(total)}*`,
      `• GST (18% included)`,
      `• Express Freight: Included for builds over ₹50,000`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💬 *Inquiry Message:*`,
      `Hi Slidescoiety Engineering Team! I have configured this custom sim setup (${buildName}) on the interactive builder. I would like to consult regarding wheelbase direct-drive torque compatibility, pedal load-cell mounting, lead times, and scheduling build dispatch.`
    ].join('\n');

    const waUrl = `https://wa.me/${technicianPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    onShowToast?.('Opening WhatsApp to connect with our sim racing engineer...');
  };

  // Download plain text configuration
  const handleExportText = () => {
    const text = [
      `SLIDESCOIETY COCKPIT CONFIGURATION: ${buildName}`,
      `Build Reference: ${buildRef}`,
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      '------------------------------------------------',
      ...selectedItems.map((p) => `${p.name} (${p.category || p.cat}) — ${fmt(p.price)}`),
      '------------------------------------------------',
      `ESTIMATED BUILD TOTAL: ${fmt(total)}`,
      '',
      'Taxes Included · Verified 100% Direct Drive Compatible.',
      'Slidescoiety Sim Racing — Precision Engineering.'
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${buildName.toLowerCase().replace(/\s+/g, '-')}-${buildRef.toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Configuration spec sheet downloaded');
  };

  return (
    <section className="py-10 sm:py-16 max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12" id="builder-section">
      {/* ======================================================== */}
      {/* HEADER: TITLE, SUBTITLE & PRESETS (Exact racesims structure) */}
      {/* ======================================================== */}
      <div className="mb-10 pb-8 border-b border-white/10">
        <p className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <span>SLIDESCOIETY</span>
          <span className="text-[#e50914] font-black">///</span>
          <span>CONFIGURATOR</span>
        </p>

        <h1 className="font-display font-black text-4xl sm:text-6xl uppercase text-white tracking-tight leading-none mb-3">
          BUILD YOUR SIM.
        </h1>

        <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mb-6 leading-relaxed">
          Pick a part from each station. Your spec sheet builds live — send it to our race engineer or add the whole build to cart.
        </p>

        {/* Quick Setups Presets */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1">
            QUICK SETUPS:
          </span>
          {QUICK_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all border ${
                  isActive
                    ? 'bg-[#e50914] text-white border-[#e50914] shadow-lg shadow-[#e50914]/30 scale-105'
                    : 'bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white border-white/15'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* Rookie Programme Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[#e50914] font-black text-sm">///</span>
            <span className="font-bold text-white uppercase tracking-wider">ROOKIE PROGRAMME</span>
            <span className="text-neutral-400 hidden md:inline">—</span>
            <span className="text-neutral-300">
              First season? Start with an all-in-one bundle, upgrade-ready as you get faster.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleApplyPreset(QUICK_PRESETS[0])}
            className="text-[#e50914] hover:underline font-mono font-bold whitespace-nowrap"
          >
            Apply Starter GT Bundle →
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN BODY: 12 SECTIONS (LEFT) + STICKY SPEC SHEET (RIGHT)  */}
      {/* ======================================================== */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: THE 12 STATIONS */}
        <div className="lg:col-span-8 space-y-8">
          {RIG_SECTIONS.map((section) => {
            const prods = stationProductsMap[section.id] || [];
            const isSkipped = !!skippedStations[section.id];

            // Count selected items in this section
            const selectedInSection = prods.filter((p) => !!build[p.id]);
            const hasSelection = selectedInSection.length > 0;

            // Compute status badge
            let badgeText = section.status;
            let badgeStyle = 'text-neutral-400 bg-white/5 border-white/10';

            if (hasSelection) {
              badgeText = section.multi ? `ADDED (${selectedInSection.length}) ✓` : 'COMPLETED ✓';
              badgeStyle = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
            } else if (isSkipped) {
              badgeText = 'SKIPPED';
              badgeStyle = 'text-neutral-500 bg-neutral-900 border-white/5 line-through';
            } else if (section.status === 'REQUIRED') {
              badgeStyle = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
            }

            return (
              <div
                key={section.id}
                id={`station-${section.id}`}
                className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20"
              >
                {/* Station Header */}
                <div className="p-4 sm:p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/40">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-black text-[#e50914]">
                      {section.num}
                    </span>
                    <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
                      {section.title}
                    </h2>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${badgeStyle}`}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Station Hint */}
                {section.hint && (
                  <div className="px-4 sm:px-6 pt-3 pb-1">
                    <p className="font-mono text-xs text-neutral-400 flex items-center gap-1.5 leading-relaxed">
                      <span>{section.hint}</span>
                    </p>
                  </div>
                )}

                {/* Product Cards Grid */}
                <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Optional station: SKIP card */}
                  {section.hasSkip && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSkipStation(section.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSkipStation(section.id); }}
                      className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center text-center transition-all min-h-[190px] select-none ${
                        isSkipped
                          ? 'border-neutral-500 bg-neutral-900/90 text-neutral-200 shadow-md'
                          : 'border-dashed border-white/20 bg-black/30 hover:border-white/40 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 text-neutral-400">
                        <Ban className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider block">
                        SKIP — NOT NEEDED
                      </span>
                      <span className="text-[10px] text-neutral-500 mt-1">
                        Leave unselected
                      </span>
                      {isSkipped && (
                        <span className="mt-2 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Station Skipped
                        </span>
                      )}
                    </div>
                  )}

                  {/* Render Hardware Products in Station */}
                  {prods.map((p) => {
                    const isSelected = !!build[p.id];
                    const isOos = !p.isAvailable || p.stockQuantity === 0;

                    return (
                      <div
                        key={p.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleToggleProduct(section.id, p.id, section.multi)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggleProduct(section.id, p.id, section.multi); }}
                        className={`relative cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all select-none group min-h-[220px] ${
                          isSelected
                            ? 'border-[#e50914] bg-[#e50914]/10 shadow-lg shadow-[#e50914]/15 ring-1 ring-[#e50914]'
                            : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60'
                        }`}
                      >
                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-md z-10">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}

                        {/* Image Container with Aspect Ratio Preservation */}
                        <div className="aspect-square w-full rounded-lg bg-black/70 border border-white/5 p-2 flex items-center justify-center overflow-hidden mb-2.5">
                          <img
                            src={p.image || p.imageUrl || '/hero-backdrop-hd.jpg'}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.src = '/hero-backdrop-hd.jpg';
                            }}
                            className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-white text-xs leading-snug line-clamp-2 mb-1 group-hover:text-neutral-100">
                              {p.name}
                            </h3>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-baseline justify-between gap-1 mt-1">
                            <span className="font-mono text-xs font-bold text-[#e50914]">
                              {fmt(p.price)}
                            </span>
                            {isOos && (
                              <span className="font-mono text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                BACKORDER
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Empty State for this Station */}
                {prods.length === 0 && (
                  <div className="p-6 text-center font-mono text-xs text-neutral-500">
                    No hardware configured in this station yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: STICKY LIVE SPEC SHEET (Exact racesims)      */}
        {/* ======================================================== */}
        <aside className="lg:col-span-4 sticky top-24 bg-[#111111] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SPEC SHEET</span>
            </div>
            <span className="font-mono text-[11px] font-bold text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {buildRef}
            </span>
          </div>

          {/* Configuration Name Input */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
              Configuration Title
            </label>
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#e50914]"
              placeholder="e.g. Apex Championship GT3"
            />
          </div>

          {/* Line Items List */}
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate text-xs">{item.name}</p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      {item.category || item.cat}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="font-mono text-white font-bold">{fmt(item.price)}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleProduct(item.sectionId || item.category, item.id, true)}
                      className="text-neutral-500 hover:text-[#e50914] p-1 transition-colors"
                      title="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-xl bg-black/30 border border-dashed border-white/10 space-y-2">
                <Sparkles className="w-5 h-5 text-neutral-500 mx-auto" />
                <p className="text-xs font-mono text-neutral-400">
                  Your custom cockpit is empty.
                </p>
                <p className="text-[11px] text-neutral-600">
                  Pick components on the left or click a Quick Setup above.
                </p>
              </div>
            )}
          </div>

          {/* Total Row */}
          <div className="pt-4 border-t border-white/10 space-y-2 font-mono">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase text-neutral-400 font-bold">TOTAL</span>
              <strong className="text-2xl font-black text-[#e50914]">
                {fmt(total)}
              </strong>
            </div>
            <p className="text-[10px] text-neutral-400 leading-tight uppercase">
              TAXES INCLUDED · EVERY BUILD IS REVIEWED BY OUR RACE ENGINEER BEFORE DISPATCH
            </p>
          </div>

          {/* Action 1: Add to Cart */}
          <button
            type="button"
            onClick={handleAddBuildToCart}
            disabled={!hasItems}
            className={`w-full py-3.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              hasItems
                ? 'bg-[#e50914] hover:bg-[#ff1f2d] text-white shadow-xl shadow-[#e50914]/30 hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>ADD BUILD TO CART ({fmt(total)})</span>
          </button>

          {/* Action 2: Send Spec to WhatsApp */}
          <button
            type="button"
            onClick={handleSendToRaceEngineer}
            disabled={!hasItems}
            className={`w-full py-3.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${
              hasItems
                ? 'bg-[#25D366] hover:bg-[#20ba59] text-black border-[#25D366] shadow-lg shadow-[#25D366]/30 hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-transparent text-neutral-600 border-neutral-800 cursor-not-allowed'
            }`}
          >
            <MessageCircle className="w-4 h-4 fill-black text-black" />
            <span>SEND SPEC TO OUR RACE ENGINEER →</span>
          </button>

          {/* Action 3: Download Spec TXT */}
          <button
            type="button"
            onClick={handleExportText}
            disabled={!hasItems}
            className="w-full py-2.5 rounded-full text-xs font-mono font-bold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD SPEC SHEET (.TXT)</span>
          </button>

          {/* Phone Consultation Assurance */}
          <div className="pt-2 text-center">
            <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <PhoneCall className="w-3 h-3 text-[#e50914]" />
              <span>OR CALL +91 7902482052 — FREE CONSULT</span>
            </p>
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* MOBILE STICKY DOCK BAR (Exact racesims mobile behavior)   */}
      {/* ======================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-md border-t border-white/15 p-4 flex items-center justify-between gap-4 shadow-2xl">
        <div>
          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block">
            TOTAL
          </span>
          <strong className="font-mono text-base font-black text-[#e50914]">
            {fmt(total)}
          </strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSendToRaceEngineer}
            disabled={!hasItems}
            className="px-3.5 py-2.5 rounded-full bg-[#25D366] text-black font-black text-xs font-mono disabled:opacity-40 flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-black" />
            <span>SPEC</span>
          </button>

          <button
            type="button"
            onClick={handleAddBuildToCart}
            disabled={!hasItems}
            className="px-5 py-2.5 rounded-full bg-[#e50914] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-40"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </section>
  );
}

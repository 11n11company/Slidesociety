import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  CreditCard,
  FileText,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Shield,
  ShieldCheck,
  UserCheck,
  Star
} from 'lucide-react';

const NAV_ITEMS = [
  { id: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { id: '/admin/products', label: 'Products', icon: Package },
  { id: '/admin/inventory', label: 'Inventory', icon: Layers },
  { id: '/admin/customers', label: 'Customers', icon: Users },
  { id: '/admin/payments', label: 'Payments', icon: CreditCard },
  { id: '/admin/invoices', label: 'Invoices', icon: FileText },
  { id: '/admin/reviews', label: 'Reviews', icon: Star }
];

export default function AdminLayout({
  currentRoute,
  onNavigate,
  currentUser,
  onLogout,
  title,
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const isSupport = currentUser?.role === 'SUPPORT';

  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f6f2] flex flex-col lg:flex-row font-sans">
      {/* ======================================================== */}
      {/* MOBILE HEADER                                            */}
      {/* ======================================================== */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0f0003] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e50914] animate-pulse" />
          <span className="font-display font-black text-lg tracking-wider text-white uppercase">
            SLIDESCOIETY <span className="text-[#e50914] text-xs font-mono font-bold tracking-widest ml-1">PIT WALL</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${
            isSupport
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {currentUser?.role || 'ADMIN'}
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE DRAWER BACKDROP                                   */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ======================================================== */}
      {/* SIDEBAR (Desktop Fixed, Mobile Slide-out Drawer)         */}
      {/* ======================================================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-64 bg-[#0a0002] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-screen`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e50914] shadow-md shadow-[#e50914]/50" />
              <div>
                <h1 className="font-display font-black text-xl tracking-tight uppercase text-white leading-none">
                  SLIDESCOIETY
                </h1>
                <span className="font-mono text-[10px] font-bold text-[#e50914] tracking-widest uppercase">
                  MANAGEMENT CONSOLE
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-lg text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items (The 7 strictly required links) */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/20 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Storefront Link, Admin Profile & Sign Out */}
        <div className="p-4 border-t border-white/10 bg-[#070001] space-y-3">
          {/* Back to Storefront Link */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white truncate">
                  {currentUser?.fullName || 'Administrator'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400 truncate">
                {currentUser?.email || 'admin@slidescoiety.com'}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase shrink-0 border ${
              isSupport
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}>
              {currentUser?.role || 'ADMIN'}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT                                            */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Compact Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-[#0a0002]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#e50914]" />
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Logged in as:</span>
              <span className="font-bold text-white">{currentUser?.fullName || currentUser?.email}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                isSupport
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                {currentUser?.role}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 border border-white/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

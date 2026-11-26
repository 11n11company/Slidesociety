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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row font-sans">
      {/* ======================================================== */}
      {/* MOBILE HEADER                                            */}
      {/* ======================================================== */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e50914] animate-pulse" />
          <span className="font-bold text-base tracking-tight text-slate-900">
            SLIDESCOIETY <span className="text-[#e50914] text-xs font-semibold ml-1">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border bg-emerald-50 text-emerald-700 border-emerald-200">
            {currentUser?.role || 'ADMIN'}
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ======================================================== */}
      {/* SIDEBAR (Desktop Fixed, Mobile Slide-out Drawer)         */}
      {/* ======================================================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-screen`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e50914] shadow-md shadow-[#e50914]/40" />
              <div>
                <h1 className="font-bold text-lg tracking-tight uppercase text-slate-900 leading-none">
                  SLIDESCOIETY
                </h1>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mt-1">
                  Management Console
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700"
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Storefront Link, Admin Profile & Sign Out */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          {/* Back to Storefront Link */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 truncate">
                  {currentUser?.fullName || 'Administrator'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {currentUser?.email || 'admin@slidescoiety.com'}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase shrink-0 border bg-emerald-50 text-emerald-700 border-emerald-200">
              {currentUser?.role || 'ADMIN'}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
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
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
            <h2 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Logged in as:</span>
              <span className="font-semibold text-slate-900">{currentUser?.fullName || currentUser?.email}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border bg-emerald-50 text-emerald-700 border-emerald-200">
                {currentUser?.role || 'ADMIN'}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
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

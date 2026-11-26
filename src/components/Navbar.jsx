import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingCart, User, ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
  currentUser,
  wishlistCount,
  onOpenWishlist
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopDropdown, setShopDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = currentView === 'home' && !scrolled;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop', hasDropdown: true },
    { id: 'cockpits', label: 'Cockpits', category: 'Cockpit frames' },
    { id: 'accessories', label: 'Accessories', category: 'Accessories' },
    { id: 'bundles', label: 'Bundles', category: 'Bundles' },
    { id: 'builder', label: 'Build My Setup' }
  ];

  const handleNavClick = (link) => {
    if (link.category) {
      onNavigate('shop', link.category);
    } else {
      onNavigate(link.id);
    }
    setMobileOpen(false);
    setShopDropdown(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-[#080002]/90 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/40'
      }`}
    >
      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-[70px] flex items-center justify-between gap-6">
        
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="shrink-0 flex items-center py-1 transition-opacity hover:opacity-90 focus:outline-none"
          aria-label="Slidescoiety Sim Racing Store"
        >
          <img
            src="/slidescoiety-logo-hd.png"
            alt="Slidescoiety SIM RACING STORE"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </button>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <div key={link.id} className="relative group">
              <button
                type="button"
                onClick={() => handleNavClick(link)}
                className={`text-xs font-semibold tracking-wide transition-colors flex items-center gap-1 py-2 ${
                  currentView === link.id
                    ? 'text-white'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {link.hasDropdown && (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
                )}
              </button>

              {/* Shop Sub-dropdown */}
              {link.hasDropdown && (
                <div className="absolute top-full left-0 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                  <div className="bg-[#121212] border border-white/10 rounded-xl p-2 min-w-[200px] shadow-2xl backdrop-blur-xl space-y-1">
                    <button
                      type="button"
                      onClick={() => { onNavigate('shop', 'All'); setShopDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Shop All Products
                    </button>
                    <button
                      type="button"
                      onClick={() => { onNavigate('shop', 'Cockpit frames'); setShopDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Cockpit Frames & Chassis
                    </button>
                    <button
                      type="button"
                      onClick={() => { onNavigate('shop', 'Racing seats'); setShopDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Bucket Racing Seats
                    </button>
                    <button
                      type="button"
                      onClick={() => { onNavigate('shop', 'Wheel bases'); setShopDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Direct Drive Wheelbases
                    </button>
                    <button
                      type="button"
                      onClick={() => { onNavigate('shop', 'Pedals'); setShopDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Hydraulic Load-Cell Pedals
                    </button>
                    <button
                      type="button"
                      onClick={() => { onNavigate('shop', 'Bundles'); setShopDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border-t border-white/10 pt-2"
                    >
                      Turn-Key Bundles
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Utility Buttons (Search, Wishlist, Cart, Account) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="text-neutral-300 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5"
            aria-label="Search demo gear"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={onOpenWishlist}
            className="text-neutral-300 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5 relative"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e50914] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button with Red Badge */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative text-neutral-300 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5"
            aria-label="Open Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="absolute -top-1 -right-1 bg-[#e50914] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-md shadow-[#e50914]/50">
              {cartCount}
            </span>
          </button>

          {/* Account Pill Button */}
          <button
            type="button"
            onClick={onOpenAccount}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
              currentUser
                ? 'border-[#e50914]/40 bg-[#e50914]/10 text-white hover:bg-[#e50914]/20'
                : 'border-white/20 hover:border-white/50 text-white hover:bg-white/5'
            }`}
          >
            <User className={`w-3.5 h-3.5 ${currentUser ? 'text-[#e50914]' : 'text-neutral-300'}`} />
            <span>{currentUser ? currentUser.fullName.split(' ')[0] : 'Account'}</span>
            {currentUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />}
          </button>

          {/* Admin Management Link for ADMIN personnel */}
          {currentUser && currentUser.role === 'ADMIN' && (
            <button
              type="button"
              onClick={() => {
                window.history.pushState(null, '', '/admin/dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e50914]/15 hover:bg-[#e50914] text-white border border-[#e50914]/40 text-xs font-mono font-bold uppercase tracking-wider transition-all"
              title="Open Management Console"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
              <span>Admin</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-1.5"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden px-6 py-6 bg-[#0c0003] border-t border-white/10 space-y-4">
          <button
            type="button"
            onClick={() => { onNavigate('home'); setMobileOpen(false); }}
            className="block w-full text-left text-white font-bold text-sm py-2"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => { onNavigate('shop'); setMobileOpen(false); }}
            className="block w-full text-left text-neutral-300 font-medium text-sm py-2"
          >
            Shop All Products
          </button>
          <button
            type="button"
            onClick={() => { onNavigate('shop', 'Cockpit frames'); setMobileOpen(false); }}
            className="block w-full text-left text-neutral-300 font-medium text-sm py-2"
          >
            Cockpits & Chassis
          </button>
          <button
            type="button"
            onClick={() => { onNavigate('shop', 'Accessories'); setMobileOpen(false); }}
            className="block w-full text-left text-neutral-300 font-medium text-sm py-2"
          >
            Accessories & Mounts
          </button>
          <button
            type="button"
            onClick={() => { onNavigate('builder'); setMobileOpen(false); }}
            className="block w-full text-left text-neutral-300 font-medium text-sm py-2"
          >
            Build My Setup
          </button>
          <button
            type="button"
            onClick={() => { onOpenAccount(); setMobileOpen(false); }}
            className={`inline-flex items-center gap-2 text-white font-bold text-xs py-2 px-4 rounded-full border mt-2 ${
              currentUser ? 'border-[#e50914] bg-[#e50914]/20' : 'border-white/20'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{currentUser ? currentUser.fullName : 'Driver Account'}</span>
          </button>
        </div>
      )}
    </header>
  );
}


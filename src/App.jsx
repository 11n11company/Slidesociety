import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedGrid from './components/FeaturedGrid';
import RigBuilder from './components/RigBuilder';
import CartDrawer from './components/CartDrawer';
import WatchSetupModal from './components/WatchSetupModal';
import AccountModal from './components/AccountModal';
import ProductDetailModal from './components/ProductDetailModal';
import Footer from './components/Footer';
import { products, byId } from './data/products';
import { authApi } from './services/authApi';
import { wishlistApi } from './services/wishlistApi';

// Code-split Admin Dashboard to reduce initial storefront bundle size
const AdminApp = React.lazy(() => import('./admin/AdminApp'));

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [adminMode, setAdminMode] = useState(() => window.location.pathname.startsWith('/admin'));
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({ 'frame-x': 1, 'pedals-pro': 1 }); // 2 items as in mockup
  const [wishlist, setWishlist] = useState(['wheel']);
  const [cartOpen, setCartOpen] = useState(false);
  const [watchSetupOpen, setWatchSetupOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountInitialTab, setAccountInitialTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProductDetailId, setSelectedProductDetailId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Synchronize admin routing with browser URL and history
  useEffect(() => {
    const handlePopState = () => {
      setAdminMode(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check existing session on mount & sync wishlist
  useEffect(() => {
    authApi.getMe().then((user) => {
      if (user) {
        setCurrentUser(user);
        wishlistApi
          .getWishlist()
          .then((res) => {
            if (res?.data && Array.isArray(res.data)) {
              const ids = res.data.map((item) => item.productId || item.product?.id).filter(Boolean);
              setWishlist(ids);
            }
          })
          .catch((err) => console.warn('Wishlist initial sync error:', err));
      }
    });
  }, []);

  // Show Toast notification helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2600);
  };

  // Handle successful login or registration with guest cart & wishlist preservation
  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    // Preserve & merge guest cart into customer account in PostgreSQL
    if (cart && Object.keys(cart).length > 0) {
      try {
        const res = await authApi.mergeCart(cart);
        if (res?.data?.cartMap) {
          setCart(res.data.cartMap);
        }
      } catch (err) {
        console.warn('Cart synchronization error:', err);
      }
    }

    // Preserve & merge guest wishlist into customer account in PostgreSQL
    if (wishlist && wishlist.length > 0) {
      try {
        const wRes = await wishlistApi.mergeWishlist(wishlist);
        if (wRes?.data?.items && Array.isArray(wRes.data.items)) {
          const ids = wRes.data.items.map((it) => it.productId || it.product?.id).filter(Boolean);
          setWishlist(ids);
        }
      } catch (err) {
        console.warn('Wishlist merge error:', err);
      }
    } else {
      try {
        const wRes = await wishlistApi.getWishlist();
        if (wRes?.data && Array.isArray(wRes.data)) {
          const ids = wRes.data.map((it) => it.productId || it.product?.id).filter(Boolean);
          setWishlist(ids);
        }
      } catch (err) {
        console.warn('Wishlist sync error:', err);
      }
    }
  };

  // Handle successful logout
  const handleLogoutSuccess = () => {
    setCurrentUser(null);
    setWishlist([]);
  };

  // Navigation router
  const handleNavigate = useCallback((view, category = 'All') => {
    setCurrentView(view);
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Add to cart
  const handleAddToCart = useCallback((id, qty = 1) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + qty
    }));
    const item = byId(id);
    showToast(`${item ? item.name : 'Item'} added to cart`);
  }, []);

  // Update cart quantity
  const handleUpdateQty = useCallback((id, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      const newQty = (next[id] || 0) + delta;
      if (newQty <= 0) {
        delete next[id];
      } else {
        next[id] = newQty;
      }
      return next;
    });
  }, []);

  // Toggle wishlist (with backend sync for authenticated drivers)
  const handleToggleWishlist = async (id) => {
    const exists = wishlist.includes(id);
    const next = exists ? wishlist.filter((x) => x !== id) : [...wishlist, id];
    setWishlist(next);
    showToast(exists ? 'Removed from wishlist' : 'Added to wishlist');

    if (currentUser) {
      try {
        if (exists) {
          await wishlistApi.removeFromWishlist(id);
        } else {
          await wishlistApi.addToWishlist(id);
        }
      } catch (err) {
        console.warn('Wishlist backend sync error:', err);
      }
    }
  };

  const cartTotalCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // If URL route is under /admin, render dedicated Admin Application
  if (adminMode) {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#070707] flex items-center justify-center text-neutral-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#e50914] animate-ping mr-3" />
            Loading Control Panel...
          </div>
        }
      >
        <AdminApp
          onExitAdmin={() => {
            window.history.pushState(null, '', '/');
            setAdminMode(false);
            setCurrentView('home');
          }}
        />
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f6f2] flex flex-col font-sans overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartTotalCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => {
          handleNavigate('shop');
        }}
        onOpenAccount={() => {
          setAccountInitialTab('profile');
          setAccountOpen(true);
        }}
        currentUser={currentUser}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => {
          setAccountInitialTab('wishlist');
          setAccountOpen(true);
        }}
      />

      {/* Main View Router */}
      <main className={`flex-1 ${currentView !== 'home' ? 'pt-16 sm:pt-[70px]' : ''}`}>
        {currentView === 'home' && (
          <>
            {/* The HD Crystal-Clear Exact Reference Hero */}
            <Hero
              onBuildClick={() => handleNavigate('builder')}
              onWatchSetupClick={() => setWatchSetupOpen(true)}
              onShowToast={showToast}
            />

            {/* Featured Hardware Grid */}
            <FeaturedGrid
              onAddToCart={handleAddToCart}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onOpenDetail={(id) => {
                setSelectedProductDetailId(id);
              }}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onNavigateToShop={() => handleNavigate('shop')}
              isFullShop={false}
            />

            {/* Three Foundation Callout Cards */}
            <section className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 py-12 grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 hover:border-[#e50914] transition-all group">
                <span className="font-mono text-[10px] text-[#e50914] font-bold uppercase tracking-widest block mb-3">
                  01 // CHASSIS FOUNDATION
                </span>
                <h3 className="font-display font-black text-2xl uppercase text-white mb-2">
                  Extruded Aluminum Rig
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Ultra-rigid 8040 & 16040 profiles designed to absorb 35Nm of direct drive torque with zero deflection.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 hover:border-[#e50914] transition-all group">
                <span className="font-mono text-[10px] text-[#e50914] font-bold uppercase tracking-widest block mb-3">
                  02 // DIRECT DRIVE COUPLING
                </span>
                <h3 className="font-display font-black text-2xl uppercase text-white mb-2">
                  True 1:1 Force Feedback
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Universal motor deck gussets engineered for Fanatec DD, Simucube 2, Asetek, and Moza wheelbases.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 hover:border-[#e50914] transition-all group">
                <span className="font-mono text-[10px] text-[#e50914] font-bold uppercase tracking-widest block mb-3">
                  03 // LOAD-CELL RIGIDITY
                </span>
                <h3 className="font-display font-black text-2xl uppercase text-white mb-2">
                  200KG Pedal Resistance
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Slotted steel heel plate and reinforced angle brackets guarantee zero flex during emergency threshold braking.
                </p>
              </div>
            </section>
          </>
        )}

        {currentView === 'shop' && (
          <FeaturedGrid
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onOpenDetail={(id) => {
              setSelectedProductDetailId(id);
            }}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onNavigateToShop={() => {}}
            isFullShop={true}
          />
        )}

        {currentView === 'builder' && (
          <RigBuilder
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onClearCart={() => setCart({})}
        onShowToast={showToast}
        currentUser={currentUser}
        onOpenAccount={() => {
          setAccountInitialTab('login');
          setAccountOpen(true);
        }}
        onViewOrders={() => {
          setAccountInitialTab('orders');
          setAccountOpen(true);
        }}
      />

      <WatchSetupModal
        isOpen={watchSetupOpen}
        onClose={() => setWatchSetupOpen(false)}
        onGoToBuilder={() => handleNavigate('builder')}
      />

      <AccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        onShowToast={showToast}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        onLogoutSuccess={handleLogoutSuccess}
        initialTab={accountInitialTab}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onNavigateToShop={() => handleNavigate('shop')}
      />

      <ProductDetailModal
        productId={selectedProductDetailId}
        isOpen={Boolean(selectedProductDetailId)}
        onClose={() => setSelectedProductDetailId(null)}
        currentUser={currentUser}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onOpenAccount={() => {
          setAccountInitialTab('login');
          setAccountOpen(true);
        }}
        onShowToast={showToast}
      />

      {/* Toast Notification Pill */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-[#e50914] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-2xl shadow-black transition-all duration-300 pointer-events-none ${
          toastVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
        }`}
        role="status"
      >
        {toastMessage}
      </div>
    </div>
  );
}


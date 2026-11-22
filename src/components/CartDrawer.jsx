import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Truck,
  AlertCircle,
  Loader2,
  Package,
  User,
  ShieldCheck,
  CreditCard,
  QrCode,
  RotateCcw,
  MessageCircle,
  Lock,
  Mail
} from 'lucide-react';
import { byId, fmt } from '../data/products';
import { orderApi } from '../services/orderApi';
import { paymentApi } from '../services/paymentApi';
import { authApi } from '../services/authApi';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onClearCart,
  onShowToast,
  currentUser,
  onAuthSuccess,
  onOpenAccount,
  onViewOrders
}) {
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'payment' | 'confirmation' | 'whatsapp_confirmation'
  const [loading, setLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentDismissed, setPaymentDismissed] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [whatsappOrder, setWhatsappOrder] = useState(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [, setCatalogTick] = useState(0);

  // React to catalog updates in real-time
  React.useEffect(() => {
    const handleUpdated = () => setCatalogTick((t) => t + 1);
    window.addEventListener('slidescoiety:products-updated', handleUpdated);
    return () => window.removeEventListener('slidescoiety:products-updated', handleUpdated);
  }, []);

  // Guest Account Creation Fields
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');

  // Address form fields
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetLine1, setStreetLine1] = useState('');
  const [streetLine2, setStreetLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [customerNotes, setCustomerNotes] = useState('');

  // Reset drawer state on close
  const handleClose = () => {
    setStep('cart');
    setError('');
    setPaymentDismissed(false);
    setWhatsappOrder(null);
    setWhatsappUrl('');
    onClose();
  };

  // Escape key and body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const items = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const product = byId(id);
      return product ? { ...product, qty } : null;
    })
    .filter(Boolean);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = items.length > 0 ? (subtotal >= 50000 ? 0 : 1500) : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  // Pre-fill user data when navigating to checkout
  const handleProceedToCheckout = () => {
    if (currentUser) {
      if (!recipientName && currentUser.fullName) {
        setRecipientName(currentUser.fullName);
      }
      if (!accountEmail && currentUser.email) {
        setAccountEmail(currentUser.email);
      }
      if (!phone && currentUser.phone) {
        setPhone(currentUser.phone);
      }
    }
    setError('');
    setStep('checkout');
  };

  // Helper to ensure driver account exists or is created on-the-fly
  const ensureDriverAccount = async () => {
    if (currentUser) return currentUser;

    if (!accountEmail || !accountPassword) {
      throw new Error('Please enter your email and choose a password to create your Slidescoiety Driver Account.');
    }

    if (accountPassword.length < 8 || !/[A-Za-z]/.test(accountPassword) || !/[0-9]/.test(accountPassword)) {
      throw new Error('Account password must be at least 8 characters long and contain both letters and numbers.');
    }

    try {
      const regRes = await authApi.register({
        fullName: recipientName || 'Sim Racer',
        email: accountEmail.trim().toLowerCase(),
        password: accountPassword,
        confirmPassword: accountPassword
      });
      const newUser = regRes?.data?.user;
      onAuthSuccess?.(newUser);
      return newUser;
    } catch (err) {
      if (err.code === 'EMAIL_ALREADY_EXISTS') {
        try {
          const logRes = await authApi.login({
            email: accountEmail.trim().toLowerCase(),
            password: accountPassword
          });
          const loggedUser = logRes?.data?.user;
          onAuthSuccess?.(loggedUser);
          return loggedUser;
        } catch (loginErr) {
          throw new Error('An account with this email already exists. Please verify your password or sign in first.');
        }
      }
      throw err;
    }
  };

  // WhatsApp Checkout Handler: Registers Driver & Order in Database, then opens WhatsApp with full build details
  const handleWhatsAppCheckout = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!recipientName || recipientName.trim().length < 2) {
        throw new Error('Please enter your full name.');
      }
      if (!phone || phone.trim().length < 7) {
        throw new Error('Please enter a valid contact phone number.');
      }
      if (!streetLine1 || streetLine1.trim().length < 3) {
        throw new Error('Please enter your street address.');
      }
      if (!city || city.trim().length < 2) {
        throw new Error('Please enter your city.');
      }
      if (!state || state.trim().length < 2) {
        throw new Error('Please enter your state.');
      }
      if (!postalCode || postalCode.trim().length < 3) {
        throw new Error('Please enter your PIN code.');
      }

      // 1. Ensure driver account is created or active
      const user = await ensureDriverAccount();

      // 2. Register order in database
      const idempotencyKey = `idemp_wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const payload = {
        shippingAddress: {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          streetLine1: streetLine1.trim(),
          streetLine2: streetLine2 ? streetLine2.trim() : undefined,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country || 'India'
        },
        customerNotes: customerNotes
          ? `[WhatsApp Build Consultation] ${customerNotes.trim()}`
          : '[WhatsApp Build Consultation] Driver requested professional consultation for custom rig configuration.',
        idempotencyKey
      };

      const res = await orderApi.createOrder(payload);
      const newOrder = res.data.order;
      setPlacedOrder(newOrder);
      setWhatsappOrder(newOrder);
      onClearCart?.();

      // 3. Compile rich formatted WhatsApp message
      const technicianPhone = import.meta.env.VITE_WHATSAPP_NUMBER || '917902482052';
      const itemsListText = items.map((it, idx) => `  ${idx + 1}. *${it.name}* (x${it.qty}) — ${fmt(it.price * it.qty)}`).join('\n');

      const waMessage = [
        `🏎️ *SLIDESCOIETY SIM RACING — CUSTOM BUILD INQUIRY*`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📋 *Order Reference:* #${newOrder.orderNumber}`,
        `👤 *Driver Name:* ${recipientName.trim()}`,
        `📞 *Contact Phone:* ${phone.trim()}`,
        `📧 *Driver Email:* ${user.email || accountEmail}`,
        `📍 *Delivery Location:* ${city.trim()}, ${state.trim()} - ${postalCode.trim()}, ${country || 'India'}`,
        `🏠 *Street Address:* ${streetLine1.trim()}${streetLine2 ? ', ' + streetLine2.trim() : ''}`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `🛠️ *CONFIGURED RIG COMPONENTS (${items.length} items):*`,
        itemsListText,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `💰 *PRICING SUMMARY:*`,
        `• Subtotal: ${fmt(subtotal)}`,
        `• GST (18% included): ${fmt(tax)}`,
        `• Express Logistics: ${shipping === 0 ? 'FREE' : fmt(shipping)}`,
        `• *Grand Total: ${fmt(total)}*`,
        customerNotes ? `\n📝 *Driver Notes / Rig Specs:*\n"${customerNotes.trim()}"` : '',
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `💬 *Inquiry Message:*`,
        `Hi Slidescoiety Engineering Team! I have configured my custom sim racing setup and registered Order #${newOrder.orderNumber} on the store. I would like to consult with a technician to finalize the build process, verify wheelbase torque compatibility, and schedule dispatch.`
      ].filter(Boolean).join('\n');

      const fullWaUrl = `https://wa.me/${technicianPhone}?text=${encodeURIComponent(waMessage)}`;
      setWhatsappUrl(fullWaUrl);

      // 4. Open WhatsApp
      window.open(fullWaUrl, '_blank');

      // 5. Transition drawer to WhatsApp confirmation view
      setStep('whatsapp_confirmation');
      onShowToast?.(`Order ${newOrder.orderNumber} registered! Opening WhatsApp...`);
    } catch (err) {
      setError(err.message || 'Failed to initialize WhatsApp consultation. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Place Order handler with idempotency and backend price validation
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ensure driver account is created or active
      const user = await ensureDriverAccount();

      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const payload = {
        shippingAddress: {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          streetLine1: streetLine1.trim(),
          streetLine2: streetLine2 ? streetLine2.trim() : undefined,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country || 'India'
        },
        customerNotes,
        idempotencyKey
      };

      const res = await orderApi.createOrder(payload);
      const newOrder = res.data.order;

      setPlacedOrder(newOrder);
      onClearCart?.();
      setStep('payment');
      onShowToast?.(`Order ${newOrder.orderNumber} registered. Complete payment below.`);

      // Automatically trigger payment modal
      initiateRazorpayPayment(newOrder);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please review your shipping details and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Razorpay Checkout Launcher
  const initiateRazorpayPayment = async (orderToPay = placedOrder) => {
    if (!orderToPay) return;
    setError('');
    setLoading(true);
    setPaymentDismissed(false);

    try {
      // 1. Create Razorpay Payment Order on Backend
      const payRes = await paymentApi.createPayment(orderToPay.id);
      const checkoutData = payRes.data;

      if (checkoutData.qrCode) {
        setQrCodeData(checkoutData.qrCode);
      }

      // 2. Load Razorpay Checkout Script
      const scriptLoaded = await paymentApi.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay payment gateway. Please check your internet connection and retry.');
      }

      // 3. Configure Razorpay Modal Options
      const options = {
        key: checkoutData.keyId,
        amount: checkoutData.amountPaise,
        currency: checkoutData.currency,
        name: 'Slidescoiety Sim Racing Store',
        description: `Order ${checkoutData.orderNumber}`,
        order_id: checkoutData.razorpayOrderId,
        prefill: {
          name: checkoutData.customer?.name || currentUser?.fullName || '',
          email: checkoutData.customer?.email || currentUser?.email || '',
          contact: checkoutData.customer?.phone || ''
        },
        theme: {
          color: '#e50914',
          backdrop_color: 'rgba(0,0,0,0.85)'
        },
        handler: async function (response) {
          try {
            setVerifyingPayment(true);
            const verifyRes = await paymentApi.verifyPayment({
              orderId: orderToPay.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            setPaymentInfo(verifyRes.data.payment);
            setPlacedOrder(verifyRes.data.order);
            setStep('confirmation');
            onShowToast?.(`Payment verified! Order ${orderToPay.orderNumber} confirmed.`);
          } catch (verifyErr) {
            setError(verifyErr.message || 'Cryptographic signature verification failed.');
          } finally {
            setVerifyingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentDismissed(true);
            onShowToast?.('Payment modal dismissed. You can retry payment anytime.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        setError(resp.error?.description || 'Payment was declined or cancelled.');
        setPaymentDismissed(true);
      });
      razorpayInstance.open();
    } catch (err) {
      setError(err.message || 'Payment initiation failed. Please retry.');
      setPaymentDismissed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
        className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-[#0f0003] border-l border-white/10 shadow-2xl flex flex-col z-10"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'whatsapp_confirmation' && (
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors mr-1"
                aria-label="Back to Store"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors mr-1"
                aria-label="Back to Cart"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <ShoppingBag className="w-5 h-5 text-[#e50914]" />
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              {step === 'confirmation'
                ? 'Order Confirmed & Paid'
                : step === 'whatsapp_confirmation'
                ? 'Technician Consultation'
                : step === 'payment'
                ? 'Payment & Gateway'
                : step === 'checkout'
                ? 'Checkout & Delivery'
                : `Your Cart (${items.reduce((sum, it) => sum + it.qty, 0)})`}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: CART ITEMS VIEW                                  */}
        {/* ======================================================== */}
        {step === 'cart' && (
          <>
            {/* Cart Item Lines */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-20 text-neutral-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto text-neutral-600" />
                  <p className="font-bold text-white text-base">Your cart is empty</p>
                  <p className="text-xs">Explore the hardware collection and build your setup.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-xl bg-black/40 border border-white/5"
                  >
                    <img
                      src={item.image || item.imageUrl || '/hero-backdrop-hd.jpg'}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.currentTarget.src = '/hero-backdrop-hd.jpg'; }}
                      className="w-16 h-16 object-contain object-center rounded-lg bg-black shrink-0 border border-white/10 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{item.name}</h4>
                      <div className="text-xs font-mono text-[#e50914] font-bold mt-1">
                        {fmt(item.price * item.qty)}
                      </div>

                      {/* Quantity adjustment */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-white/15 rounded-lg bg-black/60">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="p-1.5 text-neutral-300 hover:text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold font-mono text-white">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="p-1.5 text-neutral-300 hover:text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, -item.qty)}
                          className="text-neutral-400 hover:text-[#e50914] transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout Trigger */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-white/10 bg-black/60 space-y-4">
                <div className="space-y-1.5 text-xs text-neutral-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-white">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18% included)</span>
                    <span className="font-mono text-white">{fmt(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-mono text-white">
                      {shipping === 0 ? 'FREE (over ₹50,000)' : fmt(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                    <span>Total</span>
                    <span className="font-mono text-base text-[#e50914]">{fmt(total)}</span>
                  </div>
                </div>

                {!currentUser && (
                  <div className="p-3 rounded-xl bg-neutral-900 border border-white/10 text-xs text-neutral-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#e50914] shrink-0" />
                    <span>Your Driver Account will be created on checkout for build tracking.</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#e50914]/30 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Delivery & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* STEP 2: CHECKOUT & DELIVERY ADDRESS FORM                 */}
        {/* ======================================================== */}
        {step === 'checkout' && (
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Consultation & Gateway Info Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                  <span className="text-white">Custom Build Support & Finalization</span>
                </div>
                <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                  Finalize your order directly with our technician on WhatsApp or pay online with instant payment via Razorpay.
                </p>
              </div>

              {/* Driver Account Information */}
              {currentUser ? (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e50914]/20 border border-[#e50914]/40 flex items-center justify-center text-[#e50914]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{currentUser.fullName}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">{currentUser.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Active Driver
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#181818] to-black border border-[#e50914]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                      <User className="w-4 h-4 text-[#e50914]" />
                      <span>Driver Account Setup</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Auto-Registered
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Enter your email and create a password to set up your Slidescoiety Driver Account so this build, orders, and technician updates are saved directly to your profile.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                        Driver Email *
                      </label>
                      <input
                        type="email"
                        required={!currentUser}
                        value={accountEmail}
                        onChange={(e) => setAccountEmail(e.target.value)}
                        placeholder="driver@example.com"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                        Create Password *
                      </label>
                      <input
                        type="password"
                        required={!currentUser}
                        minLength={8}
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        placeholder="8+ letters & numbers"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                  <MapPin className="w-4 h-4 text-[#e50914]" />
                  <span>Shipping Address</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Max Verstappen"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={streetLine1}
                      onChange={(e) => setStreetLine1(e.target.value)}
                      placeholder="House / Flat / Street address"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      Apartment / Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={streetLine2}
                      onChange={(e) => setStreetLine2(e.target.value)}
                      placeholder="Suite, unit, building, floor, etc."
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bengaluru"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Karnataka"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="560001"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Delivery Instructions / Rig Notes
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Call before delivery, freight elevator available"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>
            </div>

            {/* Checkout Footer */}
            <div className="p-6 border-t border-white/10 bg-black/60 space-y-4">
              <div className="space-y-1 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-mono font-bold text-white">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% included)</span>
                  <span className="font-mono text-white">{fmt(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Logistics</span>
                  <span className="font-mono text-white">
                    {shipping === 0 ? 'FREE (over ₹50,000)' : fmt(shipping)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                  <span>Grand Total</span>
                  <span className="font-mono text-base text-[#e50914]">{fmt(total)}</span>
                </div>
              </div>

              {/* Primary: WhatsApp Consultation & Finalization Button */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#25D366]/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Registering Build & Connecting to WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 text-black fill-black" />
                    <span>Consult Technician & Finalize via WhatsApp</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] font-mono uppercase text-neutral-400">or pay directly online</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Secondary: Direct Razorpay Checkout */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-[#e50914]" />
                    <span>Confirm Order & Pay with Razorpay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* STEP 3: PAYMENT SCREEN & RETRY OPTIONS                   */}
        {/* ======================================================== */}
        {step === 'payment' && placedOrder && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-center">
            <div className="pt-6 space-y-2">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <CreditCard className="w-7 h-7" />
              </div>
              <h4 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                Payment Pending
              </h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Order <strong className="text-white">{placedOrder.orderNumber}</strong> has been created. Complete payment via Razorpay to initiate fabrication.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {verifyingPayment && (
              <div className="p-4 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs text-blue-200 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span>Verifying cryptographic signature with payment gateway...</span>
              </div>
            )}

            {/* Order Price Overview */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Order Number</span>
                <span className="text-white font-bold">{placedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Payable Amount</span>
                <span className="text-[#e50914] font-bold text-base">
                  {fmt(Number(placedOrder.totalAmount))}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-neutral-500">
                <span>Payment Gateway</span>
                <span>Razorpay (Cards, UPI, QR, Netbanking)</span>
              </div>
            </div>

            {/* Dynamic UPI QR display (if returned by account) */}
            {qrCodeData?.image_url && (
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase text-white">
                  <QrCode className="w-4 h-4 text-[#e50914]" />
                  <span>Scan Dynamic UPI QR</span>
                </div>
                <img
                  src={qrCodeData.image_url}
                  alt="Razorpay Dynamic UPI QR"
                  className="w-44 h-44 mx-auto rounded-xl border border-white/20 p-2 bg-white"
                />
                <p className="text-[11px] text-neutral-400">
                  Scan using Google Pay, PhonePe, Paytm or any UPI app.
                </p>
              </div>
            )}

            {/* Payment Actions */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => initiateRazorpayPayment(placedOrder)}
                disabled={loading || verifyingPayment}
                className="w-full py-3.5 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#e50914]/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening Gateway...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>{paymentDismissed ? 'Retry Payment Now' : 'Pay Now via Razorpay'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onViewOrders?.();
                }}
                className="w-full py-3 rounded-full text-xs font-bold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
              >
                Pay Later (Saved in My Orders)
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: ORDER CONFIRMATION & PAID SCREEN                 */}
        {/* ======================================================== */}
        {step === 'confirmation' && placedOrder && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-center">
            <div className="pt-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                Payment Verified & Order Confirmed!
              </h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Payment received via Razorpay. Your sim racing cockpit is officially queued for fabrication and assembly.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="text-neutral-400">Order Number</span>
                <span className="text-[#e50914] font-bold text-sm">{placedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {placedOrder.status}
                </span>
              </div>
              {paymentInfo?.providerPaymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Payment ID</span>
                  <span className="text-emerald-400 font-mono text-[11px] truncate max-w-[200px]">
                    {paymentInfo.providerPaymentId}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Amount Paid</span>
                <span className="text-white font-bold">{fmt(Number(placedOrder.totalAmount))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Components</span>
                <span className="text-white">{placedOrder.items?.length || 0} Units</span>
              </div>
            </div>

            {/* Items summary */}
            {placedOrder.items && placedOrder.items.length > 0 && (
              <div className="text-left space-y-2">
                <p className="text-[11px] font-mono uppercase text-neutral-400">Hardware Breakdown</p>
                <div className="space-y-2">
                  {placedOrder.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs"
                    >
                      <div className="truncate mr-2">
                        <p className="font-bold text-white truncate">{it.productName}</p>
                        <p className="text-[10px] text-neutral-400">Qty: {it.quantity}</p>
                      </div>
                      <span className="font-mono text-[#e50914] shrink-0">
                        {fmt(Number(it.unitPrice) * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onViewOrders?.();
                }}
                className="w-full py-3.5 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#e50914]/30 flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>View in My Orders</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-full text-xs font-bold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
              >
                Continue Exploring Cockpits
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 5: WHATSAPP CONSULTATION CONFIRMATION               */}
        {/* ======================================================== */}
        {step === 'whatsapp_confirmation' && whatsappOrder && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-center">
            <div className="pt-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center mx-auto text-[#25D366]">
                <MessageCircle className="w-8 h-8 fill-[#25D366]" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-xs font-mono font-bold uppercase tracking-wider">
                WhatsApp Consultation Opened
              </div>
              <h4 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                Order #{whatsappOrder.orderNumber} Registered!
              </h4>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                Your custom sim racing rig configuration has been saved to your Slidescoiety Driver Account. All hardware specifications have been prepared for our technician on WhatsApp.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="text-neutral-400">Order Reference</span>
                <span className="text-[#e50914] font-bold text-sm">{whatsappOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Driver</span>
                <span className="text-white font-bold">{recipientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Phone</span>
                <span className="text-white">{phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Destination</span>
                <span className="text-white">{city}, {state} ({postalCode})</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold">
                <span className="text-neutral-300">Grand Total</span>
                <span className="text-white text-sm text-[#e50914]">{fmt(total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>Re-Open WhatsApp Chat</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onViewOrders?.();
                }}
                className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/15 flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>View Order in My Account</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

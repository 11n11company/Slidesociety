import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  LogOut,
  Sparkles,
  ArrowRight,
  Package,
  Clock,
  MapPin,
  ChevronRight,
  ArrowLeft,
  XCircle,
  Loader2,
  Calendar,
  FileText,
  CreditCard,
  RotateCcw,
  Download,
  Send,
  Truck,
  ExternalLink
} from 'lucide-react';
import { authApi } from '../services/authApi';
import { orderApi } from '../services/orderApi';
import { paymentApi } from '../services/paymentApi';
import { invoiceApi } from '../services/invoiceApi';
import { fmt } from '../data/products';

export default function AccountModal({
  isOpen,
  onClose,
  onShowToast,
  currentUser,
  onAuthSuccess,
  onLogoutSuccess,
  initialTab = 'profile'
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset' | 'verify' | 'profile' | 'orders'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [payingOrder, setPayingOrder] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [resendingInvoice, setResendingInvoice] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState('');

  // Tracking State
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Status Badge Mapper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Pending' };
      case 'CONFIRMED':
        return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Confirmed' };
      case 'PROCESSING':
      case 'FABRICATING':
        return { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', label: 'Processing' };
      case 'READY_TO_SHIP':
        return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Ready to Ship' };
      case 'SHIPPED':
        return { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Shipped' };
      case 'OUT_FOR_DELIVERY':
        return { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', label: 'Out for Delivery' };
      case 'DELIVERED':
        return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Delivered' };
      case 'CANCELLED':
        return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Cancelled' };
      default:
        return { bg: 'bg-neutral-500/15', text: 'text-neutral-400', border: 'border-neutral-500/30', label: status };
    }
  };

  const getShipmentStatusBadge = (status) => {
    switch (status) {
      case 'READY_FOR_DISPATCH':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      case 'SHIPPED':
        return 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400';
      case 'IN_TRANSIT':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
      case 'OUT_FOR_DELIVERY':
        return 'bg-sky-500/15 border-sky-500/30 text-sky-400';
      case 'DELIVERED':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case 'DELIVERY_FAILED':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
      case 'RETURN_TO_SENDER':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-400';
      default:
        return 'bg-neutral-500/15 border-neutral-500/30 text-neutral-400';
    }
  };

  const getTimelineStages = (data) => {
    if (!data?.hasShipment) return [];
    const status = data.shipment.status;
    const history = data.timeline || [];

    const historyMap = {};
    for (const h of history) {
      historyMap[h.stage] = h.timestamp;
    }

    const standardStages = [
      { key: 'READY_FOR_DISPATCH', label: 'Ready for Dispatch', desc: 'Consignment packaged and labeled for carrier handover' },
      { key: 'SHIPPED', label: 'Dispatched', desc: 'Consignment handed over to courier partner' },
      { key: 'IN_TRANSIT', label: 'In Transit', desc: 'Consignment in motion between logistics hubs' },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Consignment on van for final destination delivery' },
      { key: 'DELIVERED', label: 'Delivered', desc: 'Consignment successfully delivered to customer' }
    ];

    const stageOrder = ['READY_FOR_DISPATCH', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = stageOrder.indexOf(status);

    const stages = standardStages.map((s, idx) => {
      const historicalTime = historyMap[s.key] || (s.key === 'SHIPPED' ? data.shipment.dispatchedAt : s.key === 'DELIVERED' ? data.shipment.deliveredAt : null);
      const isDone = (currentIndex >= idx && currentIndex !== -1) || Boolean(historicalTime);
      const isCurrent = status === s.key;
      return {
        ...s,
        isDone,
        isCurrent,
        timestamp: historicalTime
      };
    });

    if (status === 'DELIVERY_FAILED') {
      stages.push({
        key: 'DELIVERY_FAILED',
        label: 'Delivery Attempt Exception',
        desc: data.shipment.failureReason || 'Delivery reattempt scheduled',
        isDone: true,
        isCurrent: true,
        timestamp: historyMap['DELIVERY_FAILED'] || data.shipment.updatedAt
      });
    } else if (status === 'RETURN_TO_SENDER') {
      stages.push({
        key: 'RETURN_TO_SENDER',
        label: 'Returned to Sender',
        desc: 'Consignment returning to Slidescoiety central depot',
        isDone: true,
        isCurrent: true,
        timestamp: historyMap['RETURN_TO_SENDER'] || data.shipment.updatedAt
      });
    }

    return stages;
  };

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setSelectedOrder(null);
      setShowCancelModal(false);
      if (currentUser) {
        if (initialTab === 'orders') {
          setMode('orders');
          loadOrders();
        } else {
          setMode('profile');
        }
      } else {
        setMode('login');
      }
    }
  }, [isOpen, currentUser, initialTab]);

  // Load customer orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await orderApi.getMyOrders({ page: 1, limit: 20 });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // View specific order details
  const handleViewOrder = async (orderId) => {
    setSelectedOrderLoading(true);
    setError('');
    setTrackingData(null);
    setTrackingError('');
    try {
      const res = await orderApi.getOrderById(orderId);
      setSelectedOrder(res.data.order);

      // Fetch live consignment tracking
      try {
        const trackRes = await orderApi.getOrderTracking(orderId);
        setTrackingData(trackRes?.data || null);
      } catch (trackErr) {
        setTrackingError(trackErr.message || 'Tracking information unavailable');
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve order details.');
    } finally {
      setSelectedOrderLoading(false);
    }
  };

  // Cancel order handler
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setCancelling(true);
    try {
      const res = await orderApi.cancelOrder(selectedOrder.id, cancelReason);
      setSelectedOrder(res.data.order);
      setShowCancelModal(false);
      setCancelReason('');
      onShowToast?.(`Order ${res.data.order.orderNumber} has been cancelled.`);
      // Refresh list
      loadOrders();
    } catch (err) {
      setError(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  // Pay order with Razorpay
  const handlePayOrder = async (orderToPay = selectedOrder) => {
    if (!orderToPay) return;
    setPayingOrder(true);
    setError('');

    try {
      const payRes = await paymentApi.createPayment(orderToPay.id);
      const checkoutData = payRes.data;

      const scriptLoaded = await paymentApi.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay payment gateway.');
      }

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
          color: '#e50914'
        },
        handler: async function (response) {
          try {
            setPayingOrder(true);
            const verifyRes = await paymentApi.verifyPayment({
              orderId: orderToPay.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            setSelectedOrder(verifyRes.data.order);
            onShowToast?.(`Payment confirmed! Order ${orderToPay.orderNumber} is now confirmed.`);
            loadOrders();
          } catch (verifyErr) {
            setError(verifyErr.message || 'Signature verification failed.');
          } finally {
            setPayingOrder(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingOrder(false);
            onShowToast?.('Payment modal dismissed. You can retry payment anytime.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        setError(resp.error?.description || 'Payment was declined or cancelled.');
        setPayingOrder(false);
      });
      razorpayInstance.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate payment.');
      setPayingOrder(false);
    }
  };

  // Download Invoice PDF
  const handleDownloadInvoice = async (order = selectedOrder) => {
    if (!order) return;
    const inv = order.invoice;
    const invId = inv?.id || inv?.invoiceNumber || order.id;
    const filename = `${inv?.invoiceNumber || order.orderNumber}_invoice.pdf`;
    setDownloadingInvoice(true);
    setInvoiceMessage('');
    setError('');

    try {
      await invoiceApi.downloadInvoice(invId, filename);
      onShowToast?.(`Invoice ${inv?.invoiceNumber || ''} downloaded successfully.`);
    } catch (err) {
      setError(err.message || 'Failed to download invoice PDF.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // Resend Invoice to Customer Email
  const handleResendInvoice = async (order = selectedOrder) => {
    if (!order) return;
    const inv = order.invoice;
    const invId = inv?.id || inv?.invoiceNumber;
    if (!invId) return;
    setResendingInvoice(true);
    setInvoiceMessage('');
    setError('');

    try {
      const res = await invoiceApi.resendInvoice(invId);
      setInvoiceMessage(res.message || 'Invoice sent to your registered email.');
      onShowToast?.('Invoice email request sent.');
    } catch (err) {
      setError(err.message || 'Failed to resend invoice email.');
    } finally {
      setResendingInvoice(false);
    }
  };

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      onAuthSuccess?.(res.data.user);
      onShowToast?.(`Signed in as ${res.data.user.fullName || res.data.user.email}`);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.register({
        fullName,
        email,
        password,
        confirmPassword
      });
      onAuthSuccess?.(res.data.user);
      onShowToast?.(`Welcome to the grid, ${res.data.user.fullName}!`);
      setSuccessMsg('Account created! A verification token has been generated.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      setSuccessMsg(res.message || 'If that email exists, reset instructions have been generated.');
      onShowToast?.('Password reset token generated');
    } catch (err) {
      setError(err.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.resetPassword({
        token,
        password,
        confirmPassword
      });
      setSuccessMsg(res.message || 'Password successfully updated! You can now sign in.');
      onShowToast?.('Password successfully updated!');
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Password reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify Email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await authApi.verifyEmail({ token, email });
      setSuccessMsg('Email successfully verified! Your account is active.');
      onShowToast?.('Driver account verified successfully!');
      setTimeout(() => {
        setMode(currentUser ? 'profile' : 'login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      onLogoutSuccess?.();
      onShowToast?.('Signed out successfully');
      onClose();
    } catch (err) {
      onShowToast?.('Signed out');
      onLogoutSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Container */}
      <div
        className={`relative z-10 w-full ${
          mode === 'orders' ? 'max-w-2xl' : 'max-w-md'
        } bg-[#0f0003] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            {mode === 'orders' && selectedOrder && (
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors mr-1"
                aria-label="Back to orders list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              {mode === 'orders'
                ? selectedOrder
                  ? `Order ${selectedOrder.orderNumber}`
                  : 'Order History & Telemetry'
                : mode === 'profile'
                ? 'Driver Profile'
                : mode === 'register'
                ? 'New Driver Registration'
                : mode === 'forgot'
                ? 'Reset Driver Password'
                : mode === 'reset'
                ? 'Enter New Password'
                : mode === 'verify'
                ? 'Verify Email Address'
                : 'Driver Account'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Toggle Tabs (when not logged in & in login/register) */}
        {!currentUser && (mode === 'login' || mode === 'register') && (
          <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 mb-6 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Authenticated Customer Navigation Tabs (Profile vs Orders) */}
        {currentUser && (
          <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 mb-5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMode('profile');
                setSelectedOrder(null);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'profile'
                  ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Driver Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('orders');
                setSelectedOrder(null);
                setError('');
                loadOrders();
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'orders'
                  ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>My Orders</span>
            </button>
          </div>
        )}

        {/* Global Notifications */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200 mb-4 animate-fadeIn shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 mb-4 animate-fadeIn shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* ======================================================== */}
          {/* VIEW 1: PROFILE (AUTHENTICATED CUSTOMER)                 */}
          {/* ======================================================== */}
          {mode === 'profile' && currentUser && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e50914]/20 border border-[#e50914]/40 flex items-center justify-center text-[#e50914]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{currentUser.fullName}</h4>
                      <p className="text-[11px] font-mono text-neutral-400">{currentUser.email}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-neutral-300 border border-white/10">
                    {currentUser.role}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Account Status:</span>
                  {currentUser.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Driver
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('verify');
                        setError('');
                      }}
                      className="text-[#e50914] hover:underline font-medium text-xs flex items-center gap-1"
                    >
                      Pending Verification (Verify Now)
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-white">Order Management</h5>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Track cockpit fabrication, logistics, and order history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('orders');
                    loadOrders();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#e50914] text-white text-xs font-bold transition-colors"
                >
                  View Orders
                </button>
              </div>

              {/* Management Console Access for ADMIN and SUPPORT */}
              {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPPORT') && (
                <div className="p-4 rounded-2xl bg-[#140003] border border-[#e50914]/30 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                      Management Console
                    </h5>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Access the Slidescoiety Pit Wall & administration panel.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.history.pushState(null, '', '/admin/dashboard');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#e50914] hover:bg-[#ff1801] text-white text-xs font-bold transition-colors shadow-md shadow-[#e50914]/20"
                  >
                    Open Console
                  </button>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#e50914]/10 border border-[#e50914]/20 flex items-center gap-2.5 text-xs text-neutral-300">
                <Sparkles className="w-4 h-4 text-[#e50914] shrink-0" />
                <span>Cart items & custom rig setups are synchronized with your driver profile.</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-3 rounded-full bg-white/10 hover:bg-[#e50914] hover:text-white text-neutral-200 font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: ORDER MANAGEMENT (LIST & DETAILS)                  */}
          {/* ======================================================== */}
          {mode === 'orders' && currentUser && (
            <div className="space-y-4">
              {/* Detailed View of Single Order */}
              {selectedOrder ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  {(() => {
                    const badge = getStatusBadge(selectedOrder.status);
                    return (
                      <div className={`p-4 rounded-2xl ${badge.bg} border ${badge.border} flex items-center justify-between`}>
                        <div>
                          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-300">
                            Current Order Status
                          </div>
                          <div className={`text-base font-bold font-mono ${badge.text} mt-0.5`}>
                            {badge.label}
                          </div>
                        </div>
                        {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED') && (
                          <button
                            type="button"
                            onClick={() => setShowCancelModal(true)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Payment Action Banner for Unpaid PENDING Orders */}
                  {selectedOrder.status === 'PENDING' && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-left">
                      <div>
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-amber-400" />
                          <span>Payment Awaiting Completion</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Pay securely via Razorpay (UPI, Cards, QR, Netbanking) to initiate fabrication.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePayOrder(selectedOrder)}
                        disabled={payingOrder}
                        className="px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white text-xs font-bold transition-all shadow-md shadow-[#e50914]/40 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        {payingOrder ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        <span>Pay {fmt(Number(selectedOrder.totalAmount))}</span>
                      </button>
                    </div>
                  )}

                  {/* Payment Confirmed Banner for Paid Orders */}
                  {selectedOrder.status !== 'PENDING' && selectedOrder.status !== 'CANCELLED' && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Payment Verified & Captured via Razorpay Gateway</span>
                    </div>
                  )}

                  {/* Official Order Invoice Card for Paid Orders */}
                  {selectedOrder.status !== 'PENDING' && selectedOrder.status !== 'CANCELLED' && (
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#e50914]/20 border border-[#e50914]/30 flex items-center justify-center text-[#e50914]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                              Official Order Invoice
                            </div>
                            <div className="text-xs font-mono font-bold text-white">
                              {selectedOrder.invoice?.invoiceNumber || 'Invoice Ready'}
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {selectedOrder.invoice?.status || 'Available'}
                        </span>
                      </div>

                      {invoiceMessage && (
                        <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{invoiceMessage}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(selectedOrder)}
                          disabled={downloadingInvoice}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white text-xs font-bold transition-all shadow-md shadow-[#e50914]/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {downloadingInvoice ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>Download PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResendInvoice(selectedOrder)}
                          disabled={resendingInvoice || !selectedOrder.invoice}
                          className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {resendingInvoice ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Email Invoice</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Cancel Confirmation Prompt */}
                  {showCancelModal && (
                    <div className="p-4 rounded-2xl bg-black/80 border border-rose-500/50 space-y-3">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                        <XCircle className="w-4 h-4" />
                        <span>Confirm Order Cancellation</span>
                      </div>
                      <p className="text-xs text-neutral-300">
                        Are you sure you want to cancel order <strong>{selectedOrder.orderNumber}</strong>?
                      </p>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation (optional)"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500"
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelOrder}
                          disabled={cancelling}
                          className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(false)}
                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-bold transition-all"
                        >
                          Keep Order
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Consignment Tracking & Logistics Timeline */}
                  {selectedOrder.status !== 'CANCELLED' && (
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#e50914]/20 border border-[#e50914]/30 flex items-center justify-center text-[#e50914]">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                              Consignment Tracking
                            </div>
                            <div className="text-xs font-bold text-white">
                              {trackingData?.hasShipment ? trackingData.shipment.courierName : 'Fulfillment Status'}
                            </div>
                          </div>
                        </div>
                        {trackingData?.hasShipment && (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${getShipmentStatusBadge(trackingData.shipment.status)}`}>
                            {trackingData.shipment.status.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      {trackingData?.hasShipment ? (
                        <div className="space-y-4">
                          {/* Tracking Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5 font-mono">
                            <div>
                              <span className="text-neutral-500 block text-[10px] uppercase">Courier Partner</span>
                              <span className="font-bold text-white">{trackingData.shipment.courierName}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px] uppercase">Tracking / AWB Number</span>
                              {trackingData.shipment.trackingUrl ? (
                                <a
                                  href={trackingData.shipment.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#e50914] font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <span>{trackingData.shipment.trackingNumber}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="font-bold text-white">{trackingData.shipment.trackingNumber}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px] uppercase">Estimated Delivery</span>
                              <span className="text-neutral-300">
                                {trackingData.shipment.estimatedDeliveryAt
                                  ? new Date(trackingData.shipment.estimatedDeliveryAt).toLocaleDateString('en-IN', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })
                                  : 'Calculation in progress'}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px] uppercase">
                                {trackingData.shipment.deliveredAt ? 'Delivered On' : trackingData.shipment.dispatchedAt ? 'Dispatched On' : 'Order Status'}
                              </span>
                              <span className={trackingData.shipment.deliveredAt ? 'text-emerald-400 font-bold' : trackingData.shipment.dispatchedAt ? 'text-cyan-400 font-bold' : 'text-neutral-300'}>
                                {trackingData.shipment.deliveredAt
                                  ? new Date(trackingData.shipment.deliveredAt).toLocaleString('en-IN')
                                  : trackingData.shipment.dispatchedAt
                                  ? new Date(trackingData.shipment.dispatchedAt).toLocaleString('en-IN')
                                  : trackingData.order.status}
                              </span>
                            </div>
                            {trackingData.shipment.failureReason && (
                              <div className="sm:col-span-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                                <span className="text-rose-400 block text-[10px] uppercase font-bold">Delivery Notice</span>
                                <span>{trackingData.shipment.failureReason}</span>
                              </div>
                            )}
                          </div>

                          {/* Stepper Timeline */}
                          <div className="space-y-3 pt-1">
                            <div className="text-[10px] font-mono uppercase text-neutral-400 font-bold tracking-wider">
                              Consignment Progress Timeline
                            </div>
                            
                            <div className="relative pl-6 space-y-3.5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                              {getTimelineStages(trackingData).map((stage) => {
                                const isCompleted = stage.isDone;
                                const isCurrent = stage.isCurrent;
                                return (
                                  <div key={stage.key} className="relative flex items-start gap-3">
                                    <div
                                      className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                        isCompleted
                                          ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/50'
                                          : isCurrent
                                          ? 'bg-[#e50914] text-white animate-pulse'
                                          : 'bg-neutral-800 text-neutral-500 border border-white/10'
                                      }`}
                                    >
                                      {isCompleted ? '✓' : ''}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className={`font-bold ${isCurrent ? 'text-white' : isCompleted ? 'text-neutral-200' : 'text-neutral-500'}`}>
                                          {stage.label}
                                        </span>
                                        {stage.timestamp && (
                                          <span className="text-[10px] font-mono text-neutral-400">
                                            {new Date(stage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(stage.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                          </span>
                                        )}
                                      </div>
                                      {stage.desc && (
                                        <p className="text-[11px] text-neutral-400 mt-0.5">{stage.desc}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-xs text-neutral-400 flex items-center gap-3">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <div className="font-bold text-white text-[11px] uppercase tracking-wider">
                              Fulfillment In Progress
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              Your simulator rig is undergoing fabrication and preparation. Live courier tracking will appear here once handed over to our logistics partner.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Financial & Date Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[10px] font-mono uppercase text-neutral-400">Order Date</div>
                      <div className="text-xs font-bold text-white mt-1">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[10px] font-mono uppercase text-neutral-400">Items</div>
                      <div className="text-xs font-bold text-white mt-1">
                        {selectedOrder.items?.reduce((s, it) => s + it.quantity, 0) || 0} Units
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[10px] font-mono uppercase text-neutral-400">Subtotal</div>
                      <div className="text-xs font-mono font-bold text-white mt-1">
                        {fmt(Number(selectedOrder.subtotal))}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[10px] font-mono uppercase text-neutral-400">Grand Total</div>
                      <div className="text-xs font-mono font-bold text-[#e50914] mt-1">
                        {fmt(Number(selectedOrder.totalAmount))}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Snapshot */}
                  {selectedOrder.shippingAddressSnapshot && (
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase font-bold text-neutral-300">
                        <MapPin className="w-3.5 h-3.5 text-[#e50914]" />
                        <span>Delivery Destination</span>
                      </div>
                      <div className="text-xs text-neutral-300 leading-relaxed pl-5">
                        <p className="font-bold text-white">
                          {selectedOrder.shippingAddressSnapshot.recipientName} ({selectedOrder.shippingAddressSnapshot.phone})
                        </p>
                        <p>
                          {selectedOrder.shippingAddressSnapshot.streetLine1}
                          {selectedOrder.shippingAddressSnapshot.streetLine2 ? `, ${selectedOrder.shippingAddressSnapshot.streetLine2}` : ''}
                        </p>
                        <p>
                          {selectedOrder.shippingAddressSnapshot.city}, {selectedOrder.shippingAddressSnapshot.state} — {selectedOrder.shippingAddressSnapshot.postalCode}
                        </p>
                        <p className="text-[11px] text-neutral-500">{selectedOrder.shippingAddressSnapshot.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Ordered Hardware Items List */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase text-neutral-400">Hardware Components</div>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-black/50 border border-white/5"
                        >
                          <img
                            src={it.productImageUrl || '/images/hero-cockpit.png'}
                            alt={it.productName}
                            className="w-12 h-12 object-cover rounded-lg bg-black shrink-0 border border-white/10"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-white truncate">{it.productName}</h5>
                            <p className="text-[10px] text-neutral-400">{it.productCategory}</p>
                            <div className="text-[11px] font-mono text-neutral-300 mt-0.5">
                              {fmt(Number(it.unitPrice))} × {it.quantity}
                            </div>
                          </div>
                          <div className="text-right font-mono font-bold text-xs text-[#e50914]">
                            {fmt(Number(it.subtotal))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Status History Timeline */}
                  {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-[#e50914]" />
                        <span>Telemetry & Status Audit History</span>
                      </div>
                      <div className="space-y-2">
                        {selectedOrder.statusHistory.map((h, idx) => (
                          <div
                            key={h.id || idx}
                            className="flex items-start gap-3 p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#e50914] mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-white text-[11px]">
                                  {h.newStatus || h.status}
                                </span>
                                <span className="text-[10px] text-neutral-500 font-mono">
                                  {new Date(h.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {h.notes && (
                                <p className="text-[11px] text-neutral-400 mt-0.5 italic">{h.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Orders List View */
                <div>
                  {ordersLoading ? (
                    <div className="py-16 text-center text-neutral-400 space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#e50914]" />
                      <p className="text-xs">Loading order telemetry...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-16 text-center text-neutral-400 space-y-3">
                      <Package className="w-12 h-12 mx-auto text-neutral-600" />
                      <h4 className="font-bold text-white text-base">No Orders Found</h4>
                      <p className="text-xs max-w-xs mx-auto">
                        You have not placed any orders yet. Visit the catalog or configure your setup in the Rig Builder.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((ord) => {
                        const badge = getStatusBadge(ord.status);
                        return (
                          <div
                            key={ord.id}
                            onClick={() => handleViewOrder(ord.id)}
                            className="p-4 rounded-2xl bg-black/50 border border-white/10 hover:border-[#e50914]/50 cursor-pointer transition-all space-y-2.5 group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-sm text-white group-hover:text-[#e50914] transition-colors">
                                {ord.orderNumber}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${badge.bg} ${badge.text} border ${badge.border}`}
                              >
                                {badge.label}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-white/5">
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                                <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                                {ord.invoice && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30 inline-flex items-center gap-0.5">
                                    <FileText className="w-2.5 h-2.5" />
                                    <span>INV</span>
                                  </span>
                                )}
                                {ord.shipment && (
                                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 inline-flex items-center gap-0.5">
                                    <Truck className="w-2.5 h-2.5" />
                                    <span>{ord.shipment.status.replace(/_/g, ' ')}</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span>{ord.items?.length || 0} items</span>
                                <span className="font-mono font-bold text-white text-sm">
                                  {fmt(Number(ord.totalAmount))}
                                </span>
                                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: SIGN IN FORM                                     */}
          {/* ======================================================== */}
          {mode === 'login' && !currentUser && (
            <form onSubmit={handleLogin} className="space-y-4 mb-2">
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono uppercase text-neutral-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] text-[#e50914] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
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
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating Driver...' : 'Sign In to Driver Account'}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: REGISTRATION FORM                                */}
          {/* ======================================================== */}
          {mode === 'register' && !currentUser && (
            <form onSubmit={handleRegister} className="space-y-3.5 mb-2">
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Full Name / Driver Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Max Apex"
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

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
                  Password (min 8 chars, letters & numbers)
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

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
              >
                {loading ? 'Registering Driver...' : 'Complete Driver Registration'}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 4: FORGOT PASSWORD                                  */}
          {/* ======================================================== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 mb-2">
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
              >
                {loading ? 'Dispatching...' : 'Send Reset Link'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-neutral-400 hover:text-white"
                >
                  Have a reset token?
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#e50914] hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 5: RESET PASSWORD FORM                              */}
          {/* ======================================================== */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5 mb-2">
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Reset Token
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter 64-character token"
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  New Password (min 8 chars, letters & numbers)
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

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-[#e50914] hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 6: EMAIL VERIFICATION                               */}
          {/* ======================================================== */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4 mb-2">
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@slidescoiety.com"
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Verification Token
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste verification token"
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] font-mono text-[11px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/40 mt-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Driver Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode(currentUser ? 'profile' : 'login')}
                  className="text-xs text-[#e50914] hover:underline"
                >
                  Cancel and return
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Global Modal Close Button */}
        <div className="pt-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full text-xs font-bold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

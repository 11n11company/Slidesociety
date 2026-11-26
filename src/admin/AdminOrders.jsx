import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  AlertCircle,
  X,
  FileText,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Minus,
  Trash2,
  Edit3,
  MessageCircle,
  Send,
  Check
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { fmt } from '../data/products';

const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['FABRICATING', 'READY_TO_SHIP', 'CANCELLED'],
  FABRICATING: ['READY_TO_SHIP', 'CANCELLED'],
  READY_TO_SHIP: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: []
};

const ALLOWED_SHIPMENT_TRANSITIONS = {
  READY_FOR_DISPATCH: ['SHIPPED'],
  SHIPPED: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURN_TO_SENDER'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURN_TO_SENDER'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_FAILED', 'RETURN_TO_SENDER'],
  DELIVERY_FAILED: ['OUT_FOR_DELIVERY', 'IN_TRANSIT', 'RETURN_TO_SENDER', 'DELIVERED'],
  RETURN_TO_SENDER: [],
  DELIVERED: []
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

export default function AdminOrders({ currentUser, initialOrderId = null }) {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Essential filters only
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Order Details Modal
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Update Status Form
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Shipment Management State
  const [showCreateShipment, setShowCreateShipment] = useState(false);
  const [shipmentCourier, setShipmentCourier] = useState('');
  const [shipmentTrackingNumber, setShipmentTrackingNumber] = useState('');
  const [shipmentTrackingUrl, setShipmentTrackingUrl] = useState('');
  const [shipmentEstDelivery, setShipmentEstDelivery] = useState('');
  const [shipmentNotes, setShipmentNotes] = useState('');
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [shipmentError, setShipmentError] = useState('');
  const [shipmentSuccess, setShipmentSuccess] = useState('');
  const [newShipmentStatus, setNewShipmentStatus] = useState('');
  const [shipmentStatusNotes, setShipmentStatusNotes] = useState('');
  const [shipmentFailureReason, setShipmentFailureReason] = useState('');
  const [updatingShipmentStatus, setUpdatingShipmentStatus] = useState(false);

  // Edit Existing Shipment Details State
  const [isEditingShipment, setIsEditingShipment] = useState(false);
  const [updatingShipment, setUpdatingShipment] = useState(false);
  const [editCourier, setEditCourier] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editTrackingUrl, setEditTrackingUrl] = useState('');
  const [editEstDelivery, setEditEstDelivery] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editShipmentStatus, setEditShipmentStatus] = useState('');

  const isSupport = false;

  // Catalog products for item addition
  const [catalogProducts, setCatalogProducts] = useState([]);

  // Fare & Items editing state
  const [isEditingFareAndItems, setIsEditingFareAndItems] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [editShipping, setEditShipping] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);
  const [savingFareAndItems, setSavingFareAndItems] = useState(false);
  const [fareAndItemsError, setFareAndItemsError] = useState('');
  const [fareAndItemsSuccess, setFareAndItemsSuccess] = useState('');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');

  // Payment Recording State
  const [payMethod, setPayMethod] = useState('UPI');
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payAutoConfirm, setPayAutoConfirm] = useState(true);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Invoice Actions State
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [sendingInvoiceEmail, setSendingInvoiceEmail] = useState(false);
  const [invoiceActionMsg, setInvoiceActionMsg] = useState('');

  // Load catalog products on mount
  useEffect(() => {
    adminApi.getProducts({ limit: 100 })
      .then(res => setCatalogProducts(res?.data?.products || []))
      .catch(() => {});
  }, []);

  const loadOrders = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getOrders({
        page,
        limit: 15,
        status: statusFilter,
        search
      });
      setOrders(res?.data?.orders || []);
      setPagination(res?.data?.pagination || { page: 1, limit: 15, totalCount: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders(1);
  };

  // Open Order Detail
  const handleOpenDetail = async (orderId) => {
    setSelectedOrderId(orderId);
    setOrderLoading(true);
    setOrderError('');
    setStatusSuccess('');
    setNewStatus('');
    setStatusNotes('');
    setShipmentError('');
    setShipmentSuccess('');
    setShowCreateShipment(false);
    setIsEditingShipment(false);
    setUpdatingShipment(false);
    setShipmentCourier('');
    setShipmentTrackingNumber('');
    setShipmentTrackingUrl('');
    setShipmentEstDelivery('');
    setShipmentNotes('');
    setNewShipmentStatus('');
    setShipmentStatusNotes('');
    setShipmentFailureReason('');
    setIsEditingFareAndItems(false);
    setFareAndItemsError('');
    setFareAndItemsSuccess('');
    setPaymentError('');
    setPaymentSuccess('');
    setInvoiceActionMsg('');

    try {
      const res = await adminApi.getOrderById(orderId);
      const ord = res?.data?.order || null;
      setSelectedOrder(ord);
      if (ord) {
        setEditItems(ord.items?.map(it => ({
          id: it.id,
          productId: it.productId,
          productName: it.productName,
          productCategory: it.categorySnapshot || it.productCategory,
          unitPrice: Number(it.unitPrice),
          quantity: Number(it.quantity),
          lineTotal: Number(it.totalPrice || it.lineTotal || (it.unitPrice * it.quantity))
        })) || []);
        setEditShipping(Number(ord.shippingAmount || 0));
        setEditDiscount(Number(ord.discountAmount || 0));
        setPayAmount(String(Number(ord.totalAmount || 0)));
      }
    } catch (err) {
      setOrderError(err.message || 'Failed to retrieve order details.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Update item quantity in edit mode
  const handleUpdateItemQty = (index, delta) => {
    setEditItems(prev => {
      const updated = [...prev];
      const newQty = Math.max(1, (updated[index].quantity || 1) + delta);
      updated[index] = {
        ...updated[index],
        quantity: newQty,
        lineTotal: updated[index].unitPrice * newQty
      };
      return updated;
    });
  };

  // Update item unit price in edit mode
  const handleUpdateItemPrice = (index, price) => {
    setEditItems(prev => {
      const updated = [...prev];
      const parsed = isNaN(Number(price)) ? 0 : Number(price);
      updated[index] = {
        ...updated[index],
        unitPrice: parsed,
        lineTotal: parsed * updated[index].quantity
      };
      return updated;
    });
  };

  // Remove item from edit mode
  const handleRemoveItem = (index) => {
    if (editItems.length <= 1) {
      setFareAndItemsError('An order must contain at least one item.');
      return;
    }
    setEditItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Add new item to edit mode
  const handleAddItemToOrder = () => {
    if (!selectedProductToAdd) return;
    const prod = catalogProducts.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    setEditItems(prev => {
      const existingIndex = prev.findIndex(it => it.productId === prod.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = (updated[existingIndex].quantity || 1) + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          lineTotal: updated[existingIndex].unitPrice * newQty
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          productCategory: prod.category || 'Hardware',
          unitPrice: Number(prod.priceInr),
          quantity: 1,
          lineTotal: Number(prod.priceInr)
        }
      ];
    });
    setSelectedProductToAdd('');
  };

  // Save modified items and fare
  const handleSaveFareAndItems = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSavingFareAndItems(true);
    setFareAndItemsError('');
    setFareAndItemsSuccess('');

    try {
      const res = await adminApi.updateOrderFareAndItems(selectedOrder.id, {
        items: editItems.map(it => ({
          productId: it.productId,
          productName: it.productName,
          productCategory: it.productCategory,
          unitPrice: Number(it.unitPrice),
          quantity: Number(it.quantity)
        })),
        shippingAmount: Number(editShipping),
        discountAmount: Number(editDiscount),
        notes: `Items & logistics fare modified by admin`
      });

      const updated = res?.data?.order;
      setSelectedOrder(updated);
      setPayAmount(String(Number(updated.totalAmount || 0)));
      setIsEditingFareAndItems(false);
      setFareAndItemsSuccess('Order items and fare updated successfully.');
      loadOrders(pagination.page);
    } catch (err) {
      setFareAndItemsError(err.message || 'Failed to update order fare and items.');
    } finally {
      setSavingFareAndItems(false);
    }
  };

  // Record manual/offline/UPI payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setRecordingPayment(true);
    setPaymentError('');
    setPaymentSuccess('');

    try {
      const res = await adminApi.recordOrderPayment(selectedOrder.id, {
        amount: Number(payAmount),
        method: payMethod,
        transactionReference: payRef.trim(),
        notes: payNotes.trim(),
        autoConfirm: payAutoConfirm
      });

      const updated = res?.data?.order;
      setSelectedOrder(updated);
      setPaymentSuccess(`Payment of ₹${payAmount} recorded successfully! Order confirmed.`);
      loadOrders(pagination.page);
    } catch (err) {
      setPaymentError(err.message || 'Failed to record payment.');
    } finally {
      setRecordingPayment(false);
    }
  };

  // Generate / Regenerate Tax Invoice
  const handleGenerateInvoice = async () => {
    if (!selectedOrder) return;
    setGeneratingInvoice(true);
    setInvoiceActionMsg('');
    try {
      await adminApi.generateOrderInvoice(selectedOrder.id);
      setInvoiceActionMsg('Tax invoice generated successfully!');
      const res = await adminApi.getOrderById(selectedOrder.id);
      setSelectedOrder(res?.data?.order || selectedOrder);
    } catch (err) {
      setInvoiceActionMsg(err.message || 'Failed to generate invoice.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Share Tax Invoice via WhatsApp
  const handleShareInvoiceWhatsApp = () => {
    if (!selectedOrder || !selectedOrder.invoice) return;
    const phone = selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const invoiceUrl = `${window.location.origin}/api/v1/invoices/${selectedOrder.invoice.id}/download`;

    const message = [
      `🏎️ *SLIDESCOIETY SIM RACING — OFFICIAL TAX INVOICE*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📋 *Order Reference:* #${selectedOrder.orderNumber}`,
      `🧾 *Invoice Number:* ${selectedOrder.invoice.invoiceNumber}`,
      `👤 *Customer Name:* ${selectedOrder.user?.fullName || selectedOrder.shippingAddress?.fullName || 'Driver'}`,
      `💰 *Total Amount:* ${fmt(selectedOrder.totalAmount)}`,
      `✅ *Payment Status:* PAID (${selectedOrder.payments?.[0]?.method || 'UPI/Transfer'})`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📥 *DOWNLOAD OFFICIAL TAX INVOICE (PDF):*`,
      invoiceUrl,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Thank you for choosing Slidescoiety! Your sim racing cockpit is officially queued for preparation and dispatch.`
    ].join('\n');

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Send Tax Invoice via Email
  const handleSendInvoiceEmail = async () => {
    if (!selectedOrder || !selectedOrder.invoice) return;
    setSendingInvoiceEmail(true);
    setInvoiceActionMsg('');
    try {
      await adminApi.resendInvoice(selectedOrder.invoice.id);
      setInvoiceActionMsg(`Invoice successfully emailed to ${selectedOrder.user?.email || 'customer'}!`);
    } catch (err) {
      setInvoiceActionMsg(err.message || 'Failed to send invoice email.');
    } finally {
      setSendingInvoiceEmail(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      handleOpenDetail(initialOrderId);
    }
  }, [initialOrderId]);

  // Handle Shipment Creation
  const handleCreateShipment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setCreatingShipment(true);
    setShipmentError('');
    setShipmentSuccess('');

    try {
      await adminApi.createShipment(selectedOrder.id, {
        courierName: shipmentCourier.trim(),
        trackingNumber: shipmentTrackingNumber.trim(),
        trackingUrl: shipmentTrackingUrl.trim() || undefined,
        estimatedDeliveryAt: shipmentEstDelivery ? new Date(shipmentEstDelivery).toISOString() : undefined,
        notes: shipmentNotes.trim() || undefined
      });
      setShipmentSuccess(`Shipment created with ${shipmentCourier} (${shipmentTrackingNumber}).`);
      setShowCreateShipment(false);
      // Reload order details to show new shipment
      const refreshed = await adminApi.getOrderById(selectedOrder.id);
      setSelectedOrder(refreshed?.data?.order || selectedOrder);
      loadOrders(pagination.page);
    } catch (err) {
      setShipmentError(err.message || 'Failed to create shipment.');
    } finally {
      setCreatingShipment(false);
    }
  };

  // Start Editing Existing Shipment Details
  const startEditingShipment = (shipment) => {
    setIsEditingShipment(true);
    setEditCourier(shipment?.courierName || '');
    setEditTrackingNumber(shipment?.trackingNumber || '');
    setEditTrackingUrl(shipment?.trackingUrl || '');
    setEditEstDelivery(
      shipment?.estimatedDeliveryAt
        ? new Date(shipment.estimatedDeliveryAt).toISOString().split('T')[0]
        : ''
    );
    setEditNotes(shipment?.notes || '');
    setEditShipmentStatus(shipment?.status || 'READY_FOR_DISPATCH');
    setShipmentError('');
    setShipmentSuccess('');
  };

  // Handle Updating Existing Shipment Details
  const handleUpdateShipmentDetails = async (e) => {
    e.preventDefault();
    if (!selectedOrder?.shipment || !editCourier.trim() || !editTrackingNumber.trim()) return;
    setUpdatingShipment(true);
    setShipmentError('');
    setShipmentSuccess('');

    try {
      await adminApi.updateShipment(selectedOrder.shipment.id, {
        courierName: editCourier.trim(),
        trackingNumber: editTrackingNumber.trim(),
        trackingUrl: editTrackingUrl.trim() || null,
        estimatedDeliveryAt: editEstDelivery || null,
        notes: editNotes.trim() || null,
        status: editShipmentStatus || undefined
      });

      setShipmentSuccess('Shipping details updated successfully.');
      setIsEditingShipment(false);

      // Reload order details to refresh updated shipment
      const refreshed = await adminApi.getOrderById(selectedOrder.id);
      setSelectedOrder(refreshed?.data?.order || selectedOrder);
      loadOrders(pagination.page);
    } catch (err) {
      setShipmentError(err.message || 'Failed to update shipping details.');
    } finally {
      setUpdatingShipment(false);
    }
  };

  // Handle Shipment Status Update
  const handleUpdateShipmentStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder?.shipment || !newShipmentStatus) return;
    setUpdatingShipmentStatus(true);
    setShipmentError('');
    setShipmentSuccess('');

    try {
      await adminApi.updateShipmentStatus(selectedOrder.shipment.id, {
        status: newShipmentStatus,
        notes: shipmentStatusNotes.trim() || undefined,
        failureReason: newShipmentStatus === 'DELIVERY_FAILED' ? (shipmentFailureReason.trim() || shipmentStatusNotes.trim() || undefined) : undefined
      });
      setShipmentSuccess(`Shipment status updated to ${newShipmentStatus}.`);
      setNewShipmentStatus('');
      setShipmentStatusNotes('');
      setShipmentFailureReason('');
      // Reload order details to refresh both shipment and order status
      const refreshed = await adminApi.getOrderById(selectedOrder.id);
      setSelectedOrder(refreshed?.data?.order || selectedOrder);
      loadOrders(pagination.page);
    } catch (err) {
      setShipmentError(err.message || 'Failed to update shipment status.');
    } finally {
      setUpdatingShipmentStatus(false);
    }
  };

  // Handle Order Status Update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus || !selectedOrder) return;

    setUpdatingStatus(true);
    setOrderError('');
    setStatusSuccess('');

    try {
      const res = await adminApi.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        notes: statusNotes.trim() || undefined
      });
      setStatusSuccess(`Order status transitioned to ${newStatus}.`);
      setSelectedOrder(res?.data?.order || selectedOrder);
      // Reload orders list in background
      loadOrders(pagination.page);
    } catch (err) {
      setOrderError(err.message || 'Failed to transition order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Download Invoice
  const handleDownloadInvoice = async (invoice) => {
    if (!invoice?.id) return;
    setDownloadingInvoice(true);
    try {
      await adminApi.downloadInvoice(invoice.id, `${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      setOrderError(err.message || 'Failed to download invoice PDF.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'CONFIRMED':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'PROCESSING':
      case 'FABRICATING':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'READY_TO_SHIP':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'DELIVERED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30';
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'CAPTURED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'AUTHORIZED':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'FAILED':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* ESSENTIAL FILTERS BAR                                    */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or customer..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-600 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#e50914] transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_TO_SHIP">Ready to Ship</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={() => loadOrders(pagination.page)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ORDERS LIST TABLE                                        */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="text-xs font-medium text-slate-600">Loading Orders...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm font-medium">
            No orders match the current filter criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-3">Order Number</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Order Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => {
                    const payStatus = ord.payments?.[0]?.status || (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(ord.status) ? 'CAPTURED' : 'PENDING');
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-slate-900">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-medium text-slate-900">{ord.user?.fullName || 'Guest Customer'}</div>
                          <div className="text-xs text-slate-500">{ord.user?.email || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {fmt(ord.totalAmount)}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase border ${getPaymentBadge(payStatus)}`}>
                            {payStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${getStatusBadge(ord.status)}`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(ord.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#e50914] text-slate-700 hover:text-white font-semibold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
                <span>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total orders)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => loadOrders(pagination.page - 1)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 border border-slate-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => loadOrders(pagination.page + 1)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 border border-slate-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* ORDER DETAILS MODAL                                      */}
      {/* ======================================================== */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setSelectedOrderId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <div className="relative z-10 w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-2xl max-h-[92dvh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                <h3 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  {selectedOrder ? `Order ${selectedOrder.orderNumber}` : 'Order Inspection'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {orderLoading ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#e50914] mx-auto" />
                  <div className="text-xs">Retrieving order details...</div>
                </div>
              ) : orderError ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {orderError}
                </div>
              ) : selectedOrder ? (
                <>
                  {/* Status Banner */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase text-slate-500">Current Status</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${getStatusBadge(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase border ${getPaymentBadge(selectedOrder.payments?.[0]?.status || 'PENDING')}`}>
                          Payment: {selectedOrder.payments?.[0]?.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase text-slate-500">Total Grand Amount</div>
                      <div className="text-xl font-bold text-slate-900 mt-0.5">
                        {fmt(selectedOrder.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Feedback alerts */}
                  {statusSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{statusSuccess}</span>
                    </div>
                  )}

                  {/* Customer & Fulfillment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Profile */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#e50914]">
                        Customer Driver
                      </div>
                      <div className="text-sm font-bold text-slate-900">{selectedOrder.user?.fullName}</div>
                      <div className="text-xs text-slate-600 font-medium">{selectedOrder.user?.email}</div>
                      {selectedOrder.user?.phone && (
                        <div className="text-xs text-slate-500">{selectedOrder.user.phone}</div>
                      )}
                    </div>

                    {/* Shipping Address */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#e50914]">
                        Shipping Address
                      </div>
                      {selectedOrder.shippingAddress ? (
                        <div className="text-xs text-slate-600 leading-relaxed">
                          <div className="font-bold text-slate-900">{selectedOrder.shippingAddress.fullName}</div>
                          <div>{selectedOrder.shippingAddress.street}</div>
                          <div>
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                          </div>
                          <div>{selectedOrder.shippingAddress.country}</div>
                          <div className="text-slate-500 text-xs mt-1">
                            Phone: {selectedOrder.shippingAddress.phone}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">No shipping address recorded.</div>
                      )}
                    </div>
                  </div>

                  {/* Order Items & Fare Adjustment Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#e50914]">
                        Ordered Hardware &amp; Logistics Fare
                      </div>
                      {!isSupport && selectedOrder.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isEditingFareAndItems) {
                              setEditItems(selectedOrder.items?.map(it => ({
                                id: it.id,
                                productId: it.productId,
                                productName: it.productName,
                                productCategory: it.categorySnapshot || it.productCategory,
                                unitPrice: Number(it.unitPrice),
                                quantity: Number(it.quantity),
                                lineTotal: Number(it.totalPrice || it.lineTotal || (it.unitPrice * it.quantity))
                              })) || []);
                              setEditShipping(Number(selectedOrder.shippingAmount || 0));
                              setEditDiscount(Number(selectedOrder.discountAmount || 0));
                            }
                            setIsEditingFareAndItems(!isEditingFareAndItems);
                            setFareAndItemsError('');
                            setFareAndItemsSuccess('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#e50914] hover:text-white text-slate-700 border border-slate-200 text-[11px] font-bold transition-all flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{isEditingFareAndItems ? 'Cancel Editing' : 'Edit Items & Fare'}</span>
                        </button>
                      )}
                    </div>

                    {fareAndItemsSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{fareAndItemsSuccess}</span>
                      </div>
                    )}

                    {fareAndItemsError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{fareAndItemsError}</span>
                      </div>
                    )}

                    {/* View Mode */}
                    {!isEditingFareAndItems ? (
                      <div className="space-y-3">
                        <div className="divide-y divide-slate-100">
                          {selectedOrder.items?.map((item) => (
                            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-slate-900">{item.productName}</div>
                                <div className="text-xs text-slate-500">
                                  {item.categorySnapshot || item.productCategory} • Qty: {item.quantity} × {fmt(item.unitPrice)}
                                </div>
                              </div>
                              <div className="font-semibold text-slate-900">
                                {fmt(item.totalPrice || item.lineTotal || (item.unitPrice * item.quantity))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Financial Totals Breakdown */}
                        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 font-medium">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Subtotal ({selectedOrder.items?.length || 0} items)</span>
                            <span className="text-slate-900 font-bold">{fmt(selectedOrder.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">GST (18% included)</span>
                            <span className="text-slate-600">{fmt(selectedOrder.taxAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Express Logistics Fare</span>
                            <span className="text-slate-600">{fmt(selectedOrder.shippingAmount)}</span>
                          </div>
                          {Number(selectedOrder.discountAmount) > 0 && (
                            <div className="flex justify-between text-emerald-600 font-semibold">
                              <span>Special Discount</span>
                              <span>-{fmt(selectedOrder.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                            <span>Grand Total</span>
                            <span className="text-[#e50914]">{fmt(selectedOrder.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Edit Mode */
                      <form onSubmit={handleSaveFareAndItems} className="space-y-4">
                        <div className="space-y-2.5">
                          {editItems.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-900 truncate">{item.productName}</div>
                                <div className="text-xs text-slate-500">{item.productCategory}</div>
                              </div>

                              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                {/* Unit price override */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 text-[11px]">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.unitPrice}
                                    onChange={(e) => handleUpdateItemPrice(idx, e.target.value)}
                                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 text-right focus:outline-none focus:border-[#e50914]"
                                    title="Unit Price"
                                  />
                                </div>

                                {/* Quantity stepper */}
                                <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQty(idx, -1)}
                                    className="p-1 text-slate-400 hover:text-slate-700"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 text-xs font-semibold text-slate-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQty(idx, 1)}
                                    className="p-1 text-slate-400 hover:text-slate-700"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Line total */}
                                <div className="w-24 text-right font-semibold text-slate-900">
                                  {fmt(item.unitPrice * item.quantity)}
                                </div>

                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Item to Order selector */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
                          <select
                            value={selectedProductToAdd}
                            onChange={(e) => setSelectedProductToAdd(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                          >
                            <option value="">Select component to add to order...</option>
                            {catalogProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} — {fmt(Number(p.priceInr))} ({p.category})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleAddItemToOrder}
                            disabled={!selectedProductToAdd}
                            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-[#e50914] hover:text-white text-slate-800 font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Component</span>
                          </button>
                        </div>

                        {/* Fare & Discount Adjustments */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Logistics / Shipping Fare (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editShipping}
                              onChange={(e) => setEditShipping(e.target.value)}
                              placeholder="0"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Special Discount (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editDiscount}
                              onChange={(e) => setEditDiscount(e.target.value)}
                              placeholder="0"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                            />
                          </div>
                        </div>

                        {/* Live calculation preview */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-medium">
                          {(() => {
                            const curSubtotal = editItems.reduce((sum, it) => sum + (Number(it.unitPrice) * Number(it.quantity)), 0);
                            const curTax = Math.round(curSubtotal * 0.18);
                            const curTotal = Math.max(0, curSubtotal + Number(editShipping || 0) - Number(editDiscount || 0));
                            return (
                              <>
                                <div className="flex justify-between text-slate-500">
                                  <span>Calculated Subtotal:</span>
                                  <span className="text-slate-900 font-bold">{fmt(curSubtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                  <span>GST (18% included):</span>
                                  <span className="text-slate-700">{fmt(curTax)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                  <span>Logistics Fare:</span>
                                  <span className="text-slate-700">{fmt(Number(editShipping || 0))}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                                  <span>Updated Total:</span>
                                  <span className="text-[#e50914]">{fmt(curTotal)}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Save & Cancel Actions */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={savingFareAndItems || editItems.length === 0}
                            className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1801] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#e50914]/20 disabled:opacity-50"
                          >
                            {savingFareAndItems ? 'Saving Changes...' : 'Save Fare & Items'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingFareAndItems(false)}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Payment Recording & Order Confirmation Panel */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#e50914]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#e50914]">
                          Payment &amp; Order Confirmation
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${getPaymentBadge(selectedOrder.payments?.[0]?.status || 'PENDING')}`}>
                        {selectedOrder.payments?.[0]?.status || 'PENDING'}
                      </span>
                    </div>

                    {paymentSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{paymentSuccess}</span>
                      </div>
                    )}

                    {paymentError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    {/* Captured Payment Display */}
                    {selectedOrder.payments?.some(p => p.status === 'CAPTURED') ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                        <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Payment Captured &amp; Verified</span>
                        </div>
                        {selectedOrder.payments.filter(p => p.status === 'CAPTURED').map(p => (
                          <div key={p.id} className="text-slate-700 text-[11px] pt-1">
                            <div>Method: <strong className="text-slate-900 uppercase">{p.method || 'UPI/Transfer'}</strong> • Amount: <strong className="text-slate-900">{fmt(p.amount)}</strong></div>
                            <div className="text-slate-500 text-[10px]">Reference: {p.providerPaymentId || 'N/A'} • Date: {new Date(p.paidAt || p.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Payment Pending: Record Manual Payment & Confirm Form */
                      !isSupport && selectedOrder.status !== 'CANCELLED' && (
                        <form onSubmit={handleRecordPayment} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="text-xs text-slate-600 leading-snug">
                            Record customer payment (UPI, Bank Transfer, Cash) to confirm order and automatically generate the official Tax Invoice.
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Payment Method *
                              </label>
                              <select
                                value={payMethod}
                                onChange={(e) => setPayMethod(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                              >
                                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                                <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS / RTGS)</option>
                                <option value="CASH">Cash on Delivery / Direct Cash</option>
                                <option value="CARD">Credit / Debit Card (Offline)</option>
                                <option value="MANUAL">Manual Verification</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Amount Paid (₹) *
                              </label>
                              <input
                                type="number"
                                min="1"
                                required
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Transaction / UTR Ref *
                              </label>
                              <input
                                type="text"
                                required
                                value={payRef}
                                onChange={(e) => setPayRef(e.target.value)}
                                placeholder="e.g. UPI/492019481928 or NEFT UTR"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Admin Notes (Optional)
                              </label>
                              <input
                                type="text"
                                value={payNotes}
                                onChange={(e) => setPayNotes(e.target.value)}
                                placeholder="e.g. Screenshot verified via WhatsApp"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="autoConfirmOrder"
                              checked={payAutoConfirm}
                              onChange={(e) => setPayAutoConfirm(e.target.checked)}
                              className="rounded border-slate-300 bg-white text-[#e50914] focus:ring-0"
                            />
                            <label htmlFor="autoConfirmOrder" className="text-xs text-slate-700">
                              Set Order Status to <strong className="text-emerald-700 font-semibold">CONFIRMED</strong> immediately
                            </label>
                          </div>

                          <button
                            type="submit"
                            disabled={recordingPayment || !payRef.trim() || !payAmount}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-emerald-600/20"
                          >
                            <Check className="w-4 h-4" />
                            <span>{recordingPayment ? 'Recording Payment...' : 'Record Payment & Confirm Order'}</span>
                          </button>
                        </form>
                      )
                    )}
                  </div>

                  {/* Tax Invoice & Customer Bill Sharing Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#e50914]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#e50914]">
                          Tax Invoice &amp; Customer Bill
                        </span>
                      </div>
                      {selectedOrder.invoice && (
                        <span className="text-emerald-700 text-xs font-bold">
                          {selectedOrder.invoice.invoiceNumber}
                        </span>
                      )}
                    </div>

                    {invoiceActionMsg && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{invoiceActionMsg}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        {selectedOrder.invoice ? (
                          <div className="text-slate-600 text-xs">
                            Generated on {new Date(selectedOrder.invoice.createdAt).toLocaleDateString()} • Total: <strong className="text-slate-900">{fmt(selectedOrder.invoice.totalAmount)}</strong>
                          </div>
                        ) : (
                          <div className="text-slate-500 text-xs">
                            Official invoice generates automatically upon payment confirmation or manually below.
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Generate Bill button if no invoice */}
                        {!selectedOrder.invoice ? (
                          !isSupport && (
                            <button
                              type="button"
                              disabled={generatingInvoice}
                              onClick={handleGenerateInvoice}
                              className="px-3 py-1.5 rounded-lg bg-[#e50914] hover:bg-[#ff1801] text-white text-xs font-bold transition-all flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{generatingInvoice ? 'Generating...' : 'Generate Bill / Invoice'}</span>
                            </button>
                          )
                        ) : (
                          <>
                            {/* Download PDF */}
                            <button
                              type="button"
                              disabled={downloadingInvoice}
                              onClick={() => handleDownloadInvoice(selectedOrder.invoice)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#e50914] hover:text-white text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                              title="Download PDF Tax Invoice"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{downloadingInvoice ? 'Downloading...' : 'PDF'}</span>
                            </button>

                            {/* Share via WhatsApp */}
                            <button
                              type="button"
                              onClick={handleShareInvoiceWhatsApp}
                              className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                              title="Share Invoice & Download Link with Customer via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white" />
                              <span>Share via WhatsApp</span>
                            </button>

                            {/* Send via Email */}
                            <button
                              type="button"
                              disabled={sendingInvoiceEmail}
                              onClick={handleSendInvoiceEmail}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                              title="Email Official Invoice PDF to Customer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{sendingInvoiceEmail ? 'Sending...' : 'Email Invoice'}</span>
                            </button>

                            {/* Regenerate Bill */}
                            {!isSupport && (
                              <button
                                type="button"
                                disabled={generatingInvoice}
                                onClick={handleGenerateInvoice}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                                title="Regenerate invoice if items or fare were updated"
                              >
                                <RefreshCw className={`w-3 h-3 ${generatingInvoice ? 'animate-spin' : ''}`} />
                                <span>Regen</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipment & Logistics Management Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#e50914]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#e50914]">
                          Shipment &amp; Logistics Management
                        </span>
                      </div>
                      {selectedOrder.shipment && (
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${getShipmentStatusBadge(selectedOrder.shipment.status)}`}>
                          {selectedOrder.shipment.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    {shipmentSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{shipmentSuccess}</span>
                      </div>
                    )}

                    {shipmentError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{shipmentError}</span>
                      </div>
                    )}

                    {selectedOrder.shipment ? (
                      <div className="space-y-3">
                        {!isEditingShipment ? (
                          <>
                            {/* Shipment metadata display */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                              <div>
                                <span className="text-slate-500 block text-[10px] uppercase">Courier Partner</span>
                                <span className="font-bold text-slate-900 text-sm">{selectedOrder.shipment.courierName}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px] uppercase">Tracking Consignment</span>
                                {selectedOrder.shipment.trackingUrl ? (
                                  <a
                                    href={selectedOrder.shipment.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#e50914] font-bold hover:underline inline-flex items-center gap-1 text-sm"
                                  >
                                    <span>{selectedOrder.shipment.trackingNumber}</span>
                                    <span>↗</span>
                                  </a>
                                ) : (
                                  <span className="font-bold text-slate-900 text-sm">{selectedOrder.shipment.trackingNumber}</span>
                                )}
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px] uppercase">Est. Delivery</span>
                                <span className="text-slate-700">
                                  {selectedOrder.shipment.estimatedDeliveryAt
                                    ? new Date(selectedOrder.shipment.estimatedDeliveryAt).toLocaleDateString()
                                    : 'Not specified'}
                                </span>
                              </div>
                              {selectedOrder.shipment.dispatchedAt && (
                                <div>
                                  <span className="text-slate-500 block text-[10px] uppercase">Dispatched At</span>
                                  <span className="text-blue-600 font-semibold">
                                    {new Date(selectedOrder.shipment.dispatchedAt).toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {selectedOrder.shipment.deliveredAt && (
                                <div>
                                  <span className="text-slate-500 block text-[10px] uppercase">Delivered At</span>
                                  <span className="text-emerald-700 font-semibold">
                                    {new Date(selectedOrder.shipment.deliveredAt).toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {selectedOrder.shipment.failureReason && (
                                <div className="sm:col-span-2">
                                  <span className="text-rose-600 block text-[10px] uppercase font-bold">Failure Reason</span>
                                  <span className="text-rose-700">{selectedOrder.shipment.failureReason}</span>
                                </div>
                              )}
                            </div>

                            {selectedOrder.shipment.notes && (
                              <div className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                Dispatcher Notes: "{selectedOrder.shipment.notes}"
                              </div>
                            )}

                            {/* Option to Update Shipping Details */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => startEditingShipment(selectedOrder.shipment)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#e50914] hover:text-white text-slate-800 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Update Shipping Details</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          /* Edit Shipping Details Form */
                          <form onSubmit={handleUpdateShipmentDetails} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Truck className="w-3.5 h-3.5 text-[#e50914]" />
                                <span>Update Shipping Details</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsEditingShipment(false)}
                                className="text-slate-500 hover:text-slate-800 text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Courier Partner *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editCourier}
                                  onChange={(e) => setEditCourier(e.target.value)}
                                  placeholder="e.g. BlueDart Express, Delhivery, DHL"
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Tracking / AWB Number *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editTrackingNumber}
                                  onChange={(e) => setEditTrackingNumber(e.target.value)}
                                  placeholder="e.g. BLUEDART1029384"
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Tracking Link / URL (Optional)
                                </label>
                                <input
                                  type="url"
                                  value={editTrackingUrl}
                                  onChange={(e) => setEditTrackingUrl(e.target.value)}
                                  placeholder="https://track.bluedart.com/..."
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Estimated Delivery Date (Optional)
                                </label>
                                <input
                                  type="date"
                                  value={editEstDelivery}
                                  onChange={(e) => setEditEstDelivery(e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Shipment Status
                                </label>
                                <select
                                  value={editShipmentStatus}
                                  onChange={(e) => setEditShipmentStatus(e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                                >
                                  <option value="READY_FOR_DISPATCH">READY FOR DISPATCH</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="IN_TRANSIT">IN TRANSIT</option>
                                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="DELIVERY_FAILED">DELIVERY FAILED</option>
                                  <option value="RETURN_TO_SENDER">RETURN TO SENDER</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Dispatcher Notes (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  placeholder="Internal notes or dispatch comments..."
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                              <button
                                type="submit"
                                disabled={updatingShipment || !editCourier.trim() || !editTrackingNumber.trim()}
                                className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1801] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                              >
                                {updatingShipment ? 'Saving Details...' : 'Save Shipping Details'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingShipment(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ) : (
                      <div>
                        {/* Prepare Shipment Form or Notice */}
                        {selectedOrder.status === 'CANCELLED' ? (
                          <div className="text-xs text-slate-500">
                            Order is cancelled. Consignments cannot be dispatched for cancelled orders.
                          </div>
                        ) : selectedOrder.payments?.some(p => p.status === 'CAPTURED') ? (
                          !isSupport && (
                            <div>
                              {!showCreateShipment ? (
                                <button
                                  type="button"
                                  onClick={() => setShowCreateShipment(true)}
                                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#e50914] hover:text-white text-slate-800 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Prepare &amp; Assign Shipment</span>
                                </button>
                              ) : (
                                <form onSubmit={handleCreateShipment} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                      New Consignment Details
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setShowCreateShipment(false)}
                                      className="text-slate-400 hover:text-slate-700 text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Courier Partner *
                                      </label>
                                      <input
                                        type="text"
                                        value={shipmentCourier}
                                        onChange={(e) => setShipmentCourier(e.target.value)}
                                        placeholder="e.g. BlueDart Express, Delhivery, DHL"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Tracking / AWB Number *
                                      </label>
                                      <input
                                        type="text"
                                        value={shipmentTrackingNumber}
                                        onChange={(e) => setShipmentTrackingNumber(e.target.value)}
                                        placeholder="e.g. BD948201847IN"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Tracking Link / URL (Optional)
                                      </label>
                                      <input
                                        type="url"
                                        value={shipmentTrackingUrl}
                                        onChange={(e) => setShipmentTrackingUrl(e.target.value)}
                                        placeholder="https://track.courier.com/BD948201847IN"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Estimated Delivery Date (Optional)
                                      </label>
                                      <input
                                        type="date"
                                        value={shipmentEstDelivery}
                                        onChange={(e) => setShipmentEstDelivery(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                                      />
                                    </div>
                                    <div className="sm:col-span-2">
                                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Dispatcher Notes (Optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={shipmentNotes}
                                        onChange={(e) => setShipmentNotes(e.target.value)}
                                        placeholder="e.g. Heavy freight, 3 boxes, fragile aluminum chassis"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={creatingShipment || !shipmentCourier || !shipmentTrackingNumber}
                                    className="px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1801] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                                  >
                                    {creatingShipment ? 'Saving Consignment...' : 'Assign Consignment & Ready for Dispatch'}
                                  </button>
                                </form>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="text-xs text-slate-500">
                            Order requires verified captured payment before consignment dispatch can be prepared.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Audit Status History */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                      Immutable Audit History Trail
                    </div>
                    <div className="space-y-2">
                      {selectedOrder.statusHistory?.map((h) => (
                        <div key={h.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusBadge(h.toStatus)}`}>
                                {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}
                              </span>
                              {h.changedByUser && (
                                <span className="text-[11px] text-slate-500">
                                  by {h.changedByUser.fullName || h.changedByUser.email}
                                </span>
                              )}
                            </div>
                            {h.notes && (
                              <div className="text-slate-600 text-[11px] mt-1 pl-1 italic">
                                "{h.notes}"
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

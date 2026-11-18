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
  Download
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

  const isSupport = currentUser?.role === 'SUPPORT';

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
    setShipmentCourier('');
    setShipmentTrackingNumber('');
    setShipmentTrackingUrl('');
    setShipmentEstDelivery('');
    setShipmentNotes('');
    setNewShipmentStatus('');
    setShipmentStatusNotes('');
    setShipmentFailureReason('');

    try {
      const res = await adminApi.getOrderById(orderId);
      setSelectedOrder(res?.data?.order || null);
    } catch (err) {
      setOrderError(err.message || 'Failed to retrieve order details.');
    } finally {
      setOrderLoading(false);
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
      <div className="p-4 rounded-2xl bg-[#0f0003] border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or customer..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-mono uppercase text-neutral-400 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition-colors"
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
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ORDERS LIST TABLE                                        */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-[#0f0003] border border-white/10 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-neutral-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="font-mono text-xs uppercase tracking-wider">Loading Orders...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 font-mono text-xs">
            No orders match the current filter criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-3">Order Number</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Order Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((ord) => {
                    const payStatus = ord.payments?.[0]?.status || (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(ord.status) ? 'CAPTURED' : 'PENDING');
                    return (
                      <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-white">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-medium text-white">{ord.user?.fullName || 'Guest Customer'}</div>
                          <div className="font-mono text-[10px] text-neutral-400">{ord.user?.email || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[11px] text-neutral-300">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-white">
                          {fmt(ord.totalAmount)}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${getPaymentBadge(payStatus)}`}>
                            {payStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusBadge(ord.status)}`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(ord.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-[#e50914] text-neutral-300 hover:text-white font-bold text-[11px] transition-colors"
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
              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-neutral-400">
                <span>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total orders)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => loadOrders(pagination.page - 1)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => loadOrders(pagination.page + 1)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrderId(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <div className="relative z-10 w-full max-w-3xl bg-[#0f0003] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
                  {selectedOrder ? `Order ${selectedOrder.orderNumber}` : 'Order Inspection'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {orderLoading ? (
                <div className="py-16 text-center text-neutral-400 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#e50914] mx-auto" />
                  <div className="font-mono text-xs">Retrieving Order Telemetry...</div>
                </div>
              ) : orderError ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {orderError}
                </div>
              ) : selectedOrder ? (
                <>
                  {/* Status Banner */}
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-neutral-400">Current Status</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${getStatusBadge(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getPaymentBadge(selectedOrder.payments?.[0]?.status || 'PENDING')}`}>
                          Payment: {selectedOrder.payments?.[0]?.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-neutral-400">Total Grand Amount</div>
                      <div className="text-lg font-mono font-black text-white mt-0.5">
                        {fmt(selectedOrder.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Feedback alerts */}
                  {statusSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{statusSuccess}</span>
                    </div>
                  )}

                  {/* Customer & Fulfillment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Profile */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[10px] font-mono uppercase text-[#e50914] font-bold tracking-wider">
                        Customer Driver
                      </div>
                      <div className="text-sm font-bold text-white">{selectedOrder.user?.fullName}</div>
                      <div className="text-xs font-mono text-neutral-300">{selectedOrder.user?.email}</div>
                      {selectedOrder.user?.phone && (
                        <div className="text-xs text-neutral-400">{selectedOrder.user.phone}</div>
                      )}
                    </div>

                    {/* Shipping Address */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                      <div className="text-[10px] font-mono uppercase text-[#e50914] font-bold tracking-wider">
                        Shipping Address
                      </div>
                      {selectedOrder.shippingAddress ? (
                        <div className="text-xs text-neutral-300 leading-relaxed">
                          <div className="font-bold text-white">{selectedOrder.shippingAddress.fullName}</div>
                          <div>{selectedOrder.shippingAddress.street}</div>
                          <div>
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                          </div>
                          <div>{selectedOrder.shippingAddress.country}</div>
                          <div className="text-neutral-400 font-mono text-[11px] mt-1">
                            Phone: {selectedOrder.shippingAddress.phone}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-500">No shipping address recorded.</div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                    <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                      Ordered Hardware ({selectedOrder.items?.length || 0} unique items)
                    </div>
                    <div className="divide-y divide-white/5">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{item.productName}</div>
                            <div className="text-[10px] font-mono text-neutral-400">
                              {item.categorySnapshot} • Qty: {item.quantity} × {fmt(item.unitPrice)}
                            </div>
                          </div>
                          <div className="font-mono font-bold text-white">
                            {fmt(item.totalPrice)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoice Availability */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-neutral-400">Tax Invoice</div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {selectedOrder.invoice ? (
                          <span className="text-emerald-400 font-mono">
                            {selectedOrder.invoice.invoiceNumber} (Status: {selectedOrder.invoice.status})
                          </span>
                        ) : (
                          <span className="text-neutral-500">Invoice generates automatically upon payment capture</span>
                        )}
                      </div>
                    </div>
                    {selectedOrder.invoice && (
                      <button
                        type="button"
                        disabled={downloadingInvoice}
                        onClick={() => handleDownloadInvoice(selectedOrder.invoice)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#e50914] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingInvoice ? 'Downloading...' : 'PDF Invoice'}</span>
                      </button>
                    )}
                  </div>

                  {/* Shipment & Logistics Management Card */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#e50914]" />
                        <span className="text-[10px] font-mono uppercase text-[#e50914] font-bold tracking-wider">
                          Shipment &amp; Logistics Management
                        </span>
                      </div>
                      {selectedOrder.shipment && (
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getShipmentStatusBadge(selectedOrder.shipment.status)}`}>
                          {selectedOrder.shipment.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    {shipmentSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{shipmentSuccess}</span>
                      </div>
                    )}

                    {shipmentError && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{shipmentError}</span>
                      </div>
                    )}

                    {selectedOrder.shipment ? (
                      <div className="space-y-3">
                        {/* Shipment metadata display */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-black/30 p-3 rounded-xl border border-white/5 font-mono">
                          <div>
                            <span className="text-neutral-500 block text-[10px] uppercase">Courier Partner</span>
                            <span className="font-bold text-white">{selectedOrder.shipment.courierName}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block text-[10px] uppercase">Tracking Consignment</span>
                            {selectedOrder.shipment.trackingUrl ? (
                              <a
                                href={selectedOrder.shipment.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#e50914] font-bold hover:underline"
                              >
                                {selectedOrder.shipment.trackingNumber} ↗
                              </a>
                            ) : (
                              <span className="font-bold text-white">{selectedOrder.shipment.trackingNumber}</span>
                            )}
                          </div>
                          <div>
                            <span className="text-neutral-500 block text-[10px] uppercase">Est. Delivery</span>
                            <span className="text-neutral-300">
                              {selectedOrder.shipment.estimatedDeliveryAt
                                ? new Date(selectedOrder.shipment.estimatedDeliveryAt).toLocaleDateString()
                                : 'Not specified'}
                            </span>
                          </div>
                          {selectedOrder.shipment.dispatchedAt && (
                            <div>
                              <span className="text-neutral-500 block text-[10px] uppercase">Dispatched At</span>
                              <span className="text-cyan-400">
                                {new Date(selectedOrder.shipment.dispatchedAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {selectedOrder.shipment.deliveredAt && (
                            <div>
                              <span className="text-neutral-500 block text-[10px] uppercase">Delivered At</span>
                              <span className="text-emerald-400">
                                {new Date(selectedOrder.shipment.deliveredAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {selectedOrder.shipment.failureReason && (
                            <div className="sm:col-span-2">
                              <span className="text-rose-400 block text-[10px] uppercase font-bold">Failure Reason</span>
                              <span className="text-rose-300">{selectedOrder.shipment.failureReason}</span>
                            </div>
                          )}
                        </div>

                        {selectedOrder.shipment.notes && (
                          <div className="text-xs text-neutral-400 italic bg-black/20 p-2.5 rounded-lg border border-white/5">
                            Dispatcher Notes: "{selectedOrder.shipment.notes}"
                          </div>
                        )}

                        {/* Shipment Status Transition Controls (ADMIN only) */}
                        {!isSupport && ALLOWED_SHIPMENT_TRANSITIONS[selectedOrder.shipment.status]?.length > 0 && (
                          <form onSubmit={handleUpdateShipmentStatus} className="pt-2 space-y-2 border-t border-white/5">
                            <div className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                              Advance Logistics Status
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <select
                                  value={newShipmentStatus}
                                  onChange={(e) => setNewShipmentStatus(e.target.value)}
                                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                                  required
                                >
                                  <option value="">Select Next Status</option>
                                  {ALLOWED_SHIPMENT_TRANSITIONS[selectedOrder.shipment.status].map((st) => (
                                    <option key={st} value={st}>
                                      {st.replace(/_/g, ' ')}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={shipmentStatusNotes}
                                  onChange={(e) => setShipmentStatusNotes(e.target.value)}
                                  placeholder="Status notes or hub location..."
                                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                                />
                              </div>
                            </div>
                            {newShipmentStatus === 'DELIVERY_FAILED' && (
                              <div>
                                <input
                                  type="text"
                                  value={shipmentFailureReason}
                                  onChange={(e) => setShipmentFailureReason(e.target.value)}
                                  placeholder="Reason for delivery failure (e.g. consignee unavailable, address incomplete)..."
                                  className="w-full bg-black/60 border border-rose-500/50 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500"
                                  required
                                />
                              </div>
                            )}
                            <button
                              type="submit"
                              disabled={updatingShipmentStatus || !newShipmentStatus}
                              className="px-4 py-1.5 rounded-lg bg-[#e50914] hover:bg-[#ff1801] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all"
                            >
                              {updatingShipmentStatus ? 'Updating...' : 'Update Shipment Status'}
                            </button>
                          </form>
                        )}

                        {/* Shipment Status History Trail */}
                        {selectedOrder.shipment.statusHistory?.length > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <div className="text-[10px] font-mono uppercase text-neutral-500">Logistics History Trail</div>
                            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                              {selectedOrder.shipment.statusHistory.map((h) => (
                                <div key={h.id} className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getShipmentStatusBadge(h.newStatus)}`}>
                                      {h.previousStatus ? `${h.previousStatus} → ${h.newStatus}` : h.newStatus}
                                    </span>
                                    {h.notes && <span className="text-neutral-400 italic">"{h.notes}"</span>}
                                  </div>
                                  <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                                    {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {/* Prepare Shipment Form or Notice */}
                        {selectedOrder.status === 'CANCELLED' ? (
                          <div className="text-xs text-neutral-500 font-mono">
                            Order is cancelled. Consignments cannot be dispatched for cancelled orders.
                          </div>
                        ) : selectedOrder.payments?.some(p => p.status === 'CAPTURED') ? (
                          !isSupport && (
                            <div>
                              {!showCreateShipment ? (
                                <button
                                  type="button"
                                  onClick={() => setShowCreateShipment(true)}
                                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#e50914] text-white text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Prepare &amp; Assign Shipment</span>
                                </button>
                              ) : (
                                <form onSubmit={handleCreateShipment} className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                      New Consignment Details
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setShowCreateShipment(false)}
                                      className="text-neutral-400 hover:text-white text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Courier Partner *
                                      </label>
                                      <input
                                        type="text"
                                        value={shipmentCourier}
                                        onChange={(e) => setShipmentCourier(e.target.value)}
                                        placeholder="e.g. BlueDart Express, Delhivery, DHL"
                                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Tracking / AWB Number *
                                      </label>
                                      <input
                                        type="text"
                                        value={shipmentTrackingNumber}
                                        onChange={(e) => setShipmentTrackingNumber(e.target.value)}
                                        placeholder="e.g. BD948201847IN"
                                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Tracking Link / URL (Optional)
                                      </label>
                                      <input
                                        type="url"
                                        value={shipmentTrackingUrl}
                                        onChange={(e) => setShipmentTrackingUrl(e.target.value)}
                                        placeholder="https://track.courier.com/BD948201847IN"
                                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Estimated Delivery Date (Optional)
                                      </label>
                                      <input
                                        type="date"
                                        value={shipmentEstDelivery}
                                        onChange={(e) => setShipmentEstDelivery(e.target.value)}
                                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                                      />
                                    </div>
                                    <div className="sm:col-span-2">
                                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Dispatcher Notes (Optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={shipmentNotes}
                                        onChange={(e) => setShipmentNotes(e.target.value)}
                                        placeholder="e.g. Heavy freight, 3 boxes, fragile aluminum chassis"
                                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={creatingShipment || !shipmentCourier || !shipmentTrackingNumber}
                                    className="px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1801] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all"
                                  >
                                    {creatingShipment ? 'Saving Consignment...' : 'Assign Consignment & Ready for Dispatch'}
                                  </button>
                                </form>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="text-xs text-neutral-500 font-mono">
                            Order requires verified captured payment before consignment dispatch can be prepared.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Machine Transition Form (ADMIN only) */}
                  {!isSupport && (
                    <div className="p-4 rounded-2xl bg-[#140003] border border-[#e50914]/30 space-y-3">
                      <div className="text-[11px] font-mono font-bold text-[#e50914] uppercase tracking-wider">
                        Update Order Fulfillment Status (State Machine)
                      </div>

                      {ALLOWED_STATUS_TRANSITIONS[selectedOrder.status]?.length > 0 ? (
                        <form onSubmit={handleUpdateStatus} className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                Next Allowed Status
                              </label>
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e50914]"
                                required
                              >
                                <option value="">Select Next Status</option>
                                {ALLOWED_STATUS_TRANSITIONS[selectedOrder.status].map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                Transition Reason / Audit Note (Optional)
                              </label>
                              <input
                                type="text"
                                value={statusNotes}
                                onChange={(e) => setStatusNotes(e.target.value)}
                                placeholder="e.g. Fabrication complete, transferred to carrier"
                                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={updatingStatus || !newStatus}
                            className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1801] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all"
                          >
                            {updatingStatus ? 'Transitioning...' : 'Apply Status Transition'}
                          </button>
                        </form>
                      ) : (
                        <div className="text-xs text-neutral-500 font-mono">
                          Order is in terminal state ({selectedOrder.status}). No further transitions allowed.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audit Status History */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                    <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                      Immutable Audit History Trail
                    </div>
                    <div className="space-y-2">
                      {selectedOrder.statusHistory?.map((h) => (
                        <div key={h.id} className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-start justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getStatusBadge(h.toStatus)}`}>
                                {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}
                              </span>
                              {h.changedByUser && (
                                <span className="text-[11px] text-neutral-400">
                                  by {h.changedByUser.fullName || h.changedByUser.email}
                                </span>
                              )}
                            </div>
                            {h.notes && (
                              <div className="text-neutral-400 text-[11px] mt-1 pl-1 italic">
                                "{h.notes}"
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500 shrink-0">
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

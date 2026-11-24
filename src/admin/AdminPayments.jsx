import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  RefreshCw,
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { fmt } from '../data/products';

export default function AdminPayments({ currentUser, onNavigate }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    try {
      // Retrieve orders with payment associations
      const res = await adminApi.getOrders({
        page: 1,
        limit: 100,
        paymentStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
        search
      });

      const orders = res?.data?.orders || [];
      // Flatten payment records from orders
      const list = [];
      orders.forEach((ord) => {
        if (ord.payments && ord.payments.length > 0) {
          ord.payments.forEach((pay) => {
            list.push({
              id: pay.id,
              orderId: ord.id,
              orderNumber: ord.orderNumber,
              customerName: ord.user?.fullName || 'Guest Customer',
              customerEmail: ord.user?.email || 'N/A',
              reference: pay.providerPaymentId || pay.id,
              amount: pay.amount || ord.totalAmount,
              method: pay.method || 'Manual UPI / Direct Transfer',
              status: pay.status,
              date: pay.verifiedAt || pay.createdAt || ord.createdAt
            });
          });
        }
      });

      setPayments(list);
    } catch (err) {
      setError(err.message || 'Failed to load payments telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPayments();
  };

  const getStatusBadge = (status) => {
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
      {/* FILTER & SEARCH BAR                                      */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-[#0f0003] border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or payment ref..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-mono uppercase text-neutral-400 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition-colors"
          >
            <option value="ALL">All Payments</option>
            <option value="CAPTURED">Captured</option>
            <option value="AUTHORIZED">Authorized</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>

          <button
            type="button"
            onClick={loadPayments}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
            title="Refresh Payments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PAYMENTS TABLE                                           */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-[#0f0003] border border-white/10 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-neutral-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="font-mono text-xs uppercase tracking-wider">Loading Payment Audits...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 font-mono text-xs">
            No payment transaction records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Payment Reference</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {p.orderNumber}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-neutral-300">
                      {p.reference}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-white">{p.customerName}</div>
                      <div className="font-mono text-[10px] text-neutral-400">{p.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {fmt(p.amount)}
                    </td>
                    <td className="py-3.5 px-3 text-neutral-300 font-mono text-[11px]">
                      {p.method}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[11px] text-neutral-400">
                      {new Date(p.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


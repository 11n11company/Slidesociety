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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'AUTHORIZED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* FILTER & SEARCH BAR                                      */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or payment ref..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-600 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914] transition-colors"
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
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Refresh Payments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PAYMENTS TABLE                                           */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="text-xs font-medium text-slate-600">Loading Payment Audits...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm font-medium">
            No payment transaction records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Payment Reference</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {p.orderNumber}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600">
                      {p.reference}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-900">{p.customerName}</div>
                      <div className="text-xs text-slate-500">{p.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {fmt(p.amount)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 text-xs">
                      {p.method}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-xs text-slate-500">
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


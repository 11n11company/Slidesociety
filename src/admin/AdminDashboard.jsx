import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Eye,
  RefreshCw,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { fmt } from '../data/products';

export default function AdminDashboard({ onNavigate, onViewOrder }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getOverview();
      setOverview(res?.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#e50914]" />
        <span className="font-mono text-xs uppercase tracking-wider">Loading Dashboard Telemetry...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <span>Error Loading Dashboard</span>
        </div>
        <p className="text-xs">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { sales, orders, customers, products, recentOrders = [] } = overview || {};
  const latestFiveOrders = recentOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* ======================================================== */}
      {/* 4 SUMMARY METRIC CARDS                                   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Revenue */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#e50914]/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#e50914]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {sales?.totalRevenue !== undefined ? fmt(sales.totalRevenue) : '₹0'}
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>This month: {fmt(sales?.currentMonth || 0)}</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#e50914]/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {orders?.total || 0}
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            {(orders?.confirmed || 0) + (orders?.processing || 0) + (orders?.pending || 0)} pending / in fabrication
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#e50914]/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Total Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {customers?.total || 0}
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            +{customers?.newThisMonth || 0} new registrations this month
          </div>
        </div>

        {/* Card 4: Total Products */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#e50914]/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {products?.total || 0}
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            {products?.active || 0} active ({products?.outOfStock || 0} out of stock)
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RECENT ORDERS TABLE (LATEST 5)                           */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e50914]" />
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-slate-900">
              Recent Orders
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/admin/orders')}
            className="flex items-center gap-1.5 text-xs text-[#e50914] hover:text-[#ff1801] font-bold uppercase tracking-wider transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {latestFiveOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            No customer orders recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestFiveOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-900">{ord.customerName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                      {new Date(ord.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {fmt(ord.totalAmount)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusBadge(ord.orderStatus)}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (onViewOrder) {
                            onViewOrder(ord.id);
                          } else {
                            onNavigate('/admin/orders');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#e50914] text-slate-700 hover:text-white font-bold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
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

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  ShieldCheck,
  ShoppingBag,
  DollarSign,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { fmt } from '../data/products';

export default function AdminCustomers({ currentUser }) {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // Customer Detail Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState('');

  const loadCustomers = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getCustomers({
        page,
        limit: 15,
        search
      });
      setCustomers(res?.data?.customers || []);
      setPagination(res?.data?.pagination || { page: 1, limit: 15, totalCount: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers(1);
  };

  // Open Customer Detail
  const handleOpenDetail = async (customerId) => {
    setSelectedCustomerId(customerId);
    setCustomerLoading(true);
    setCustomerError('');

    try {
      const res = await adminApi.getCustomerById(customerId);
      setSelectedCustomer(res?.data?.customer || null);
    } catch (err) {
      setCustomerError(err.message || 'Failed to retrieve customer telemetry.');
    } finally {
      setCustomerLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* SEARCH BAR                                               */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver by name or email..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        <button
          type="button"
          onClick={() => loadCustomers(pagination.page)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
          title="Refresh Customer List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* CUSTOMERS TABLE                                          */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="font-mono text-xs uppercase tracking-wider">Loading Customer Directory...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs">
            No customers found matching this search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3">Driver Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Registration Date</th>
                  <th className="py-3 px-3">Orders</th>
                  <th className="py-3 px-3">Lifetime Spend</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{c.fullName || 'Anonymous Driver'}</span>
                        {c.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Driver" />
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">ID: {c.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      {c.email}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-900">
                      {c.orderCount || 0} orders
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {fmt(c.totalSpent || 0)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(c.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#e50914] text-slate-700 hover:text-white border border-slate-200 font-bold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* CUSTOMER DETAIL MODAL                                    */}
      {/* ======================================================== */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedCustomerId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <div className="relative z-10 w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-slate-900">
                  Driver Profile & History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {customerLoading ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#e50914] mx-auto" />
                  <div className="font-mono text-xs">Retrieving Driver Profile...</div>
                </div>
              ) : customerError ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {customerError}
                </div>
              ) : selectedCustomer ? (
                <>
                  {/* Driver Header Summary */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-2xl uppercase text-slate-900">
                          {selectedCustomer.fullName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border bg-slate-100 text-slate-700 border-slate-200">
                          {selectedCustomer.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> {selectedCustomer.email}
                        </span>
                        {selectedCustomer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> {selectedCustomer.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-slate-500">Total Lifetime Spend</div>
                      <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                        {fmt(selectedCustomer.totalSpent || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Customer Order History */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-semibold">
                        Order History ({selectedCustomer.orders?.length || 0} orders)
                      </div>
                    </div>

                    {selectedCustomer.orders?.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 font-mono text-xs">
                        This customer has not placed any orders yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedCustomer.orders?.map((ord) => (
                          <div
                            key={ord.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-mono font-bold text-slate-900">{ord.orderNumber}</div>
                              <div className="text-[10px] font-mono text-slate-500">
                                {new Date(ord.createdAt).toLocaleDateString()} • {ord.items?.length || 0} items
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-right">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border bg-slate-100 text-slate-700 border-slate-200">
                                {ord.status}
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                {fmt(ord.totalAmount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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


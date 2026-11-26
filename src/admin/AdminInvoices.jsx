import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Download,
  Send,
  X
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { fmt } from '../data/products';

export default function AdminInvoices({ currentUser }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  // Search
  const [search, setSearch] = useState('');

  const loadInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getOrders({
        page: 1,
        limit: 100,
        search
      });

      const orders = res?.data?.orders || [];
      const list = [];
      orders.forEach((ord) => {
        if (ord.invoice) {
          list.push({
            id: ord.invoice.id,
            invoiceNumber: ord.invoice.invoiceNumber,
            orderId: ord.id,
            orderNumber: ord.orderNumber,
            customerName: ord.user?.fullName || 'Guest Customer',
            customerEmail: ord.user?.email || 'N/A',
            issueDate: ord.invoice.issuedAt || ord.createdAt,
            amount: ord.totalAmount,
            status: ord.invoice.status,
            emailStatus: ord.invoice.status === 'SENT' ? 'Sent' : 'Generated'
          });
        }
      });

      setInvoices(list);
    } catch (err) {
      setError(err.message || 'Failed to retrieve invoice logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadInvoices();
  };

  // Download PDF Action
  const handleDownload = async (inv) => {
    setDownloadingId(inv.id);
    setError('');
    setActionSuccess('');

    try {
      await adminApi.downloadInvoice(inv.id, `${inv.invoiceNumber}.pdf`);
      setActionSuccess(`Invoice ${inv.invoiceNumber} downloaded successfully.`);
    } catch (err) {
      setError(err.message || 'Failed to stream invoice PDF binary.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Resend Email Action
  const handleResend = async (inv) => {
    setResendingId(inv.id);
    setError('');
    setActionSuccess('');

    try {
      const res = await adminApi.resendInvoice(inv.id);
      setActionSuccess(res?.message || `Invoice email request dispatched for ${inv.invoiceNumber}.`);
    } catch (err) {
      setError(err.message || 'Failed to trigger invoice email dispatch.');
    } finally {
      setResendingId(null);
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
            placeholder="Search invoice or order number..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        <button
          type="button"
          onClick={loadInvoices}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
          title="Refresh Invoices"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button type="button" onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* INVOICES TABLE                                           */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="text-xs font-medium text-slate-600">Loading Issued Invoices...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm font-medium">
            No tax invoices generated yet. Invoices generate automatically once an order payment is captured.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3">Invoice Number</th>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Email Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-[#e50914]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600">
                      {inv.orderNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-900">{inv.customerName}</div>
                      <div className="text-xs text-slate-500">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-500">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {fmt(inv.amount)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border bg-slate-100 text-slate-700 border-slate-200">
                        {inv.emailStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={downloadingId === inv.id}
                          onClick={() => handleDownload(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#e50914] text-slate-700 hover:text-white border border-slate-200 font-semibold text-xs transition-colors disabled:opacity-50"
                          title="Download PDF Invoice"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingId === inv.id ? 'Saving...' : 'PDF'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={resendingId === inv.id}
                          onClick={() => handleResend(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-[11px] transition-colors disabled:opacity-50"
                          title="Resend Email"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{resendingId === inv.id ? 'Sending...' : 'Resend'}</span>
                        </button>
                      </div>
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


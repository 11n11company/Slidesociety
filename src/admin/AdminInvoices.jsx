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
      <div className="p-4 rounded-2xl bg-[#0f0003] border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or order number..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        <button
          type="button"
          onClick={loadInvoices}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
          title="Refresh Invoices"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button type="button" onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError('')} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* INVOICES TABLE                                           */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-[#0f0003] border border-white/10 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-neutral-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="font-mono text-xs uppercase tracking-wider">Loading Issued Invoices...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 font-mono text-xs">
            No tax invoices generated yet. Invoices generate automatically once an order payment is captured.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-3">Invoice Number</th>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Email Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#e50914]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-neutral-300">
                      {inv.orderNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-white">{inv.customerName}</div>
                      <div className="font-mono text-[10px] text-neutral-400">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-neutral-400">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {fmt(inv.amount)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border bg-white/5 text-neutral-300 border-white/10">
                        {inv.emailStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={downloadingId === inv.id}
                          onClick={() => handleDownload(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#e50914] text-neutral-300 hover:text-white font-bold text-[11px] transition-colors disabled:opacity-50"
                          title="Download PDF Invoice"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingId === inv.id ? 'Saving...' : 'PDF'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={resendingId === inv.id}
                          onClick={() => handleResend(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white font-bold text-[11px] transition-colors disabled:opacity-50"
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


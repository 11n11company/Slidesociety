import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Edit2,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { fmt } from '../data/products';

export default function AdminInventory({ currentUser }) {
  const [inventory, setInventory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentMode, setAdjustmentMode] = useState('absolute'); // 'absolute' | 'delta'
  const [stockInput, setStockInput] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const isSupport = currentUser?.role === 'SUPPORT';

  const loadInventory = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getInventory({
        page,
        limit: 20,
        status: statusFilter,
        search
      });
      setInventory(res?.data?.inventory || []);
      setPagination(res?.data?.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load inventory stock.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadInventory(1);
  };

  // Open Adjust Modal
  const handleOpenAdjust = (prod) => {
    if (isSupport) return;
    setSelectedProduct(prod);
    setAdjustmentMode('absolute');
    setStockInput(String(prod.stockQuantity));
    setAdjustError('');
  };

  // Submit Stock Update
  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct || isSupport) return;

    setAdjustError('');
    setSuccessMsg('');

    const num = parseInt(stockInput, 10);
    if (isNaN(num)) {
      setAdjustError('Please enter a valid whole number for stock adjustment.');
      return;
    }

    if (adjustmentMode === 'absolute' && num < 0) {
      setAdjustError('Stock quantity cannot be negative.');
      return;
    }

    if (adjustmentMode === 'delta' && selectedProduct.stockQuantity + num < 0) {
      setAdjustError(`Adjustment of ${num} would result in negative stock (${selectedProduct.stockQuantity + num}). Minimum adjustment is -${selectedProduct.stockQuantity}.`);
      return;
    }

    setAdjusting(true);

    try {
      const payload = adjustmentMode === 'absolute' ? { stockQuantity: num } : { delta: num };
      const res = await adminApi.updateStock(selectedProduct.id, payload);
      setSuccessMsg(`Stock for '${selectedProduct.name}' updated to ${res?.data?.currentStock ?? num} units.`);
      setSelectedProduct(null);
      loadInventory(pagination.page);
    } catch (err) {
      setAdjustError(err.message || 'Failed to update stock quantity.');
    } finally {
      setAdjusting(false);
    }
  };

  const getStockStatusPill = (status, qty) => {
    if (qty <= 0 || status === 'OUT_OF_STOCK') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border bg-rose-500/15 text-rose-400 border-rose-500/30 flex items-center gap-1 w-fit">
          <AlertTriangle className="w-3 h-3" /> Out of Stock
        </span>
      );
    }
    if (qty <= 5 || status === 'LOW_STOCK') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border bg-amber-500/15 text-amber-400 border-amber-500/30 flex items-center gap-1 w-fit">
          <AlertCircle className="w-3 h-3" /> Low Stock ({qty})
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 w-fit">
        In Stock ({qty})
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* FILTER & SEARCH BAR                                      */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-[#0f0003] border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory items..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        {/* Stock Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-mono uppercase text-neutral-400 shrink-0">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition-colors"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            <option value="LOW_STOCK">Low Stock (1-5)</option>
            <option value="IN_STOCK">In Stock (&gt;5)</option>
          </select>

          <button
            type="button"
            onClick={() => loadInventory(pagination.page)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">
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
      {/* INVENTORY TABLE                                          */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-[#0f0003] border border-white/10 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-neutral-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="font-mono text-xs uppercase tracking-wider">Auditing Stock Levels...</span>
          </div>
        ) : inventory.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 font-mono text-xs">
            No inventory items matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Current Stock</th>
                  <th className="py-3 px-3">Stock Status</th>
                  <th className="py-3 px-3">Catalog Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="font-mono text-[10px] text-neutral-400">{item.id}</div>
                    </td>
                    <td className="py-3.5 px-3 text-neutral-300 font-mono text-[11px]">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-base text-white">
                      {item.stockQuantity}
                    </td>
                    <td className="py-3.5 px-3">
                      {getStockStatusPill(item.stockStatus, item.stockQuantity)}
                    </td>
                    <td className="py-3.5 px-3">
                      {item.isAvailable ? (
                        <span className="text-[11px] text-emerald-400 font-medium">Available</span>
                      ) : (
                        <span className="text-[11px] text-neutral-500">Deactivated</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {!isSupport ? (
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-[#e50914] text-neutral-300 hover:text-white font-bold text-[11px] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Update Stock</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-500">Read Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ADJUST STOCK MODAL                                       */}
      {/* ======================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <div className="relative z-10 w-full max-w-md bg-[#0f0003] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
                  Adjust Inventory Stock
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-xs font-bold text-white">{selectedProduct.name}</div>
              <div className="text-[11px] font-mono text-neutral-400">
                Current Stock: <strong className="text-white">{selectedProduct.stockQuantity} units</strong>
              </div>
            </div>

            {adjustError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAdjustment} className="space-y-4">
              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/60 border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustmentMode('absolute');
                    setStockInput(String(selectedProduct.stockQuantity));
                    setAdjustError('');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    adjustmentMode === 'absolute'
                      ? 'bg-white/15 text-white shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Set Absolute
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdjustmentMode('delta');
                    setStockInput('0');
                    setAdjustError('');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    adjustmentMode === 'delta'
                      ? 'bg-white/15 text-white shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Add / Deduct (+/-)
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  {adjustmentMode === 'absolute' ? 'New Total Stock Quantity' : 'Adjustment Delta (+ / -)'}
                </label>
                <input
                  type="number"
                  required
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  placeholder={adjustmentMode === 'absolute' ? 'e.g. 50' : 'e.g. 10 or -5'}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#e50914]"
                />
              </div>

              {/* Real-time Projected Stock Preview */}
              {(() => {
                const num = parseInt(stockInput, 10);
                if (isNaN(num)) return null;
                const projected = adjustmentMode === 'absolute' ? num : selectedProduct.stockQuantity + num;
                return (
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between font-mono ${
                    projected < 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-black/30 border-white/5 text-neutral-300'
                  }`}>
                    <span>Projected Stock:</span>
                    <strong className={projected < 0 ? 'text-rose-400' : 'text-white'}>
                      {projected} units {projected < 0 ? '(Negative prohibited!)' : ''}
                    </strong>
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1801] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#e50914]/20"
                >
                  {adjusting ? 'Updating...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


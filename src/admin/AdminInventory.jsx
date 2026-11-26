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

  const isSupport = false;

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
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1 w-fit">
          <AlertTriangle className="w-3 h-3" /> Out of Stock
        </span>
      );
    }
    if (qty <= 5 || status === 'LOW_STOCK') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 w-fit">
          <AlertCircle className="w-3 h-3" /> Low Stock ({qty})
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
        In Stock ({qty})
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* FILTER & SEARCH BAR                                      */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory items..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        {/* Stock Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold uppercase text-slate-500 shrink-0">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914] transition-colors"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            <option value="LOW_STOCK">Low Stock (1-5)</option>
            <option value="IN_STOCK">In Stock (&gt;5)</option>
          </select>

          <button
            type="button"
            onClick={() => loadInventory(pagination.page)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
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
      {/* INVENTORY TABLE                                          */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Auditing Stock Levels...</span>
          </div>
        ) : inventory.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No inventory items matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Current Stock</th>
                  <th className="py-3 px-3">Stock Status</th>
                  <th className="py-3 px-3">Catalog Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.id}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 text-xs">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-base text-slate-900">
                        {item.availableQuantity !== undefined ? item.availableQuantity : item.stockQuantity}
                        <span className="text-xs text-slate-500 font-normal ml-1">avail</span>
                      </div>
                      {item.reservedQuantity > 0 && (
                        <div className="text-xs text-amber-600 font-medium">
                          {item.physicalStock || item.stockQuantity} physical ({item.reservedQuantity} reserved)
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {getStockStatusPill(item.stockStatus, item.availableQuantity !== undefined ? item.availableQuantity : item.stockQuantity)}
                    </td>
                    <td className="py-3.5 px-3">
                      {item.isAvailable ? (
                        <span className="text-xs text-emerald-700 font-semibold">Available</span>
                      ) : (
                        <span className="text-xs text-slate-400">Deactivated</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {!isSupport ? (
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#e50914] text-slate-700 hover:text-white border border-slate-200 font-semibold text-xs transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Update Stock</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Read Only</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <div className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-2xl max-h-[92dvh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                <h3 className="font-bold text-xl text-slate-900 tracking-tight">
                  Adjust Inventory Stock
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-900">{selectedProduct.name}</div>
              <div className="text-xs text-slate-500">
                Current Stock: <strong className="text-slate-900">{selectedProduct.stockQuantity} units</strong>
              </div>
            </div>

            {adjustError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAdjustment} className="space-y-4">
              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustmentMode('absolute');
                    setStockInput(String(selectedProduct.stockQuantity));
                    setAdjustError('');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    adjustmentMode === 'absolute'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
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
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Add / Deduct (+/-)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  {adjustmentMode === 'absolute' ? 'New Total Stock Quantity' : 'Adjustment Delta (+ / -)'}
                </label>
                <input
                  type="number"
                  required
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  placeholder={adjustmentMode === 'absolute' ? 'e.g. 50' : 'e.g. 10 or -5'}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#e50914]"
                />
              </div>

              {/* Real-time Projected Stock Preview */}
              {(() => {
                const num = parseInt(stockInput, 10);
                if (isNaN(num)) return null;
                const projected = adjustmentMode === 'absolute' ? num : selectedProduct.stockQuantity + num;
                return (
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    projected < 0
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <span>Projected Stock:</span>
                    <strong className={projected < 0 ? 'text-rose-700 font-bold' : 'text-slate-900'}>
                      {projected} units {projected < 0 ? '(Negative prohibited!)' : ''}
                    </strong>
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
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


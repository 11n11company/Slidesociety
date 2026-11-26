import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Image,
  DollarSign,
  Upload
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { fmt, updateSingleLiveProduct } from '../data/products';

export default function AdminProducts({ currentUser }) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cockpit frames');
  const [priceInr, setPriceInr] = useState('');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [specDescription, setSpecDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMeta, setImageMeta] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);

  // Deactivate / Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const isSupport = false;

  const loadProducts = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getProducts({
        page,
        limit: 20,
        search,
        category: categoryFilter
      });
      setProducts(res?.data?.products || []);
      setPagination(res?.data?.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load catalog products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts(1);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    if (isSupport) return;
    setIsEditing(false);
    setEditingId(null);
    setId('');
    setName('');
    setCategory('Cockpit frames');
    setPriceInr('');
    setStockQuantity('20');
    setSpecDescription('');
    setImageUrl('/hero-backdrop-hd.jpg');
    setImageMeta(null);
    setIsAvailable(true);
    setFormError('');
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p) => {
    if (isSupport) return;
    setIsEditing(true);
    setEditingId(p.id);
    setId(p.id);
    setName(p.name || p.title || '');
    setCategory(p.category || 'Cockpit frames');
    setPriceInr(String(p.priceInr || p.price || ''));
    setStockQuantity(String(p.stockQuantity !== undefined ? p.stockQuantity : 20));
    setSpecDescription(p.specDescription || p.description || '');
    setImageUrl(p.imageUrl || '/hero-backdrop-hd.jpg');
    setImageMeta(null);
    setIsAvailable(Boolean(p.isAvailable));
    setFormError('');
    setShowModal(true);
  };

  // Handle Direct Image File Upload from device
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setFormError('Unsupported format. Please upload a PNG, JPG, JPEG, WEBP, or GIF image.');
      return;
    }

    // Limit to 5MB to ensure snappy updates and safe payload sizes
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setFormError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const result = event.target.result;
        setImageUrl(result);

        // Read original image dimensions without any destructive downsampling or cropping
        const tempImg = new window.Image();
        tempImg.onload = () => {
          setImageMeta({
            width: tempImg.naturalWidth,
            height: tempImg.naturalHeight,
            ratio: (tempImg.naturalWidth / tempImg.naturalHeight).toFixed(3)
          });
        };
        tempImg.src = result;
      }
    };
    reader.onerror = () => {
      setFormError('Failed to read image file from device.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    // Form Validations
    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    const numPrice = Number(priceInr);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Price must be greater than zero.');
      return;
    }
    const numStock = parseInt(stockQuantity, 10);
    if (isNaN(numStock) || numStock < 0) {
      setFormError('Stock quantity cannot be negative.');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Product image URL or file is required.');
      return;
    }

    setFormLoading(true);

    try {
      let savedProduct = null;
      if (isEditing) {
        const res = await adminApi.updateProduct(editingId, {
          name: name.trim(),
          category: category.trim(),
          priceInr: numPrice,
          stockQuantity: numStock,
          specDescription: specDescription.trim(),
          imageUrl: imageUrl.trim(),
          isAvailable
        });
        savedProduct = res?.data?.product || {
          id: editingId,
          name: name.trim(),
          category: category.trim(),
          priceInr: numPrice,
          stockQuantity: numStock,
          specDescription: specDescription.trim(),
          imageUrl: imageUrl.trim(),
          isAvailable
        };
        setSuccessMsg(`Product '${name}' updated successfully.`);
      } else {
        const cleanSlug = id.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        if (!cleanSlug) {
          throw new Error('Please enter a valid product identifier slug.');
        }
        const res = await adminApi.createProduct({
          id: cleanSlug,
          name: name.trim(),
          category: category.trim(),
          priceInr: numPrice,
          stockQuantity: numStock,
          specDescription: specDescription.trim() || 'Precision motorsport simulator hardware.',
          imageUrl: imageUrl.trim(),
          isAvailable
        });
        savedProduct = res?.data?.product || {
          id: cleanSlug,
          name: name.trim(),
          category: category.trim(),
          priceInr: numPrice,
          stockQuantity: numStock,
          specDescription: specDescription.trim(),
          imageUrl: imageUrl.trim(),
          isAvailable
        };
        setSuccessMsg(`New product '${name}' created successfully.`);
      }

      // Immediately propagate updated product to live memory and dispatch global event
      if (savedProduct) {
        updateSingleLiveProduct(savedProduct);
        window.dispatchEvent(
          new CustomEvent('slidescoiety:products-updated', { detail: savedProduct })
        );
      }

      setShowModal(false);
      loadProducts(pagination.page);
    } catch (err) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Deactivate / Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete || isSupport) return;
    setDeleting(true);
    setError('');

    try {
      const res = await adminApi.deleteProduct(productToDelete.id);
      setSuccessMsg(res.message || `Product '${productToDelete.name}' processed successfully.`);
      
      // Notify active storefront views
      window.dispatchEvent(
        new CustomEvent('slidescoiety:products-updated', {
          detail: { id: productToDelete.id, isAvailable: false }
        })
      );

      setProductToDelete(null);
      loadProducts(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to deactivate product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* ACTION & FILTER BAR                                      */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914] transition-colors"
          >
            <option value="ALL">All Categories</option>
            <option value="Wheelbase">Wheelbase</option>
            <option value="Steering Wheel">Steering Wheel</option>
            <option value="Pedals">Pedals</option>
            <option value="Cockpit">Cockpit</option>
            <option value="Motion System">Motion System</option>
            <option value="Monitor Stand">Monitor Stand</option>
            <option value="Seat">Seat</option>
            <option value="Shifter">Shifter</option>
            <option value="Handbrake">Handbrake</option>
            <option value="Monitor">Monitor</option>
            <option value="Sim PC">Sim PC</option>
            <option value="Accessories">Accessories</option>
            <option value="Cockpit frames">Cockpit frames (Legacy)</option>
            <option value="Racing seats">Racing seats (Legacy)</option>
            <option value="Wheel bases">Wheel bases (Legacy)</option>
            <option value="Bundles">Bundles</option>
          </select>

          {/* Add Product Button (ADMIN only) */}
          {!isSupport && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1801] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#e50914]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
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

      {/* Error Notification */}
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
      {/* PRODUCTS TABLE                                           */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#e50914]" />
            <span className="font-mono text-xs uppercase tracking-wider">Loading Catalog Products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs">
            No products found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Availability</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl || '/hero-backdrop-hd.jpg'}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-contain object-center bg-slate-100 border border-slate-200 shrink-0 p-0.5"
                          onError={(e) => {
                            e.target.src = '/hero-backdrop-hd.jpg';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate max-w-xs">{prod.name}</div>
                          <div className="font-mono text-[10px] text-slate-500 truncate">{prod.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                      {prod.category}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {fmt(prod.priceInr || prod.price)}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className={prod.stockQuantity <= 0 ? 'text-rose-600 font-bold' : prod.stockQuantity <= 5 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                        {prod.stockQuantity} units
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {prod.isAvailable ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border bg-slate-100 text-slate-600 border-slate-200">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {!isSupport ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(prod)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 transition-colors"
                            title="Deactivate / Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">Read Only</span>
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
      {/* ADD / EDIT PRODUCT MODAL                                 */}
      {/* ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-slate-900">
                  {isEditing ? `Edit Product: ${name}` : 'Add Catalog Product'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {!isEditing && (
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-600 mb-1">
                    Product Slug ID (lowercase-hyphens)
                  </label>
                  <input
                    type="text"
                    required
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="e.g. active-pedal-v2"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 mb-1">
                  Product Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ActiveForce Haptic Pedal Upgrade"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#e50914]"
                  >
                    <option value="Wheelbase">Wheelbase</option>
                    <option value="Steering Wheel">Steering Wheel</option>
                    <option value="Pedals">Pedals</option>
                    <option value="Cockpit">Cockpit</option>
                    <option value="Motion System">Motion System</option>
                    <option value="Monitor Stand">Monitor Stand</option>
                    <option value="Seat">Seat</option>
                    <option value="Shifter">Shifter</option>
                    <option value="Handbrake">Handbrake</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Sim PC">Sim PC</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Cockpit frames">Cockpit frames (Legacy)</option>
                    <option value="Racing seats">Racing seats (Legacy)</option>
                    <option value="Wheel bases">Wheel bases (Legacy)</option>
                    <option value="Bundles">Bundles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-600 mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={priceInr}
                    onChange={(e) => setPriceInr(e.target.value)}
                    placeholder="e.g. 48999"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-600 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-600 mb-1">
                    Catalog Availability
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                      isAvailable
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  >
                    {isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isAvailable ? 'Active' : 'Disabled'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 mb-1">
                  Product Image / Photo
                </label>

                {/* Live Photo Preview Box */}
                <div className="mb-2 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-48 flex items-center justify-center p-2">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-full h-full object-contain object-center"
                      onLoad={(e) => {
                        if (e.target.naturalWidth && e.target.naturalHeight) {
                          setImageMeta({
                            width: e.target.naturalWidth,
                            height: e.target.naturalHeight,
                            ratio: (e.target.naturalWidth / e.target.naturalHeight).toFixed(3)
                          });
                        }
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/hero-backdrop-hd.jpg';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <Image className="w-8 h-8 opacity-40" />
                      <span className="text-[11px] font-mono">No photo selected</span>
                    </div>
                  )}

                  {imageUrl && imageMeta && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-slate-200 font-mono text-[10px] text-slate-700 pointer-events-none shadow-sm">
                      {imageMeta.width} × {imageMeta.height} px ({imageMeta.ratio}:1)
                    </span>
                  )}

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImageMeta(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors shadow-sm"
                      title="Clear photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Upload from Device or Paste URL Controls */}
                <div className="space-y-2">
                  <div>
                    <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-mono font-bold text-slate-700 transition-all shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-[#e50914]" />
                      <span>Upload Photo from Device (PNG / JPG / WEBP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase text-slate-500 mb-0.5">
                      Or Direct Image URL / Path
                    </label>
                    <input
                      type="text"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://... or /hero-backdrop-hd.jpg"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 mb-1">
                  Specifications & Description
                </label>
                <textarea
                  rows="3"
                  value={specDescription}
                  onChange={(e) => setSpecDescription(e.target.value)}
                  placeholder="Technical motorsport specifications..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1801] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#e50914]/20"
                >
                  {formLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DEACTIVATE CONFIRMATION MODAL                            */}
      {/* ======================================================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setProductToDelete(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <div className="relative z-10 w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-slate-900">
                Deactivate / Delete Product
              </h3>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Are you sure you want to deactivate <strong>{productToDelete.name}</strong>?
            </p>
            <p className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              <strong>Relational Safety Protection:</strong> If this product is referenced in historical customer orders, it will not be permanently deleted—it will be safely deactivated to preserve invoice and order records.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                {deleting ? 'Processing...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


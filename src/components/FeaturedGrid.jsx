import React, { useState, useEffect, useMemo, useRef } from 'react';
import ProductCard from './ProductCard';
import { categories as fallbackCategories, products as localProducts } from '../data/products';
import { productApi } from '../services/productApi';
import { ArrowRight, SlidersHorizontal, Search, X, RotateCcw, Filter } from 'lucide-react';

export default function FeaturedGrid({
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onOpenDetail,
  selectedCategory,
  onSelectCategory,
  onNavigateToShop,
  isFullShop = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [availableCategories, setAvailableCategories] = useState(fallbackCategories);
  const [serverProducts, setServerProducts] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounce search query to prevent excessive API invocations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load distinct categories on mount
  useEffect(() => {
    productApi.getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setAvailableCategories(cats);
      }
    });
  }, []);

  // Compute numeric min/max price bounds from priceFilter state
  const { minPrice, maxPrice } = useMemo(() => {
    if (priceFilter === 'under25k') return { minPrice: undefined, maxPrice: '25000' };
    if (priceFilter === '25k-75k') return { minPrice: '25000', maxPrice: '75000' };
    if (priceFilter === '75k-150k') return { minPrice: '75000', maxPrice: '150000' };
    if (priceFilter === 'over150k') return { minPrice: '150000', maxPrice: undefined };
    if (priceFilter === 'custom') {
      const min = customMinPrice !== '' && !isNaN(Number(customMinPrice)) ? customMinPrice : undefined;
      const max = customMaxPrice !== '' && !isNaN(Number(customMaxPrice)) ? customMaxPrice : undefined;
      return { minPrice: min, maxPrice: max };
    }
    return { minPrice: undefined, maxPrice: undefined };
  }, [priceFilter, customMinPrice, customMaxPrice]);

  // Fetch filtered and sorted products when discovery parameters change
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const params = {
      category: selectedCategory,
      search: debouncedSearch,
      minPrice,
      maxPrice,
      sortBy
    };

    productApi.getProducts(params)
      .then((res) => {
        if (!isCancelled && res?.products) {
          setServerProducts(res.products);
        }
      })
      .catch((err) => {
        console.warn('Error fetching products:', err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, debouncedSearch, minPrice, maxPrice, sortBy]);

  // Determine active products list
  const activeProducts = useMemo(() => {
    if (serverProducts) return serverProducts;
    return localProducts;
  }, [serverProducts]);

  // Items to display: top 6 starting grid items for home view, full filtered list for shop view
  const displayItems = isFullShop ? activeProducts : activeProducts.slice(0, 6);

  // Check if any filter is actively applied
  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    (selectedCategory && selectedCategory !== 'All') ||
    priceFilter !== 'all' ||
    customMinPrice !== '' ||
    customMaxPrice !== '' ||
    sortBy !== 'featured'
  );

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setPriceFilter('all');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setSortBy('featured');
    onSelectCategory('All');
  };

  return (
    <section className="py-14 sm:py-20 max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12" id="products-section">
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#e50914] font-mono text-[11px] font-bold tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
            {isFullShop ? 'COMPLETE HARDWARE CATALOG' : 'CHAMPIONSHIP HARDWARE'}
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight leading-none">
            {isFullShop ? 'SHOP THE GRID.' : 'THE STARTING GRID.'}
          </h2>
        </div>

        {!isFullShop && (
          <button
            type="button"
            onClick={onNavigateToShop}
            className="group inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-neutral-300 hover:text-[#e50914] transition-colors"
          >
            <span>Explore All Hardware</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>

      {/* Discovery, Filter, and Category Controls (Full Shop View) */}
      {isFullShop && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 space-y-4">
          {/* Main Controls Grid: Search, Price, Sort */}
          <div className="grid sm:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              <input
                type="search"
                placeholder="Search cockpits, wheelbases, load-cells, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#e50914] transition-colors"
                aria-label="Search hardware catalog"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Price Filter Selector */}
            <div className="sm:col-span-3">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] transition-colors cursor-pointer"
                aria-label="Filter by price range"
              >
                <option value="all">Any Price Range</option>
                <option value="under25k">Under ₹25,000</option>
                <option value="25k-75k">₹25,000 – ₹75,000</option>
                <option value="75k-150k">₹75,000 – ₹150,000</option>
                <option value="over150k">Over ₹150,000</option>
                <option value="custom">Custom Price Range...</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] transition-colors cursor-pointer"
                aria-label="Sort product catalog"
              >
                <option value="featured">Featured First (Default)</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Custom Price Range Inputs (shown only when custom is chosen) */}
          {priceFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 pt-3 pb-1 border-t border-white/5 animate-fadeIn">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                Price Range (₹):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min ₹"
                  value={customMinPrice}
                  onChange={(e) => setCustomMinPrice(e.target.value)}
                  className="w-28 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#e50914]"
                />
                <span className="text-neutral-500 text-xs">to</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max ₹"
                  value={customMaxPrice}
                  onChange={(e) => setCustomMaxPrice(e.target.value)}
                  className="w-28 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>
          )}

          {/* Category Pills Navigation */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                    : 'bg-black/40 text-neutral-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Result Count and Clear Filters Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2 font-mono text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                Showing <strong className="text-white font-bold">{displayItems.length}</strong>{' '}
                {displayItems.length === 1 ? 'component' : 'components'}
                {selectedCategory !== 'All' && <span> in <span className="text-[#e50914]">{selectedCategory}</span></span>}
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-[#e50914] transition-colors py-1 px-2.5 rounded-lg bg-white/5 hover:bg-[#e50914]/10 border border-white/10 hover:border-[#e50914]/30"
              >
                <RotateCcw className="w-3 h-3 text-[#e50914]" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Cards Grid */}
      <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${loading ? 'opacity-70' : 'opacity-100'}`}>
        {displayItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            isWishlisted={wishlist.includes(product.id)}
            onToggleWishlist={onToggleWishlist}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>

      {/* Empty State when no products match criteria */}
      {displayItems.length === 0 && (
        <div className="text-center py-16 px-4 bg-[#111111] rounded-2xl border border-white/10 max-w-xl mx-auto my-6">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#e50914]">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="font-display font-black text-xl uppercase text-white tracking-tight mb-2">
            No Hardware Found
          </h3>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-md mx-auto mb-5">
            No championship components matched your search or filter configuration. Try adjusting your search keywords, price boundaries, or selecting another category.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#c70812] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#e50914]/25"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </section>
  );
}

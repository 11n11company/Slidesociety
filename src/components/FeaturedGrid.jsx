import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { categories, products } from '../data/products';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';

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
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Filter products
  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.cat === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      (p.name + ' ' + p.cat + ' ' + p.spec).toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (priceFilter === 'under20k') matchesPrice = p.price < 20000;
    if (priceFilter === '20k-60k') matchesPrice = p.price >= 20000 && p.price <= 60000;
    if (priceFilter === 'over60k') matchesPrice = p.price > 60000;

    return matchesCat && matchesQuery && matchesPrice;
  });

  // Sort products
  if (sortBy === 'low') filtered.sort((a, b) => a.price - b.price);
  if (sortBy === 'high') filtered.sort((a, b) => b.price - a.price);
  if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  // If on home view, display top featured starting grid items
  const displayItems = isFullShop ? filtered : products.slice(0, 6);

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

      {/* Filter and Category Pills (shown in Shop view or full view) */}
      {isFullShop && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Search Input */}
            <input
              type="search"
              placeholder="Search gear, cockpits, load-cells..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#e50914]"
            />

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
            >
              <option value="all">Any Price Range</option>
              <option value="under20k">Under ₹20,000</option>
              <option value="20k-60k">₹20,000 to ₹60,000</option>
              <option value="over60k">Over ₹60,000</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
            >
              <option value="featured">Featured First</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                    : 'bg-black/40 text-neutral-400 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {displayItems.length === 0 && (
        <div className="text-center py-16 bg-[#111111] rounded-2xl border border-white/10">
          <p className="text-neutral-400 text-sm">No hardware matched your criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setPriceFilter('all');
              onSelectCategory('All');
            }}
            className="mt-3 text-[#e50914] font-bold text-xs uppercase underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}


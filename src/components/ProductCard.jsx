import React from 'react';
import { Star, Heart, ShoppingCart, Plus } from 'lucide-react';
import { fmt } from '../data/products';

function ProductCard({
  product,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onOpenDetail
}) {
  return (
    <article className="group bg-[#111111] border border-white/[0.08] hover:border-[#e50914] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#e50914]/15 flex flex-col">
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] bg-[#161616] overflow-hidden flex items-center justify-center p-2.5">
        <img
          src={product.image || product.imageUrl || '/hero-backdrop-hd.jpg'}
          alt={product.name}
          className="w-full h-full object-contain object-center transition-all duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/hero-backdrop-hd.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none opacity-30" />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] ${
            isWishlisted
              ? 'bg-[#e50914] text-white'
              : 'bg-black/60 text-white/80 hover:text-white border border-white/10'
          }`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Category Pill */}
        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-mono text-[9px] uppercase tracking-wider text-neutral-300 pointer-events-none">
          {product.cat}
        </span>
      </div>

      {/* Product Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-[#e50914] mb-2 font-mono font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{typeof product.rating === 'number' ? product.rating.toFixed(1) : '5.0'}</span>
            <span className="text-neutral-500 text-[10px]">/ 5.0 DEMO</span>
          </div>

          {/* Title as accessible button */}
          <h3 className="mb-1.5">
            <button
              type="button"
              onClick={() => onOpenDetail(product.id)}
              className="font-bold text-white text-lg tracking-tight hover:text-[#e50914] transition-colors cursor-pointer line-clamp-1 text-left w-full focus:outline-none focus-visible:underline focus-visible:text-[#e50914]"
              aria-label={`View details for ${product.name}`}
            >
              {product.name}
            </button>
          </h3>

          {/* Spec details */}
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
            {product.spec}
          </p>
        </div>

        {/* Bottom Price & Add to Cart */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-400">Price</div>
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {fmt(product.price)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product.id)}
            disabled={!product.available}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md ${
              product.available
                ? 'bg-[#e50914] hover:bg-[#ff1f2d] text-white hover:scale-105 active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.available ? 'Add to Cart' : 'Unavailable'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default React.memo(ProductCard);


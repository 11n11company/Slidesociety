import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Download, ArrowRight } from 'lucide-react';
import { byId, fmt } from '../data/products';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onClearCart,
  onShowToast
}) {
  if (!isOpen) return null;

  const items = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const product = byId(id);
      return product ? { ...product, qty } : null;
    })
    .filter(Boolean);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = items.length > 0 ? (subtotal >= 50000 ? 0 : 1500) : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    const text = [
      '================================================',
      'SLIDESCOIETY SIM RACING STORE — DEMO ORDER SUMMARY',
      `Date: ${new Date().toLocaleDateString()}`,
      '================================================',
      ...items.map(
        (it) => `${it.name} (x${it.qty}) — ${fmt(it.price * it.qty)} [${fmt(it.price)} each]`
      ),
      '------------------------------------------------',
      `Subtotal: ${fmt(subtotal)}`,
      `Shipping: ${shipping === 0 ? 'FREE' : fmt(shipping)}`,
      `Estimated Order Total: ${fmt(total)}`,
      '================================================',
      'Note: This is an illustrative simulation order. No real payment or delivery is initiated.'
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `slidescoiety-order-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Demo order summary downloaded successfully');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0f0003] border-l border-white/10 shadow-2xl flex flex-col z-10">
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#e50914]" />
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              Your Cart ({items.reduce((sum, it) => sum + it.qty, 0)})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item Lines */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-neutral-600" />
              <p className="font-bold text-white text-base">Your cart is empty</p>
              <p className="text-xs">Explore the hardware collection and build your setup.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl bg-black/40 border border-white/5"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-18 h-18 object-cover rounded-lg bg-black shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm line-clamp-1">{item.name}</h4>
                  <div className="text-xs font-mono text-[#e50914] font-bold mt-1">
                    {fmt(item.price * item.qty)}
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-white/15 rounded-lg bg-black/60">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="p-1.5 text-neutral-300 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold font-mono text-white">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="p-1.5 text-neutral-300 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, -item.qty)}
                      className="text-neutral-400 hover:text-[#e50914] transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-black/60 space-y-4">
            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-white">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono text-white">
                  {shipping === 0 ? 'FREE (over ₹50,000)' : fmt(shipping)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                <span>Total</span>
                <span className="font-mono text-base text-[#e50914]">{fmt(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-full bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#e50914]/30 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Checkout / Download Order Summary</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}


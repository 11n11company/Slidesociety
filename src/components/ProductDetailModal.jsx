import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Heart,
  ShoppingCart,
  ShieldCheck,
  CheckCircle,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { reviewApi } from '../services/reviewApi';
import { fmt, byId } from '../data/products';

export default function ProductDetailModal({
  productId,
  isOpen,
  onClose,
  currentUser,
  wishlist = [],
  onToggleWishlist,
  onAddToCart,
  onOpenAccount,
  onShowToast
}) {
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review Form State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');

  const product = productId ? byId(productId) : null;
  const isWishlisted = productId ? wishlist.includes(productId) : false;

  // Load reviews whenever modal opens or productId changes
  const loadReviews = async () => {
    if (!productId) return;
    setLoading(true);
    setError('');
    try {
      const res = await reviewApi.getProductReviews(productId, 1, 20);
      setReviewsData(res.data);
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      loadReviews();
      setShowForm(false);
      setIsEditing(false);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, productId, currentUser]);

  if (!isOpen || !product) return null;

  // Initiate Write Review form
  const handleOpenWrite = () => {
    setError('');
    setSuccessMsg('');
    setIsEditing(false);
    setFormRating(5);
    setFormTitle('');
    setFormComment('');
    setShowForm(true);
  };

  // Initiate Edit Review form
  const handleOpenEdit = () => {
    if (!reviewsData?.userReview) return;
    setError('');
    setSuccessMsg('');
    setIsEditing(true);
    setFormRating(reviewsData.userReview.rating || 5);
    setFormTitle(reviewsData.userReview.title || '');
    setFormComment(reviewsData.userReview.comment || '');
    setShowForm(true);
  };

  // Submit new or updated review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (formRating < 1 || formRating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    if (!formComment || formComment.trim().length < 5) {
      setError('Please write at least 5 characters in your review comment.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && reviewsData?.userReview?.id) {
        await reviewApi.updateReview(reviewsData.userReview.id, {
          rating: formRating,
          title: formTitle,
          comment: formComment
        });
        setSuccessMsg('Your review has been updated and sent to our moderators for verification.');
        onShowToast?.('Review updated and queued for moderation');
      } else {
        await reviewApi.submitReview(productId, {
          rating: formRating,
          title: formTitle,
          comment: formComment,
          orderId: reviewsData?.eligibility?.orderId
        });
        setSuccessMsg('Thank you! Your verified driver review has been submitted for moderation.');
        onShowToast?.('Review submitted for moderation');
      }

      setShowForm(false);
      await loadReviews();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete customer review
  const handleDeleteReview = async () => {
    if (!reviewsData?.userReview?.id) return;
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    setSubmitting(true);
    try {
      await reviewApi.deleteReview(reviewsData.userReview.id);
      onShowToast?.('Review deleted successfully');
      setShowForm(false);
      await loadReviews();
    } catch (err) {
      setError(err.message || 'Failed to delete review.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviewsData?.averageRating !== undefined ? reviewsData.averageRating : product.rating;
  const totalCount = reviewsData?.totalCount || 0;
  const distribution = reviewsData?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const userReview = reviewsData?.userReview;
  const eligibility = reviewsData?.eligibility || { canReview: false };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl bg-[#0a0002] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              {product.cat} // Hardware Specification & Driver Telemetry
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-8 pr-1">
          {/* ======================================================== */}
          {/* TOP SECTION: PRODUCT SHOWCASE & SPECS                    */}
          {/* ======================================================== */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Product Image Stage */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#161616] border border-white/10 group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

              <span className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-mono text-[10px] uppercase tracking-wider text-neutral-300">
                {product.cat}
              </span>
            </div>

            {/* Product Details & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-[#e50914] text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avgRating) ? 'fill-current text-[#e50914]' : 'text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono font-bold text-xs text-white">
                  {Number(avgRating).toFixed(1)}
                </span>
                <span className="text-neutral-400 text-xs font-mono">
                  ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
                {product.name}
              </h2>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {product.spec}
              </p>

              {product.compat && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-neutral-400 font-mono">
                  <span className="text-[#e50914] font-bold block mb-1">COMPATIBILITY:</span>
                  {product.compat}
                </div>
              )}

              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-neutral-400">Price</div>
                  <div className="text-2xl font-black text-white font-mono">{fmt(product.price)}</div>
                  {product.priceEur && (
                    <div className="text-xs text-neutral-500 font-mono">{product.priceEur} approx</div>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    product.available
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {product.available ? 'In Stock — Ready to Dispatch' : 'Currently Unavailable'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  disabled={!product.available}
                  onClick={() => {
                    onAddToCart?.(product.id);
                  }}
                  className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                    product.available
                      ? 'bg-[#e50914] hover:bg-[#ff1f2d] text-white shadow-[#e50914]/30'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{product.available ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist?.(product.id)}
                  className={`p-3 rounded-xl border transition-all ${
                    isWishlisted
                      ? 'bg-[#e50914] text-white border-[#e50914]'
                      : 'bg-black/50 text-neutral-400 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                  aria-label="Wishlist toggle"
                  title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BOTTOM SECTION: REVIEWS & TELEMETRY BREAKDOWN            */}
          {/* ======================================================== */}
          <div className="pt-6 border-t border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-white flex items-center gap-2">
                  <span>Driver Reviews & Ratings</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
                    {totalCount} Verified
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Genuine driver feedback from customers with verified, delivered orders.
                </p>
              </div>

              {/* Write Review Button Trigger */}
              {currentUser ? (
                eligibility.canReview && !userReview && !showForm && (
                  <button
                    type="button"
                    onClick={handleOpenWrite}
                    className="px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-[#e50914]/30 self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Write Driver Review</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAccount?.();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all self-start sm:self-auto"
                >
                  Sign in to review
                </button>
              )}
            </div>

            {/* Status Notifications */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* Rating Breakdown Header Card */}
            <div className="grid sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-black/60 border border-white/10">
              {/* Score summary */}
              <div className="flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 pr-0 sm:pr-4">
                <span className="font-display font-black text-5xl text-white tracking-tighter">
                  {Number(avgRating).toFixed(1)}
                </span>
                <div className="flex items-center text-[#e50914] my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avgRating) ? 'fill-current text-[#e50914]' : 'text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  {totalCount} {totalCount === 1 ? 'verified review' : 'verified reviews'}
                </span>
              </div>

              {/* Star Distribution Bars */}
              <div className="sm:col-span-2 space-y-1.5 justify-center flex flex-col">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = distribution[stars] || 0;
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                      <span className="w-6 text-neutral-400 font-bold">{stars}★</span>
                      <div className="flex-1 h-2 rounded-full bg-neutral-900 overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-[#e50914] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-neutral-500 text-[10px]">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer's Own Review Banner / Edit Trigger (If already submitted) */}
            {currentUser && userReview && !showForm && (
              <div className="p-5 rounded-2xl bg-[#140003] border border-[#e50914]/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-white">
                      Your Submitted Review
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        userReview.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : userReview.status === 'REJECTED'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {userReview.status === 'APPROVED'
                        ? 'Published'
                        : userReview.status === 'REJECTED'
                        ? 'Rejected'
                        : 'Under Moderation'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenEdit}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleDeleteReview}
                      className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#e50914]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < userReview.rating ? 'fill-current' : 'text-neutral-700'}`}
                      />
                    ))}
                    {userReview.title && (
                      <span className="font-bold text-sm text-white ml-2">{userReview.title}</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed pt-1">{userReview.comment}</p>
                  {userReview.moderationNote && (
                    <p className="text-[11px] text-neutral-400 bg-black/40 p-2 rounded-lg font-mono mt-2">
                      <strong>Moderator feedback:</strong> {userReview.moderationNote}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Ineligible Driver Callout (If logged in but hasn't purchased and received) */}
            {currentUser && !eligibility.canReview && !userReview && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-400">
                  <span className="text-white font-bold block mb-0.5">Verified Purchase Required</span>
                  {eligibility.message || 'Driver reviews are strictly reserved for customers who have completed checkout and received their hardware shipment.'}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* INLINE WRITE / EDIT REVIEW FORM                          */}
            {/* ======================================================== */}
            {showForm && (
              <form onSubmit={handleSubmitReview} className="p-6 rounded-2xl bg-black/80 border border-[#e50914]/50 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="font-display font-black text-lg uppercase text-white">
                    {isEditing ? 'Edit Your Driver Review' : 'Write a Verified Driver Review'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-neutral-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                {/* Star Selector */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-2">
                    Overall Performance Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setFormHoverRating(star)}
                        onMouseLeave={() => setFormHoverRating(0)}
                        className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (formHoverRating || formRating) >= star
                              ? 'text-[#e50914] fill-current'
                              : 'text-neutral-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="font-mono text-xs font-bold text-white ml-2">
                      {formHoverRating || formRating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                    Review Headline / Setup Overview (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Incredible force feedback fidelity, zero deflection"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                    Detailed Review & Hardware Impression * (5–1000 characters)
                  </label>
                  <textarea
                    required
                    rows={4}
                    minLength={5}
                    maxLength={1000}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Share your driving impressions: chassis rigidity, pedal travel, force feedback detail, ease of mounting..."
                    className="w-full bg-black/60 border border-white/15 rounded-xl p-4 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] resize-none"
                  />
                  <div className="text-right text-[10px] font-mono text-neutral-500 mt-1">
                    {formComment.length} / 1000 characters
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-bold uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#e50914]/40 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : isEditing ? 'Save Changes' : 'Submit Review for Approval'}
                  </button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* APPROVED REVIEWS LIST                                    */}
            {/* ======================================================== */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#e50914]" />
                <span className="font-mono text-xs uppercase text-neutral-400">Loading verified driver reviews...</span>
              </div>
            ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-[#e50914]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-current text-[#e50914]' : 'text-neutral-700'
                              }`}
                            />
                          ))}
                        </div>
                        {rev.title && (
                          <h4 className="font-bold text-sm text-white ml-1">{rev.title}</h4>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Purchase</span>
                        </span>
                        <span className="text-neutral-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {rev.comment}
                    </p>

                    <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-neutral-500">
                      <span>Driver: <strong className="text-neutral-300">{rev.authorName}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-white/5 rounded-2xl bg-black/20">
                <MessageSquare className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                <h4 className="font-display font-black text-base uppercase text-white mb-1">
                  No Published Reviews Yet
                </h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Be the first verified driver to put this setup through its paces on the track and share your telemetry.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Global Footer Close Button */}
        <div className="pt-4 border-t border-white/10 shrink-0 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full text-xs font-bold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all uppercase font-mono tracking-wider"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

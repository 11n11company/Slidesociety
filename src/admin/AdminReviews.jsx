import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
  MessageSquare,
  Package,
  User,
  Eye,
  X
} from 'lucide-react';
import { reviewApi } from '../services/reviewApi';

export default function AdminReviews({ currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Reject Modal State
  const [reviewToReject, setReviewToReject] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const isSupport = currentUser?.role === 'SUPPORT';

  const loadReviews = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await reviewApi.getAdminReviews({
        status: statusFilter,
        page,
        limit: pagination.limit,
        search
      });
      setReviews(res.data?.reviews || []);
      setPagination(res.data?.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadReviews(1);
  };

  // Moderate: Approve
  const handleApprove = async (reviewId) => {
    if (isSupport) return;
    setError('');
    setSuccessMsg('');
    try {
      await reviewApi.moderateReview(reviewId, 'APPROVED');
      setSuccessMsg(`Review ${reviewId.slice(0, 8)} has been APPROVED and published.`);
      loadReviews(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to approve review.');
    }
  };

  // Moderate: Open Reject Modal
  const handleOpenReject = (rev) => {
    if (isSupport) return;
    setReviewToReject(rev);
    setRejectNote('');
  };

  // Moderate: Confirm Reject
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!reviewToReject || isSupport) return;
    setRejecting(true);
    setError('');
    setSuccessMsg('');
    try {
      await reviewApi.moderateReview(reviewToReject.id, 'REJECTED', rejectNote);
      setSuccessMsg(`Review ${reviewToReject.id.slice(0, 8)} has been REJECTED.`);
      setReviewToReject(null);
      setRejectNote('');
      loadReviews(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to reject review.');
    } finally {
      setRejecting(false);
    }
  };

  // Delete Review
  const handleDelete = async (reviewId) => {
    if (isSupport) return;
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    setError('');
    setSuccessMsg('');
    try {
      await reviewApi.deleteReview(reviewId);
      setSuccessMsg('Review permanently deleted.');
      loadReviews(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white flex items-center gap-2.5">
            <span>Customer Review Moderation</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
              {pagination.totalCount} Total
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Audit and moderate verified purchase customer feedback before public publication.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadReviews(pagination.page)}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#e50914]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Status Pills */}
        <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 flex-wrap">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver, product, comment..."
            className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#e50914]"
          />
        </form>
      </div>

      {/* Reviews Table / Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#e50914]" />
          <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-20 text-center border border-white/10 rounded-2xl bg-black/30">
          <MessageSquare className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h4 className="font-display font-black text-lg uppercase text-white mb-1">No Reviews Found</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No customer reviews match the selected status filter or search parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-black/50 border border-white/10 hover:border-white/20 transition-all space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Product & User Header */}
                <div className="flex items-center gap-3 min-w-0">
                  {rev.product?.imageUrl && (
                    <img
                      src={rev.product.imageUrl}
                      alt={rev.product.name}
                      className="w-12 h-12 rounded-xl object-contain object-center bg-neutral-900 border border-white/10 shrink-0 p-0.5"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block truncate">
                      {rev.product?.category} // Order: {rev.order?.orderNumber || 'Verified Order'}
                    </span>
                    <h4 className="font-bold text-sm text-white truncate">{rev.product?.name}</h4>
                    <span className="text-xs text-neutral-400">
                      Driver: <strong className="text-white">{rev.user?.fullName}</strong> ({rev.user?.email})
                    </span>
                  </div>
                </div>

                {/* Status Badge & Timestamp */}
                <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[10px]">
                  <span
                    className={`px-2.5 py-1 rounded-full uppercase font-bold border ${
                      rev.status === 'APPROVED'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : rev.status === 'REJECTED'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {rev.status}
                  </span>
                  <span className="text-neutral-500">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#e50914]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-neutral-700'}`}
                    />
                  ))}
                  {rev.title && <strong className="text-white text-xs ml-2">{rev.title}</strong>}
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{rev.comment}</p>
                {rev.moderationNote && (
                  <p className="text-[11px] font-mono text-neutral-400 border-t border-white/5 pt-1.5 mt-2">
                    <strong>Moderation Note:</strong> {rev.moderationNote}
                  </p>
                )}
              </div>

              {/* Moderation Controls */}
              <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-mono text-neutral-500">
                  Review ID: {rev.id}
                </span>

                <div className="flex items-center gap-2">
                  {isSupport ? (
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-400 text-[10px] font-mono uppercase">
                      Read Only (Support)
                    </span>
                  ) : (
                    <>
                      {rev.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(rev.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {rev.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReject(rev)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Moderation Modal */}
      {reviewToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setReviewToReject(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative z-10 w-full max-w-md bg-[#0f0003] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-black text-lg uppercase text-white">
                Reject Product Review
              </h3>
              <button
                type="button"
                onClick={() => setReviewToReject(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Rejecting will withhold this review from public display. You can optionally include feedback for the driver.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Moderator Reason / Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="e.g. Please avoid promotional links or vulgar language..."
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewToReject(null)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

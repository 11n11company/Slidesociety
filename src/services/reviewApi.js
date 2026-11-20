/**
 * Slidescoiety Product Reviews & Ratings API Service
 * Communicates with backend using HTTP-only session cookies (credentials: 'include')
 */

const API_BASE = '/api/v1';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.message || 'Network request failed';
    const err = new Error(errorMsg);
    err.status = res.status;
    err.code = data?.error?.code;
    err.details = data?.errors;
    throw err;
  }
  return data;
}

export const reviewApi = {
  /**
   * Public: Fetch approved product reviews and rating aggregates
   */
  async getProductReviews(productId, page = 1, limit = 10) {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}/reviews?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Customer: Check verified purchase review eligibility
   */
  async checkEligibility(productId) {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}/reviews/eligibility`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Customer: Submit a new review for an eligible delivered product
   */
  async submitReview(productId, { rating, title, comment, orderId }) {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}/reviews`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ rating, title, comment, orderId })
    });
    return handleResponse(res);
  },

  /**
   * Customer: Update an existing review
   */
  async updateReview(reviewId, { rating, title, comment }) {
    const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ rating, title, comment })
    });
    return handleResponse(res);
  },

  /**
   * Customer / Admin: Delete a review
   */
  async deleteReview(reviewId) {
    const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Admin / Support: Retrieve submitted reviews for moderation
   */
  async getAdminReviews({ status = 'ALL', productId, page = 1, limit = 20, search } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (productId) params.append('productId', productId);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/admin/reviews?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Admin: Approve or Reject a submitted review
   */
  async moderateReview(reviewId, status, moderationNote = '') {
    const res = await fetch(`${API_BASE}/admin/reviews/${encodeURIComponent(reviewId)}/status`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status, moderationNote })
    });
    return handleResponse(res);
  }
};

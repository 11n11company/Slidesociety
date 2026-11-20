/**
 * Slidescoiety Customer Wishlist API Service
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

export const wishlistApi = {
  /**
   * Fetch customer's wishlist items
   */
  async getWishlist() {
    const res = await fetch(`${API_BASE}/wishlist`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Fetch customer's wishlist count
   */
  async getWishlistCount() {
    const res = await fetch(`${API_BASE}/wishlist/count`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Add a product to the customer's wishlist
   */
  async addToWishlist(productId) {
    const res = await fetch(`${API_BASE}/wishlist/${encodeURIComponent(productId)}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Remove a product from the customer's wishlist
   */
  async removeFromWishlist(productId) {
    const res = await fetch(`${API_BASE}/wishlist/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Merge guest wishlist with customer's backend wishlist upon login
   */
  async mergeWishlist(items) {
    const res = await fetch(`${API_BASE}/wishlist/merge`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ items })
    });
    return handleResponse(res);
  }
};

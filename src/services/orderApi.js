/**
 * Slidescoiety Order Management API Service
 * Handles customer order placement, order history retrieval, single order details, and order cancellation.
 * Authenticates via HTTP-only session cookies (credentials: 'include').
 */

const API_BASE = '/api/v1/orders';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.message || 'Network request failed';
    const err = new Error(errorMsg);
    err.status = res.status;
    err.code = data?.error?.code;
    err.details = data?.error?.details;
    throw err;
  }
  return data;
}

export const orderApi = {
  /**
   * Place a new order with shipping address, notes, and idempotency key
   * POST /api/v1/orders
   */
  async createOrder(data) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  /**
   * List authenticated customer's orders with pagination and filtering
   * GET /api/v1/orders
   */
  async getMyOrders({ page = 1, limit = 10, status = null } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'ALL') params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}${query}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Retrieve full details of a single customer order with snapshots and status history
   * GET /api/v1/orders/:id
   */
  async getOrderById(orderId) {
    const res = await fetch(`${API_BASE}/${orderId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Cancel an eligible customer order (PENDING or CONFIRMED)
   * POST /api/v1/orders/:id/cancel
   */
  async cancelOrder(orderId, reason = '') {
    const res = await fetch(`${API_BASE}/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ reason })
    });
    return handleResponse(res);
  },

  /**
   * Retrieve tracking details and consignment timeline for a customer order
   * GET /api/v1/orders/:orderId/tracking
   */
  async getOrderTracking(orderId) {
    const res = await fetch(`${API_BASE}/${orderId}/tracking`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(res);
  }
};

/**
 * Slidescoiety Admin API Service
 * Centralized interface for Phase 3D.1 Admin Backend APIs.
 * Uses HTTP-only cookie session authentication (credentials: 'include').
 */

import { invoiceApi } from './invoiceApi';

const ADMIN_BASE = '/api/v1/admin';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.code = data?.error?.code || data?.code;
    err.details = data?.error?.details || data?.details;
    throw err;
  }
  return data;
}

export const adminApi = {
  /**
   * Dashboard Analytics & Overview
   * GET /api/v1/admin/overview
   */
  async getOverview() {
    const res = await fetch(`${ADMIN_BASE}/overview`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * List orders with search, filters and pagination
   * GET /api/v1/admin/orders
   */
  async getOrders({
    page = 1,
    limit = 15,
    status = '',
    paymentStatus = '',
    search = '',
    startDate = '',
    endDate = '',
    sort = 'desc'
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'ALL') params.append('status', status);
    if (paymentStatus && paymentStatus !== 'ALL') params.append('paymentStatus', paymentStatus);
    if (search && search.trim()) params.append('search', search.trim());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (sort) params.append('sort', sort);

    const qs = params.toString();
    const url = `${ADMIN_BASE}/orders${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Get single order details with customer, items, invoice, payments & status history
   * GET /api/v1/admin/orders/:id
   */
  async getOrderById(orderId) {
    const res = await fetch(`${ADMIN_BASE}/orders/${orderId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Transition order status via strict state machine
   * PATCH /api/v1/admin/orders/:id/status
   */
  async updateOrderStatus(orderId, { status, notes }) {
    const res = await fetch(`${ADMIN_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status, notes })
    });
    return handleResponse(res);
  },

  /**
   * Modify items, shipping fare, and optional discount for an order
   * PATCH /api/v1/admin/orders/:id/fare-and-items
   */
  async updateOrderFareAndItems(orderId, { items, shippingAmount, discountAmount, notes }) {
    const res = await fetch(`${ADMIN_BASE}/orders/${orderId}/fare-and-items`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ items, shippingAmount, discountAmount, notes })
    });
    return handleResponse(res);
  },

  /**
   * Record payment (UPI, Bank Transfer, Cash, Card, Manual) & confirm order
   * POST /api/v1/admin/orders/:id/payment
   */
  async recordOrderPayment(orderId, { amount, method, transactionReference, notes, autoConfirm = true }) {
    const res = await fetch(`${ADMIN_BASE}/orders/${orderId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ amount, method, transactionReference, notes, autoConfirm })
    });
    return handleResponse(res);
  },

  /**
   * Generate or force-regenerate tax invoice for an order
   * POST /api/v1/admin/orders/:id/invoice
   */
  async generateOrderInvoice(orderId) {
    const res = await fetch(`${ADMIN_BASE}/orders/${orderId}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Re-send invoice via email
   */
  async resendInvoice(invoiceId) {
    return invoiceApi.resendInvoice(invoiceId);
  },

  /**
   * List catalog products with stock and metadata
   * GET /api/v1/admin/products
   */
  async getProducts({
    page = 1,
    limit = 20,
    search = '',
    category = '',
    isAvailable = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search && search.trim()) params.append('search', search.trim());
    if (category && category !== 'ALL') params.append('category', category);
    if (isAvailable !== '' && isAvailable !== undefined) params.append('isAvailable', isAvailable);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const qs = params.toString();
    const url = `${ADMIN_BASE}/products${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Get single product details
   * GET /api/v1/admin/products/:id
   */
  async getProductById(productId) {
    const res = await fetch(`${ADMIN_BASE}/products/${productId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Create a new product
   * POST /api/v1/admin/products
   */
  async createProduct(productData) {
    const res = await fetch(`${ADMIN_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },

  /**
   * Update permitted fields of an existing product
   * PATCH /api/v1/admin/products/:id
   */
  async updateProduct(productId, updateData) {
    const res = await fetch(`${ADMIN_BASE}/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(updateData)
    });
    return handleResponse(res);
  },

  /**
   * Safe delete product (deactivates if referenced in orders)
   * DELETE /api/v1/admin/products/:id
   */
  async deleteProduct(productId) {
    const res = await fetch(`${ADMIN_BASE}/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Retrieve inventory stock levels and alerts
   * GET /api/v1/admin/inventory
   */
  async getInventory({
    page = 1,
    limit = 20,
    status = '',
    search = ''
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'ALL') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());

    const qs = params.toString();
    const url = `${ADMIN_BASE}/inventory${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Update stock quantity (absolute or delta)
   * PATCH /api/v1/admin/products/:id/stock
   */
  async updateStock(productId, { stockQuantity, delta }) {
    const payload = {};
    if (stockQuantity !== undefined && stockQuantity !== null && stockQuantity !== '') {
      payload.stockQuantity = Number(stockQuantity);
    }
    if (delta !== undefined && delta !== null && delta !== '') {
      payload.delta = Number(delta);
    }

    const res = await fetch(`${ADMIN_BASE}/products/${productId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  /**
   * List customers with order count and total spend
   * GET /api/v1/admin/customers
   */
  async getCustomers({
    page = 1,
    limit = 15,
    search = ''
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search && search.trim()) params.append('search', search.trim());

    const qs = params.toString();
    const url = `${ADMIN_BASE}/customers${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Retrieve single customer profile and order history
   * GET /api/v1/admin/customers/:id
   */
  async getCustomerById(customerId) {
    const res = await fetch(`${ADMIN_BASE}/customers/${customerId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Download Invoice PDF via invoice API
   */
  async downloadInvoice(invoiceId, filename) {
    return invoiceApi.downloadInvoice(invoiceId, filename);
  },

  /**
   * Resend Invoice email via invoice API
   */
  async resendInvoice(invoiceId) {
    return invoiceApi.resendInvoice(invoiceId);
  },

  /**
   * List shipments with search, filtering and pagination
   * GET /api/v1/admin/shipments
   */
  async getShipments({
    page = 1,
    limit = 20,
    status = '',
    courier = '',
    search = '',
    startDate = '',
    endDate = '',
    sort = 'newest'
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'ALL') params.append('status', status);
    if (courier && courier !== 'ALL') params.append('courier', courier);
    if (search && search.trim()) params.append('search', search.trim());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (sort) params.append('sort', sort);

    const qs = params.toString();
    const url = `${ADMIN_BASE}/shipments${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Get single shipment details
   * GET /api/v1/admin/shipments/:id
   */
  async getShipmentById(shipmentId) {
    const res = await fetch(`${ADMIN_BASE}/shipments/${shipmentId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Create shipment for an order
   * POST /api/v1/admin/orders/:orderId/shipment
   */
  async createShipment(orderId, shipmentData) {
    const res = await fetch(`${ADMIN_BASE}/orders/${orderId}/shipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(shipmentData)
    });
    return handleResponse(res);
  },

  /**
   * Update shipment metadata (courier, tracking, dates, notes)
   * PATCH /api/v1/admin/shipments/:id
   */
  async updateShipment(shipmentId, shipmentData) {
    const res = await fetch(`${ADMIN_BASE}/shipments/${shipmentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(shipmentData)
    });
    return handleResponse(res);
  },

  /**
   * Transition shipment status
   * PATCH /api/v1/admin/shipments/:id/status
   */
  async updateShipmentStatus(shipmentId, { status, notes, failureReason }) {
    const res = await fetch(`${ADMIN_BASE}/shipments/${shipmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status, notes, failureReason })
    });
    return handleResponse(res);
  }
};

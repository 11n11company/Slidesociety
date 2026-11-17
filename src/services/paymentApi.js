/**
 * Slidescoiety Razorpay Payment API Client
 * Manages order payment initialization, cryptographic signature verification,
 * and dynamic Razorpay Checkout SDK injection.
 */

const API_BASE = '/api/v1/payments';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.message || 'Payment operation failed';
    const err = new Error(errorMsg);
    err.status = res.status;
    err.code = data?.error?.code;
    err.details = data?.error?.details;
    throw err;
  }
  return data;
}

export const paymentApi = {
  /**
   * Dynamically loads the official Razorpay Checkout SDK (checkout.js)
   */
  loadRazorpayScript() {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Initiate Razorpay Payment order on backend
   * POST /api/v1/payments/create
   */
  async createPayment(orderId) {
    const res = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ orderId })
    });
    return handleResponse(res);
  },

  /**
   * Cryptographically verify payment signature on backend
   * POST /api/v1/payments/verify
   */
  async verifyPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const res = await fetch(`${API_BASE}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      })
    });
    return handleResponse(res);
  },

  /**
   * Retrieve payment attempts and status for an order
   * GET /api/v1/payments/order/:orderId
   */
  async getPaymentStatus(orderId) {
    const res = await fetch(`${API_BASE}/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(res);
  }
};

/**
 * Slidescoiety Driver Authentication & Cart API Service
 * Communicates with backend using HTTP-only cookies (credentials: 'include')
 * Never stores authentication tokens in localStorage
 */

const API_BASE = '/api/v1';

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

export const authApi = {
  /**
   * Check currently authenticated driver session (GET /api/v1/auth/me)
   */
  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.status === 401) return null;
      const data = await handleResponse(res);
      return data?.data?.user || null;
    } catch (err) {
      return null;
    }
  },

  /**
   * Authenticate customer with email and password
   */
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  /**
   * Register a new customer driver account
   */
  async register({ fullName, email, password, confirmPassword }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ fullName, email, password, confirmPassword })
    });
    return handleResponse(res);
  },

  /**
   * End customer session (clears HTTP-only cookie)
   */
  async logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Request password reset link
   */
  async forgotPassword({ email }) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  /**
   * Reset password with single-use token
   */
  async resetPassword({ token, password, confirmPassword }) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ token, password, confirmPassword })
    });
    return handleResponse(res);
  },

  /**
   * Verify email address with token
   */
  async verifyEmail({ token, email }) {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ token, email })
    });
    return handleResponse(res);
  },

  /**
   * Merge guest cart with authenticated user's cart in PostgreSQL
   */
  async mergeCart(guestItems) {
    const res = await fetch(`${API_BASE}/cart/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ items: guestItems })
    });
    return handleResponse(res);
  },

  /**
   * Retrieve active customer cart from PostgreSQL
   */
  async getCart() {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return handleResponse(res);
  }
};


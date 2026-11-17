/**
 * Slidescoiety Invoice API Service
 * Handles customer invoice metadata retrieval, direct PDF download streaming,
 * and email resend requests. Authenticates via HTTP-only session cookies.
 */

const API_BASE = '/api/v1/invoices';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.message || 'Invoice service request failed';
    const err = new Error(errorMsg);
    err.status = res.status;
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

export const invoiceApi = {
  /**
   * Retrieves invoice metadata for a specific order.
   * GET /api/v1/invoices/order/:orderId
   */
  async getInvoiceByOrder(orderId) {
    const res = await fetch(`${API_BASE}/order/${orderId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(res);
  },

  /**
   * Downloads invoice PDF and triggers native browser file save dialog.
   * GET /api/v1/invoices/:invoiceId/download
   */
  async downloadInvoice(invoiceId, filename = 'invoice.pdf') {
    const res = await fetch(`${API_BASE}/${invoiceId}/download`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errorMsg = data?.error?.message || data?.message || 'Failed to download invoice PDF';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data?.error?.code;
      throw err;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    return { success: true };
  },

  /**
   * Requests email delivery/resend of the invoice PDF.
   * POST /api/v1/invoices/:invoiceId/resend
   */
  async resendInvoice(invoiceId) {
    const res = await fetch(`${API_BASE}/${invoiceId}/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(res);
  }
};

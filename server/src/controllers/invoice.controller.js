import {
  getInvoiceByOrderId as fetchInvoiceByOrder,
  getInvoiceById as fetchInvoiceById,
  resendInvoiceEmail as triggerResendInvoiceEmail
} from '../services/invoice.service.js';
import { storageService } from '../services/storage.service.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/v1/invoices/order/:orderId
 * Retrieves invoice metadata for an order.
 */
export async function getInvoiceByOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isStaff = req.user.role === 'ADMIN';

    const invoice = await fetchInvoiceByOrder({ orderId, userId, isAdmin: isStaff });

    return res.status(200).json({
      success: true,
      data: { invoice }
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
}

/**
 * GET /api/v1/invoices/:invoiceId/download
 * Streams the PDF document directly to the client.
 * Sets correct headers and never exposes internal filesystem paths.
 */
export async function downloadInvoice(req, res, next) {
  try {
    const { invoiceId } = req.params;
    const userId = req.user.id;
    const isStaff = req.user.role === 'ADMIN';

    const invoice = await fetchInvoiceById(invoiceId, { userId, isAdmin: isStaff });

    // Double check that file exists
    const filenameOrKey = invoice.storageKey || `${invoice.invoiceNumber}.pdf`;
    if (!storageService.invoicePDFExists(filenameOrKey)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_FILE_NOT_FOUND',
          message: 'The requested invoice PDF file is not available in storage'
        }
      });
    }

    // Set standard PDF streaming headers
    const downloadFilename = `${invoice.invoiceNumber}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const stream = storageService.getInvoicePDFStream(filenameOrKey);
    stream.on('error', (streamErr) => {
      logger.error(`Error streaming invoice PDF [${downloadFilename}]: ${streamErr.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: 'STREAMING_ERROR',
            message: 'Failed to stream invoice document'
          }
        });
      }
    });

    stream.pipe(res);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
}

/**
 * POST /api/v1/invoices/:invoiceId/resend
 * Resends the customer invoice to their registered email.
 */
export async function resendInvoice(req, res, next) {
  try {
    const { invoiceId } = req.params;
    const userId = req.user.id;
    const isStaff = req.user.role === 'ADMIN';

    const result = await triggerResendInvoiceEmail({ invoiceId, userId, isAdmin: isStaff });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        invoice: result.invoice,
        sent: result.sent
      }
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
}

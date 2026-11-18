import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getInvoiceByOrder,
  downloadInvoice,
  resendInvoice
} from '../controllers/invoice.controller.js';
import { authenticateCustomer } from '../middleware/auth.middleware.js';

const router = Router();

// Rate limiter for invoice email resending
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 1000, // relaxed in test/development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many invoice resend requests. Please wait a few minutes before trying again.'
    }
  }
});

// All invoice operations require an authenticated customer or admin session
router.use(authenticateCustomer);

router.get('/order/:orderId', getInvoiceByOrder);
router.get('/:invoiceId/download', downloadInvoice);
router.post('/:invoiceId/resend', resendLimiter, resendInvoice);

export default router;

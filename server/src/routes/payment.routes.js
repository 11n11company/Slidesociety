import { Router } from 'express';
import {
  createPayment,
  verifyPayment,
  handleWebhook,
  getPaymentStatus
} from '../controllers/payment.controller.js';
import { authenticateCustomer } from '../middleware/auth.middleware.js';
import { paymentRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Signed Razorpay Webhook (Public with HMAC-SHA256 signature verification)
router.post('/webhook', handleWebhook);

// Customer Authenticated Payment Operations
router.use(authenticateCustomer);

router.post('/create', paymentRateLimiter, createPayment);
router.post('/verify', paymentRateLimiter, verifyPayment);
router.get('/order/:orderId', getPaymentStatus);

export default router;

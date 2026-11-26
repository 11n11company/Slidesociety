import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrder,
  cancelOrder,
  getOrderTracking
} from '../controllers/order.controller.js';
import { authenticateCustomer, optionalAuthenticateCustomer } from '../middleware/auth.middleware.js';

const router = Router();

// Guest-friendly order creation (supports both registered customers and guest checkout)
router.post('/', optionalAuthenticateCustomer, createOrder);

// Account-specific order management requires authenticated driver session
router.get('/', authenticateCustomer, listOrders);
router.get('/:id', authenticateCustomer, getOrder);
router.get('/:id/tracking', authenticateCustomer, getOrderTracking);
router.post('/:id/cancel', authenticateCustomer, cancelOrder);

export default router;

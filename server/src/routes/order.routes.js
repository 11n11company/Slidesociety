import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrder,
  cancelOrder
} from '../controllers/order.controller.js';
import { authenticateCustomer } from '../middleware/auth.middleware.js';

const router = Router();

// All customer order endpoints require authentication
router.use(authenticateCustomer);

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

export default router;

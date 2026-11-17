import { Router } from 'express';
import {
  listAllOrders,
  getOrderDetails,
  updateStatus
} from '../controllers/adminOrder.controller.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All admin order endpoints require authentication & ADMIN or SUPPORT role
router.use(authenticateCustomer);
router.use(requireRole('ADMIN', 'SUPPORT'));

router.get('/', listAllOrders);
router.get('/:id', getOrderDetails);
router.patch('/:id/status', requireRole('ADMIN'), updateStatus); // Status changes require ADMIN

export default router;

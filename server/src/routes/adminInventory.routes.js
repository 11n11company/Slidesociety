import { Router } from 'express';
import {
  listInventory,
  updateStock
} from '../controllers/adminProduct.controller.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Authentication required
router.use(authenticateCustomer);

// Read inventory: ADMIN or SUPPORT
router.get('/', requireRole('ADMIN', 'SUPPORT'), listInventory);

// Adjust inventory stock: strictly ADMIN only
router.patch('/:id/stock', requireRole('ADMIN'), updateStock);

export default router;


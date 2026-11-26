import { Router } from 'express';
import {
  listProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} from '../controllers/adminProduct.controller.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Authentication required for all admin endpoints
router.use(authenticateCustomer);

// Product read: strictly ADMIN only
router.get('/', requireRole('ADMIN'), listProducts);
router.get('/:id', requireRole('ADMIN'), getProductDetails);

// Product mutations & stock modifications: strictly ADMIN only (SUPPORT blocked)
router.post('/', requireRole('ADMIN'), createProduct);
router.patch('/:id/stock', requireRole('ADMIN'), updateStock);
router.patch('/:id', requireRole('ADMIN'), updateProduct);
router.delete('/:id', requireRole('ADMIN'), deleteProduct);

export default router;

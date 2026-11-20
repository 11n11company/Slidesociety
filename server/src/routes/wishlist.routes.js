import { Router } from 'express';
import {
  getWishlist,
  getCount,
  addItem,
  removeItem,
  mergeWishlist
} from '../controllers/wishlist.controller.js';
import { authenticateCustomer } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all wishlist endpoints for authenticated customers
router.use(authenticateCustomer);

// GET /api/v1/wishlist - Get full customer wishlist
router.get('/', getWishlist);

// GET /api/v1/wishlist/count - Get customer wishlist item count
router.get('/count', getCount);

// POST /api/v1/wishlist/merge - Merge guest wishlist into customer account
router.post('/merge', mergeWishlist);

// POST /api/v1/wishlist/:productId - Add item to customer wishlist
router.post('/:productId', addItem);

// DELETE /api/v1/wishlist/:productId - Remove item from customer wishlist
router.delete('/:productId', removeItem);

export default router;

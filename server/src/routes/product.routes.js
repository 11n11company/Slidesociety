import { Router } from 'express';
import { getProducts, getProduct } from '../controllers/product.controller.js';
import {
  getProductReviews,
  checkEligibility,
  createReview
} from '../controllers/review.controller.js';
import { authenticateCustomer, optionalCustomer } from '../middleware/auth.middleware.js';
import { reviewRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// /api/v1/products
router.get('/', getProducts);

// Reviews sub-routes for /api/v1/products/:productId/reviews
router.get('/:productId/reviews/eligibility', authenticateCustomer, checkEligibility);
router.get('/:productId/reviews', optionalCustomer, getProductReviews);
router.post('/:productId/reviews', authenticateCustomer, reviewRateLimiter, createReview);

router.get('/:id', getProduct);

export default router;


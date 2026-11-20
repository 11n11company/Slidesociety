import { Router } from 'express';
import {
  updateReview,
  deleteReview,
  getProductReviews,
  checkEligibility,
  createReview
} from '../controllers/review.controller.js';
import { authenticateCustomer, optionalCustomer } from '../middleware/auth.middleware.js';

const router = Router({ mergeParams: true });

// Direct review item mutations
router.patch('/:reviewId', authenticateCustomer, updateReview);
router.delete('/:reviewId', authenticateCustomer, deleteReview);

// Alternate direct access: /api/v1/reviews/product/:productId
router.get('/product/:productId', optionalCustomer, getProductReviews);
router.get('/product/:productId/eligibility', authenticateCustomer, checkEligibility);
router.post('/product/:productId', authenticateCustomer, createReview);

export default router;

import { Router } from 'express';
import {
  getAdminReviews,
  moderateReview
} from '../controllers/review.controller.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all admin review routes
router.use(authenticateCustomer);

// Read-only list: Accessible by ADMIN ONLY
router.get('/', requireRole('ADMIN'), getAdminReviews);

// Moderation (Approve/Reject): Accessible by ADMIN ONLY
router.patch('/:reviewId/status', requireRole('ADMIN'), moderateReview);

export default router;

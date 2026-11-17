import { Router } from 'express';
import {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/auth.controller.js';
import { authenticateCustomer } from '../middleware/auth.middleware.js';
import { authRateLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public Authentication Endpoints (Rate-limited)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);

// Protected Customer Profile Endpoint
router.get('/me', authenticateCustomer, getMe);

export default router;


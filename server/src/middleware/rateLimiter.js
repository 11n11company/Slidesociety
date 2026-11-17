import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Strict Rate Limiter for Authentication & Account Security Endpoints
 * Limits each IP in production, higher ceiling in development for test suites
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 30 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
    }
  }
});

/**
 * Sensitive Password Reset Request Limiter
 * Limits password reset emails
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.NODE_ENV === 'production' ? 10 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many password reset requests. Please check your inbox or try again in an hour.'
    }
  }
});


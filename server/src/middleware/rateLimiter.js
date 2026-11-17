import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Authentication & Account Security Endpoints
 * Limits each IP to 20 auth attempts per 15-minute window
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
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
 * Limits password reset emails to 5 requests per hour per IP
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
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


import {
  registerCustomer,
  loginCustomer,
  verifyEmailAddress,
  requestPasswordReset,
  resetPasswordWithToken,
  getUserProfile
} from '../services/auth.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Secure cookie configuration
const SESSION_COOKIE_NAME = 'slidescoiety_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * Register Customer Controller
 * POST /api/v1/auth/register
 */
export async function register(req, res, next) {
  try {
    const { user, sessionToken, emailResult } = await registerCustomer(req.body);

    // Set secure HTTP-only cookie
    res.cookie(SESSION_COOKIE_NAME, sessionToken, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Slidescoiety.',
      data: {
        user,
        emailResult: env.NODE_ENV === 'development' ? emailResult : undefined
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid input data',
          details: err.errors
        }
      });
    }
    next(err);
  }
}

/**
 * Login Customer Controller
 * POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { user, sessionToken } = await loginCustomer(req.body);

    // Set secure HTTP-only cookie
    res.cookie(SESSION_COOKIE_NAME, sessionToken, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: 'Driver authenticated successfully.',
      data: {
        user
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid credentials format',
          details: err.errors
        }
      });
    }
    next(err);
  }
}

/**
 * Logout Customer Controller
 * POST /api/v1/auth/logout
 */
export async function logout(req, res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.'
  });
}

/**
 * Verify Email Controller
 * POST /api/v1/auth/verify-email
 */
export async function verifyEmail(req, res, next) {
  try {
    const verifiedUser = await verifyEmailAddress(req.body);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Your driver account is active.',
      data: {
        user: verifiedUser
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid token format',
          details: err.errors
        }
      });
    }
    next(err);
  }
}

/**
 * Forgot Password Controller
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPassword(req, res, next) {
  try {
    const result = await requestPasswordReset(req.body);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid email address',
          details: err.errors
        }
      });
    }
    next(err);
  }
}

/**
 * Reset Password Controller
 * POST /api/v1/auth/reset-password
 */
export async function resetPassword(req, res, next) {
  try {
    const result = await resetPasswordWithToken(req.body);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid password format',
          details: err.errors
        }
      });
    }
    next(err);
  }
}

/**
 * Get Current Authenticated Driver Profile
 * GET /api/v1/auth/me
 */
export async function getMe(req, res, next) {
  try {
    const profile = await getUserProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        user: profile
      }
    });
  } catch (err) {
    next(err);
  }
}

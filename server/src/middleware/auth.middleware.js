import { verifySessionToken } from '../utils/security.js';
import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Authenticates requests via HTTP-only cookie or Authorization Bearer header
 */
export async function authenticateCustomer(req, res, next) {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first (primary browser auth)
    if (req.cookies && req.cookies.slidescoiety_session) {
      token = req.cookies.slidescoiety_session;
    } 
    // 2. Check Authorization Bearer header (for API / CLI client testing)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in to your Driver Account.'
        }
      });
    }

    const decoded = verifySessionToken(token);
    if (!decoded || !decoded.id) {
      // Clear invalid cookie if present
      res.clearCookie('slidescoiety_session');
      return res.status(401).json({
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Your session has expired. Please sign in again.'
        }
      });
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        phone: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.clearCookie('slidescoiety_session');
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Account associated with this session no longer exists.'
        }
      });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Authentication middleware error:', err.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_AUTH_ERROR',
        message: 'An unexpected error occurred during session authentication.'
      }
    });
  }
}

/**
 * Role-Based Access Control Middleware
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of [${allowedRoles.join(', ')}] role.`
        }
      });
    }

    next();
  };
}

/**
 * Optional Authentication (attaches user if session present, does not fail if anonymous)
 */
export async function optionalCustomer(req, res, next) {
  try {
    let token = null;
    if (req.cookies && req.cookies.slidescoiety_session) {
      token = req.cookies.slidescoiety_session;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifySessionToken(token);
      if (decoded && decoded.id) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isVerified: true
          }
        });
        if (user) req.user = user;
      }
    }
  } catch (err) {
    // Ignore and proceed as guest
  }
  next();
}


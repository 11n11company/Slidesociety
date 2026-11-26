import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { hashPassword } from '../utils/security.js';
import {
  createCustomerOrder,
  getCustomerOrders,
  getCustomerOrderById,
  cancelCustomerOrder,
  cancelOrderSchema
} from '../services/order.service.js';
import { getCustomerOrderTracking } from '../services/shipping.service.js';

/**
 * Customer & Guest Order Creation
 * POST /api/v1/orders
 */
export async function createOrder(req, res, next) {
  try {
    let customerId = req.user?.id;

    if (!customerId) {
      // Seamless guest checkout: auto-resolve or provision a guest customer
      const rawAddress = req.body.shippingAddress || {};
      const guestPhone = rawAddress.phone || '';
      const guestName = rawAddress.recipientName || 'Guest Customer';
      const cleanPhoneDigits = guestPhone.replace(/\D/g, '');
      const inputEmail = req.body.customerEmail || req.body.email || req.body.accountEmail;

      const guestEmail = inputEmail && inputEmail.includes('@')
        ? inputEmail.trim().toLowerCase()
        : cleanPhoneDigits.length >= 7
        ? `guest_${cleanPhoneDigits}@guest.slidescoiety.com`
        : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@guest.slidescoiety.com`;

      let existingUser = await prisma.user.findUnique({
        where: { email: guestEmail }
      });

      if (!existingUser) {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const randomHash = await hashPassword(randomPassword);
        existingUser = await prisma.user.create({
          data: {
            email: guestEmail,
            passwordHash: randomHash,
            fullName: guestName,
            phone: guestPhone || null,
            role: 'CUSTOMER',
            isVerified: true
          }
        });
      }

      customerId = existingUser.id;
    }

    const result = await createCustomerOrder(customerId, req.body);

    const statusCode = result.isIdempotentReplay ? 200 : 201;
    const message = result.isIdempotentReplay
      ? `Retrieved existing order ${result.order.orderNumber} (idempotent request)`
      : `Order ${result.order.orderNumber} created successfully!`;

    return res.status(statusCode).json({
      success: true,
      message,
      data: {
        order: result.order,
        isIdempotentReplay: result.isIdempotentReplay
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid order parameters',
          details: err.errors
        }
      });
    }
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ORDER_CONFLICT',
          message: 'Concurrent order creation conflict. Please retry.'
        }
      });
    }
    next(err);
  }
}

/**
 * List Customer Orders
 * GET /api/v1/orders
 */
export async function listOrders(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    const result = await getCustomerOrders(req.user.id, { page, limit, status });

    return res.status(200).json({
      success: true,
      data: {
        orders: result.orders,
        pagination: result.pagination
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Specific Customer Order
 * GET /api/v1/orders/:id
 */
export async function getOrder(req, res, next) {
  try {
    const order = await getCustomerOrderById(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'NOT_FOUND',
          message: err.message
        }
      });
    }
    next(err);
  }
}

/**
 * Cancel Customer Order
 * POST /api/v1/orders/:id/cancel
 */
export async function cancelOrder(req, res, next) {
  try {
    const validated = cancelOrderSchema.parse(req.body || {});
    const order = await cancelCustomerOrder(req.user.id, req.params.id, validated.reason);

    return res.status(200).json({
      success: true,
      message: `Order ${order.orderNumber} has been cancelled successfully.`,
      data: {
        order
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid cancellation parameters',
          details: err.errors
        }
      });
    }
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ORDER_CONFLICT',
          message: 'Concurrent order creation conflict. Please retry.'
        }
      });
    }
    next(err);
  }
}

/**
 * Customer: Retrieve tracking details for order
 * GET /api/v1/orders/:id/tracking
 */
export async function getOrderTracking(req, res, next) {
  try {
    const tracking = await getCustomerOrderTracking(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      data: tracking
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'NOT_FOUND',
          message: err.message
        }
      });
    }
    next(err);
  }
}


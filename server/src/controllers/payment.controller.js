import {
  createPaymentOrder,
  verifyPaymentSignature,
  processWebhook,
  getPaymentByOrderId
} from '../services/payment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Customer: Initiate Razorpay payment for an order
 * POST /api/v1/payments/create
 */
export async function createPayment(req, res, next) {
  try {
    const { orderId } = req.body;
    const checkoutData = await createPaymentOrder({
      userId: req.user.id,
      orderId
    });

    return res.status(200).json({
      success: true,
      message: 'Razorpay payment order created successfully',
      data: checkoutData
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
}

/**
 * Customer: Cryptographically verify Razorpay payment signature
 * POST /api/v1/payments/verify
 */
export async function verifyPayment(req, res, next) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const result = await verifyPaymentSignature({
      userId: req.user.id,
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    return res.status(200).json({
      success: true,
      message: result.message || (result.isIdempotentReplay
        ? 'Payment already verified and confirmed'
        : 'Payment verified and captured successfully! Order confirmed.'),
      data: {
        order: result.order,
        payment: result.payment,
        invoice: result.invoice || null,
        isIdempotentReplay: result.isIdempotentReplay || false,
        isCaptured: result.isCaptured,
        paymentStatus: result.paymentStatus
      }
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
}

/**
 * Webhook: Receive and process signed Razorpay events
 * POST /api/v1/payments/webhook
 */
export async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const eventIdHeader = req.headers['x-razorpay-event-id'];
    const rawBody = req.rawBody;

    const result = await processWebhook({
      rawBody,
      signature,
      eventIdHeader,
      event: req.body
    });

    return res.status(200).json({
      success: true,
      status: result.status,
      eventId: result.eventId
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
}

/**
 * Customer: Get payment status and history for an order
 * GET /api/v1/payments/order/:orderId
 */
export async function getPaymentStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const data = await getPaymentByOrderId({
      userId: req.user.id,
      orderId
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
}


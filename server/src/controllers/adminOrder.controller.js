import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatusByAdmin,
  updateOrderStatusSchema
} from '../services/order.service.js';

/**
 * Admin: List all orders
 * GET /api/v1/admin/orders
 */
export async function listAllOrders(req, res, next) {
  try {
    const { page, limit, status, search } = req.query;
    const result = await getAdminOrders({ page, limit, status, search });

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
 * Admin: Get single order details with customer and history
 * GET /api/v1/admin/orders/:id
 */
export async function getOrderDetails(req, res, next) {
  try {
    const order = await getAdminOrderById(req.params.id);

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
 * Admin: Transition order status
 * PATCH /api/v1/admin/orders/:id/status
 */
export async function updateStatus(req, res, next) {
  try {
    const validated = updateOrderStatusSchema.parse(req.body);
    const updatedOrder = await updateOrderStatusByAdmin(req.params.id, {
      newStatus: validated.status,
      notes: validated.notes,
      adminUserId: req.user.id
    });

    return res.status(200).json({
      success: true,
      message: `Order status successfully transitioned to '${validated.status}'.`,
      data: {
        order: updatedOrder
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid status parameter',
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
    next(err);
  }
}

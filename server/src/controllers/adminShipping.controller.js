import {
  createShipmentForOrder,
  getAdminShipments,
  getAdminShipmentById,
  updateShipmentDetails,
  updateShipmentStatus
} from '../services/shipping.service.js';

/**
 * Admin: List all shipments
 * GET /api/v1/admin/shipments
 */
export async function listShipments(req, res, next) {
  try {
    const { page, limit, status, courier, search, startDate, endDate, sort } = req.query;
    const result = await getAdminShipments({ page, limit, status, courier, search, startDate, endDate, sort });

    return res.status(200).json({
      success: true,
      data: {
        shipments: result.shipments,
        pagination: result.pagination
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
 * Admin: Get single shipment details
 * GET /api/v1/admin/shipments/:id
 */
export async function getShipment(req, res, next) {
  try {
    const shipment = await getAdminShipmentById(req.params.id);

    return res.status(200).json({
      success: true,
      data: {
        shipment
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
 * Admin: Create shipment for an eligible order
 * POST /api/v1/admin/orders/:orderId/shipment
 */
export async function createShipment(req, res, next) {
  try {
    const shipment = await createShipmentForOrder(req.params.orderId, req.body, req.user?.id);

    return res.status(201).json({
      success: true,
      message: 'Shipment created successfully and marked READY_FOR_DISPATCH.',
      data: {
        shipment
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid shipment data',
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

/**
 * Admin: Update shipment metadata
 * PATCH /api/v1/admin/shipments/:id
 */
export async function updateShipment(req, res, next) {
  try {
    const shipment = await updateShipmentDetails(req.params.id, req.body, req.user?.id);

    return res.status(200).json({
      success: true,
      message: 'Shipment details updated successfully.',
      data: {
        shipment
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid shipment data',
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

/**
 * Admin: Transition shipment status
 * PATCH /api/v1/admin/shipments/:id/status
 */
export async function updateStatus(req, res, next) {
  try {
    const shipment = await updateShipmentStatus(req.params.id, req.body, req.user?.id);

    return res.status(200).json({
      success: true,
      message: `Shipment status successfully transitioned to '${req.body.status}'.`,
      data: {
        shipment
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid shipment status data',
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

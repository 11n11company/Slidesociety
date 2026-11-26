import { z } from 'zod';
import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendShippingNotificationEmail } from '../utils/email.service.js';
import { confirmReservationForOrder } from './inventoryReservation.service.js';

// Valid Shipment Status State Machine Transitions
export const ALLOWED_SHIPMENT_TRANSITIONS = {
  READY_FOR_DISPATCH: ['SHIPPED'],
  SHIPPED: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURN_TO_SENDER'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURN_TO_SENDER'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_FAILED', 'RETURN_TO_SENDER'],
  DELIVERY_FAILED: ['OUT_FOR_DELIVERY', 'IN_TRANSIT', 'RETURN_TO_SENDER', 'DELIVERED'],
  RETURN_TO_SENDER: [], // Terminal
  DELIVERED: [] // Terminal: backward transition from DELIVERED strictly prohibited
};

// Zod Validation Schemas
export const createShipmentSchema = z.object({
  courierName: z.string({ required_error: 'Courier name is required' })
    .trim()
    .min(2, 'Courier name must be at least 2 characters'),
  trackingNumber: z.string({ required_error: 'Tracking number is required' })
    .trim()
    .min(3, 'Tracking number must be at least 3 characters'),
  trackingUrl: z.string()
    .trim()
    .url('Tracking URL must be a valid URL')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'Tracking URL must use HTTP or HTTPS protocol'
    })
    .optional()
    .nullable()
    .or(z.literal('')),
  estimatedDeliveryAt: z.preprocess((val) => {
    if (!val || val === '') return null;
    return typeof val === 'string' ? new Date(val) : val;
  }, z.date({ invalid_type_error: 'Invalid estimated delivery date' }).nullable().optional()),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable()
});

export const updateShipmentSchema = z.object({
  courierName: z.string().trim().min(2, 'Courier name must be at least 2 characters').optional(),
  trackingNumber: z.string().trim().min(3, 'Tracking number must be at least 3 characters').optional(),
  trackingUrl: z.string()
    .trim()
    .url('Tracking URL must be a valid URL')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'Tracking URL must use HTTP or HTTPS protocol'
    })
    .optional()
    .nullable()
    .or(z.literal('')),
  estimatedDeliveryAt: z.preprocess((val) => {
    if (!val || val === '') return null;
    return typeof val === 'string' ? new Date(val) : val;
  }, z.date({ invalid_type_error: 'Invalid estimated delivery date' }).nullable().optional()),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable()
});

export const updateShipmentStatusSchema = z.object({
  status: z.enum([
    'READY_FOR_DISPATCH',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'DELIVERY_FAILED',
    'RETURN_TO_SENDER'
  ], {
    errorMap: () => ({ message: 'Invalid shipment status value' })
  }),
  notes: z.string().trim().max(1000).optional().nullable(),
  failureReason: z.string().trim().max(1000).optional().nullable()
});

/**
 * Admin: Create a new shipment for an eligible order
 */
export async function createShipmentForOrder(orderId, input, adminUserId) {
  const validated = createShipmentSchema.parse(input);

  // 1. Find Order with payments, reservations and existing shipment
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true
        }
      },
      payments: true,
      reservations: true,
      shipment: true
    }
  });

  if (!order) {
    const error = new Error(`Order [${orderId}] not found.`);
    error.statusCode = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  // 2. Reject cancelled orders
  if (order.status === 'CANCELLED') {
    const error = new Error(`Cannot create shipment for cancelled order [${order.orderNumber}].`);
    error.statusCode = 400;
    error.code = 'ORDER_CANCELLED';
    throw error;
  }

  // 3. Reject unpaid / unconfirmed orders: Must have a CAPTURED payment
  const capturedPayment = order.payments.find((p) => p.status === 'CAPTURED');
  if (!capturedPayment) {
    const error = new Error(`Cannot create shipment for unpaid order [${order.orderNumber}]. Order payment must be CAPTURED.`);
    error.statusCode = 400;
    error.code = 'PAYMENT_REQUIRED';
    throw error;
  }

  // 4. Ensure inventory reservations are confirmed upon dispatch (auto-confirmed in step 6)
  // If payment is captured, any pending reservations are committed atomically during shipment creation.

  // 5. Prevent duplicate shipments (one shipment per order enforced)
  if (order.shipment) {
    const error = new Error(
      `A shipment already exists for order [${order.orderNumber}] (${order.shipment.trackingNumber}). Split shipments are not supported.`
    );
    error.statusCode = 400;
    error.code = 'DUPLICATE_SHIPMENT';
    throw error;
  }

  // 6. Create shipment atomically with initial status history and commit stock reservations
  const shipment = await prisma.$transaction(async (tx) => {
    // Atomically commit any pending stock reservations for this order
    await confirmReservationForOrder(tx, order.id);

    const created = await tx.shipment.create({
      data: {
        orderId: order.id,
        courierName: validated.courierName,
        trackingNumber: validated.trackingNumber,
        trackingUrl: validated.trackingUrl || null,
        status: 'READY_FOR_DISPATCH',
        estimatedDeliveryAt: validated.estimatedDeliveryAt || null,
        notes: validated.notes || null
      }
    });

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId: created.id,
        previousStatus: null,
        newStatus: 'READY_FOR_DISPATCH',
        changedByUserId: adminUserId,
        notes: validated.notes || 'Shipment created and ready for dispatch'
      }
    });

    return created;
  });

  logger.info(`Admin [${adminUserId}] created Shipment [${shipment.id}] for Order [${order.orderNumber}] via ${shipment.courierName} (${shipment.trackingNumber})`);

  return {
    ...shipment,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customer: order.user
    }
  };
}

/**
 * Admin: List all shipments with filtering, search and pagination
 */
export async function getAdminShipments({
  page = 1,
  limit = 20,
  status,
  courier,
  search,
  startDate,
  endDate,
  sort = 'newest'
}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const where = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (courier && courier !== 'ALL') {
    where.courierName = { contains: courier, mode: 'insensitive' };
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { trackingNumber: { contains: q, mode: 'insensitive' } },
      { courierName: { contains: q, mode: 'insensitive' } },
      { order: { orderNumber: { contains: q, mode: 'insensitive' } } },
      { order: { user: { fullName: { contains: q, mode: 'insensitive' } } } },
      { order: { user: { email: { contains: q, mode: 'insensitive' } } } }
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'oldest') orderBy = { createdAt: 'asc' };
  if (sort === 'dispatched_desc') orderBy = { dispatchedAt: 'desc' };

  const [totalCount, shipments] = await Promise.all([
    prisma.shipment.count({ where }),
    prisma.shipment.findMany({
      where,
      orderBy,
      skip,
      take: l,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            currency: true,
            shippingAddressSnapshot: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
  ]);

  return {
    shipments,
    pagination: {
      page: p,
      limit: l,
      totalCount,
      totalPages: Math.ceil(totalCount / l) || 1
    }
  };
}

/**
 * Admin: Get single shipment by ID with complete order details and status history
 */
export async function getAdminShipmentById(shipmentId) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true
            }
          },
          shippingAddress: true,
          items: true,
          payments: true,
          invoice: true
        }
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' },
        include: {
          changedByUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true
            }
          }
        }
      }
    }
  });

  if (!shipment) {
    const error = new Error(`Shipment [${shipmentId}] not found.`);
    error.statusCode = 404;
    error.code = 'SHIPMENT_NOT_FOUND';
    throw error;
  }

  return shipment;
}

/**
 * Admin: Update shipment metadata (courier, tracking, notes)
 */
export async function updateShipmentDetails(shipmentId, input, adminUserId) {
  const validated = updateShipmentSchema.parse(input);

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId }
  });

  if (!shipment) {
    const error = new Error(`Shipment [${shipmentId}] not found.`);
    error.statusCode = 404;
    error.code = 'SHIPMENT_NOT_FOUND';
    throw error;
  }

  // Prevent modifying delivered shipments
  if (shipment.status === 'DELIVERED') {
    const error = new Error('Cannot update details of a confirmed delivered shipment.');
    error.statusCode = 400;
    error.code = 'SHIPMENT_ALREADY_DELIVERED';
    throw error;
  }

  const updated = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      ...(validated.courierName && { courierName: validated.courierName }),
      ...(validated.trackingNumber && { trackingNumber: validated.trackingNumber }),
      ...(validated.trackingUrl !== undefined && { trackingUrl: validated.trackingUrl || null }),
      ...(validated.estimatedDeliveryAt !== undefined && { estimatedDeliveryAt: validated.estimatedDeliveryAt }),
      ...(validated.notes !== undefined && { notes: validated.notes })
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true
        }
      }
    }
  });

  logger.info(`Admin [${adminUserId}] updated Shipment [${shipmentId}] metadata.`);
  return updated;
}

/**
 * Admin: Transition shipment status according to strict shipping state machine rules
 */
export async function updateShipmentStatus(shipmentId, input, adminUserId) {
  const validated = updateShipmentStatusSchema.parse(input);
  const newStatus = validated.status;

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      order: {
        include: {
          user: true
        }
      }
    }
  });

  if (!shipment) {
    const error = new Error(`Shipment [${shipmentId}] not found.`);
    error.statusCode = 404;
    error.code = 'SHIPMENT_NOT_FOUND';
    throw error;
  }

  // Reject status update on cancelled orders
  if (shipment.order.status === 'CANCELLED') {
    const error = new Error(`Cannot update shipment for cancelled order [${shipment.order.orderNumber}].`);
    error.statusCode = 400;
    error.code = 'ORDER_CANCELLED';
    throw error;
  }

  // Reject same status
  if (shipment.status === newStatus) {
    const error = new Error(`Shipment is already in '${newStatus}' status.`);
    error.statusCode = 400;
    error.code = 'SAME_STATUS';
    throw error;
  }

  // Validate state machine transition
  const allowedNext = ALLOWED_SHIPMENT_TRANSITIONS[shipment.status] || [];
  if (!allowedNext.includes(newStatus)) {
    const error = new Error(
      `Invalid shipment status transition from '${shipment.status}' to '${newStatus}'. Allowed transitions: [${allowedNext.join(', ') || 'None (Terminal state)'}].`
    );
    error.statusCode = 400;
    error.code = 'INVALID_STATUS_TRANSITION';
    throw error;
  }

  // Delivery Failed requires failure reason
  if (newStatus === 'DELIVERY_FAILED' && !validated.failureReason && !validated.notes) {
    const error = new Error('A failure reason or note is required when recording a delivery failure.');
    error.statusCode = 400;
    error.code = 'FAILURE_REASON_REQUIRED';
    throw error;
  }

  const now = new Date();
  const updateData = {
    status: newStatus,
    ...(validated.notes && { notes: validated.notes })
  };

  if (newStatus === 'SHIPPED') {
    updateData.dispatchedAt = now;
  } else if (newStatus === 'DELIVERED') {
    updateData.deliveredAt = now;
  } else if (newStatus === 'DELIVERY_FAILED') {
    updateData.failureReason = validated.failureReason || validated.notes || 'Delivery attempt failed';
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Synchronize Order Status State Machine where appropriate
    const currentOrderStatus = shipment.order.status;

    if (newStatus === 'SHIPPED') {
      if (currentOrderStatus !== 'SHIPPED') {
        // Advance order to SHIPPED (through READY_TO_SHIP if needed to satisfy state machine)
        if (['CONFIRMED', 'PROCESSING', 'FABRICATING'].includes(currentOrderStatus)) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: shipment.order.id,
              previousStatus: currentOrderStatus,
              newStatus: 'READY_TO_SHIP',
              changedByUserId: adminUserId,
              notes: 'Order auto-advanced to READY_TO_SHIP for dispatch'
            }
          });
        }

        await tx.order.update({
          where: { id: shipment.order.id },
          data: { status: 'SHIPPED' }
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: shipment.order.id,
            previousStatus: currentOrderStatus === 'READY_TO_SHIP' ? 'READY_TO_SHIP' : 'READY_TO_SHIP',
            newStatus: 'SHIPPED',
            changedByUserId: adminUserId,
            notes: validated.notes || `Dispatched via ${shipment.courierName} (Tracking: ${shipment.trackingNumber})`
          }
        });
      }
    } else if (newStatus === 'OUT_FOR_DELIVERY') {
      if (currentOrderStatus !== 'OUT_FOR_DELIVERY' && currentOrderStatus !== 'DELIVERED') {
        await tx.order.update({
          where: { id: shipment.order.id },
          data: { status: 'OUT_FOR_DELIVERY' }
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: shipment.order.id,
            previousStatus: currentOrderStatus,
            newStatus: 'OUT_FOR_DELIVERY',
            changedByUserId: adminUserId,
            notes: validated.notes || `Consignment out for delivery with ${shipment.courierName}`
          }
        });
      }
    } else if (newStatus === 'DELIVERED') {
      if (currentOrderStatus !== 'DELIVERED') {
        await tx.order.update({
          where: { id: shipment.order.id },
          data: { status: 'DELIVERED' }
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: shipment.order.id,
            previousStatus: currentOrderStatus,
            newStatus: 'DELIVERED',
            changedByUserId: adminUserId,
            notes: validated.notes || `Delivery confirmed by ${shipment.courierName}`
          }
        });
      }
    }

    // 2. Update Shipment record (fetches synchronized order status)
    const updatedShipment = await tx.shipment.update({
      where: { id: shipmentId },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    // 3. Record immutable ShipmentStatusHistory
    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId,
        previousStatus: shipment.status,
        newStatus,
        changedByUserId: adminUserId,
        notes: validated.notes || validated.failureReason || `Shipment transitioned to ${newStatus}`
      }
    });
    // For IN_TRANSIT, DELIVERY_FAILED, RETURN_TO_SENDER:
    // Order status is preserved; shipment-level status records the exception/routing without cancelling order.

    return updatedShipment;
  });

  // 4. Trigger Customer Notification Email safely (Email failure must NOT rollback shipment update)
  try {
    const notifyStatuses = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURN_TO_SENDER'];
    if (notifyStatuses.includes(newStatus)) {
      await sendShippingNotificationEmail({
        to: shipment.order.user?.email,
        customerName: shipment.order.user?.fullName,
        order: shipment.order,
        shipment: result,
        eventType: newStatus,
        notes: validated.notes,
        failureReason: validated.failureReason
      });
    }
  } catch (emailErr) {
    logger.warn(`Failed to send shipping notification email for Order [${shipment.order.orderNumber}]: ${emailErr.message}`);
  }

  logger.info(`Admin [${adminUserId}] changed Shipment [${shipmentId}] status from '${shipment.status}' to '${newStatus}'`);

  return result;
}

/**
 * Customer: Retrieve tracking details and sanitized timeline for customer's own order
 * Strictly enforces tenant isolation (returns 404 for non-owned orders)
 * Strictly omits internal admin notes and administrative IDs
 */
export async function getCustomerOrderTracking(userId, orderId) {
  // 1. Fetch order ensuring it strictly belongs to userId (IDOR defense)
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId // Strictly restricted to calling user
    },
    include: {
      shipment: {
        include: {
          statusHistory: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              previousStatus: true,
              newStatus: true,
              createdAt: true
              // Strictly OMIT notes, changedByUserId to protect internal admin deliberations
            }
          }
        }
      }
    }
  });

  // 2. Reject if order does not exist or belongs to another customer
  if (!order) {
    const error = new Error('Order not found or you do not have permission to view tracking information.');
    error.statusCode = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  // 3. If shipment has not been created yet
  if (!order.shipment) {
    return {
      hasShipment: false,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt
      },
      shipment: null,
      timeline: [],
      message: 'Shipment is being prepared and has not been dispatched yet.'
    };
  }

  // 4. Return sanitized customer-facing tracking payload
  return {
    hasShipment: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt
    },
    shipment: {
      id: order.shipment.id,
      courierName: order.shipment.courierName,
      trackingNumber: order.shipment.trackingNumber,
      trackingUrl: order.shipment.trackingUrl,
      status: order.shipment.status,
      dispatchedAt: order.shipment.dispatchedAt,
      estimatedDeliveryAt: order.shipment.estimatedDeliveryAt,
      deliveredAt: order.shipment.deliveredAt,
      failureReason: order.shipment.failureReason || null,
      createdAt: order.shipment.createdAt,
      updatedAt: order.shipment.updatedAt
      // Internal admin notes and admin user IDs are strictly omitted!
    },
    timeline: (order.shipment.statusHistory || []).map((h) => ({
      id: h.id,
      stage: h.newStatus,
      previousStage: h.previousStatus,
      timestamp: h.createdAt
    }))
  };
}


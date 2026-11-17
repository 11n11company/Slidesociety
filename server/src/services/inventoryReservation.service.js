import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Validates availability and atomically reserves stock for order items.
 * Uses PostgreSQL row-level locks (SELECT ... FOR UPDATE) to guarantee race-condition immunity.
 * Items are locked in alphabetical order by productId to prevent deadlocks under high concurrency.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {object} params
 * @param {string} params.orderId
 * @param {Array<{ productId: string, quantity: number }>} params.items
 * @param {number} [params.expiryMinutes]
 * @returns {Promise<Array<object>>} Created StockReservation records
 */
export async function reserveStockForOrder(tx, { orderId, items, expiryMinutes = env.RESERVATION_EXPIRY_MINUTES }) {
  if (!items || items.length === 0) {
    const error = new Error('No items provided for stock reservation');
    error.statusCode = 400;
    error.code = 'EMPTY_ITEMS';
    throw error;
  }

  // Sort items deterministically by productId to prevent deadlocks under concurrent transactions
  const sortedItems = [...items].sort((a, b) => a.productId.localeCompare(b.productId));
  const reservations = [];
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  for (const item of sortedItems) {
    if (!item.quantity || item.quantity <= 0) {
      const error = new Error(`Invalid requested quantity [${item.quantity}] for item [${item.productId}].`);
      error.statusCode = 400;
      error.code = 'INVALID_QUANTITY';
      throw error;
    }

    // Acquire pessimistic row lock on product in PostgreSQL
    const products = await tx.$queryRaw`
      SELECT id, name, "isAvailable", "stockQuantity", "reservedQuantity"
      FROM "Product"
      WHERE id = ${item.productId}
      FOR UPDATE
    `;

    const product = products && products.length > 0 ? products[0] : null;

    if (!product || !product.isAvailable) {
      const error = new Error(`Product [${item.productId}] is currently unavailable or deactivated.`);
      error.statusCode = 400;
      error.code = 'PRODUCT_UNAVAILABLE';
      throw error;
    }

    const currentReserved = product.reservedQuantity || 0;
    const availableStock = product.stockQuantity - currentReserved;

    if (availableStock < item.quantity) {
      const error = new Error(
        `Insufficient stock for '${product.name}'. Available: ${Math.max(0, availableStock)}, requested: ${item.quantity}.`
      );
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_STOCK';
      error.details = {
        productId: product.id,
        productName: product.name,
        availableStock: Math.max(0, availableStock),
        requestedQuantity: item.quantity
      };
      throw error;
    }

    // Atomically increment reserved quantity on Product
    await tx.product.update({
      where: { id: item.productId },
      data: {
        reservedQuantity: { increment: item.quantity }
      }
    });

    // Create reservation record
    const reservation = await tx.stockReservation.create({
      data: {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        status: 'RESERVED',
        expiresAt
      }
    });

    reservations.push(reservation);
  }

  logger.info(`Atomically reserved stock for Order [${orderId}]: ${reservations.length} item(s) reserved until ${expiresAt.toISOString()}`);
  return reservations;
}

/**
 * Confirms reservations upon captured payment and commits physical stock.
 * Converts reserved quantity into committed sold stock (decrementing physical stockQuantity and reservedQuantity).
 * Completely idempotent: if reservations are already CONFIRMED, no second deduction occurs.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {string} orderId
 * @returns {Promise<{ success: boolean, confirmedCount: number, alreadyConfirmed?: boolean }>}
 */
export async function confirmReservationForOrder(tx, orderId) {
  const reservations = await tx.stockReservation.findMany({
    where: { orderId }
  });

  if (!reservations || reservations.length === 0) {
    logger.info(`No reservations found for Order [${orderId}] (historical order or external entry).`);
    return { success: true, confirmedCount: 0, noReservations: true };
  }

  const allConfirmed = reservations.every(r => r.status === 'CONFIRMED');
  if (allConfirmed) {
    logger.info(`Reservations for Order [${orderId}] are already CONFIRMED. Idempotent call; skipping stock deduction.`);
    return { success: true, confirmedCount: 0, alreadyConfirmed: true };
  }

  let confirmedCount = 0;

  for (const r of reservations) {
    if (r.status === 'RESERVED') {
      // Normal flow: decrement physical stockQuantity and release from reservedQuantity
      await tx.product.update({
        where: { id: r.productId },
        data: {
          stockQuantity: { decrement: r.quantity },
          reservedQuantity: { decrement: r.quantity }
        }
      });

      await tx.stockReservation.update({
        where: { id: r.id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date()
        }
      });
      confirmedCount++;
    } else if (r.status === 'RELEASED' || r.status === 'EXPIRED') {
      // Order had a transient failed attempt or expired reservation that was released,
      // but payment was subsequently successfully captured. Commit physical stock directly.
      await tx.product.update({
        where: { id: r.productId },
        data: {
          stockQuantity: { decrement: r.quantity }
        }
      });

      await tx.stockReservation.update({
        where: { id: r.id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date()
        }
      });
      confirmedCount++;
    }
  }

  logger.info(`Confirmed ${confirmedCount} reservation(s) and committed physical stock for Order [${orderId}].`);
  return { success: true, confirmedCount };
}

/**
 * Releases reservations when an order is cancelled, payment fails terminally, or expires.
 * Handles both pending (unpaid) reservations and confirmed (paid) order cancellations:
 *  - If RESERVED: decrements reservedQuantity (physical stock was not yet deducted).
 *  - If CONFIRMED: increments physical stockQuantity (restoring sold item) and marks RELEASED.
 *  - If RELEASED or EXPIRED: does nothing (idempotent, prevents duplicate stock restoration).
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {string} orderId
 * @param {object} [options]
 * @param {string} [options.reason]
 * @returns {Promise<{ success: boolean, releasedCount: number }>}
 */
export async function releaseReservationForOrder(tx, orderId, { reason = 'Order cancelled or expired' } = {}) {
  const reservations = await tx.stockReservation.findMany({
    where: { orderId }
  });

  if (!reservations || reservations.length === 0) {
    return { success: true, releasedCount: 0 };
  }

  let releasedCount = 0;

  for (const r of reservations) {
    if (r.status === 'RESERVED') {
      // Pending reservation: restore available-to-sell by decrementing reservedQuantity
      await tx.product.update({
        where: { id: r.productId },
        data: {
          reservedQuantity: { decrement: r.quantity }
        }
      });

      await tx.stockReservation.update({
        where: { id: r.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date()
        }
      });
      releasedCount++;
    } else if (r.status === 'CONFIRMED') {
      // Confirmed order cancellation: physical stock was already decremented, so restore physical stock!
      await tx.product.update({
        where: { id: r.productId },
        data: {
          stockQuantity: { increment: r.quantity }
        }
      });

      await tx.stockReservation.update({
        where: { id: r.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date()
        }
      });
      releasedCount++;
    }
    // If status is already 'RELEASED' or 'EXPIRED', skip to guarantee idempotency!
  }

  if (releasedCount > 0) {
    logger.info(`Released ${releasedCount} reservation(s) for Order [${orderId}]. Reason: ${reason}`);
  }

  return { success: true, releasedCount };
}

/**
 * Ensures a pending order has an active reservation when a payment session is initiated or retried.
 * If reservation is active, validates and keeps it.
 * If reservation was expired or released, safely re-reserves if stock is still available.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {string} orderId
 * @returns {Promise<{ status: string, valid: boolean }>}
 */
export async function ensureActiveReservationForPayment(tx, orderId) {
  const reservations = await tx.stockReservation.findMany({
    where: { orderId }
  });

  const now = new Date();

  // 1. Check if already active and not expired
  const activeUnexpired = reservations.filter(r => r.status === 'RESERVED' && r.expiresAt > now);
  if (activeUnexpired.length > 0 && activeUnexpired.length === reservations.length) {
    return { status: 'ACTIVE', valid: true };
  }

  // 2. Check if already confirmed
  const allConfirmed = reservations.length > 0 && reservations.every(r => r.status === 'CONFIRMED');
  if (allConfirmed) {
    return { status: 'CONFIRMED', valid: true };
  }

  // 3. If reservations expired or released, attempt re-reservation for pending order
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order || order.status === 'CANCELLED') {
    const error = new Error(`Cannot pay for cancelled order [${order?.orderNumber || orderId}].`);
    error.statusCode = 400;
    error.code = 'ORDER_CANCELLED';
    throw error;
  }

  // Delete old released/expired reservation records to allow fresh reservation
  await tx.stockReservation.deleteMany({
    where: { orderId }
  });

  // Re-reserve items atomically
  await reserveStockForOrder(tx, {
    orderId,
    items: order.items.map(it => ({ productId: it.productId, quantity: it.quantity })),
    expiryMinutes: env.RESERVATION_EXPIRY_MINUTES
  });

  logger.info(`Re-reserved inventory for payment retry on Order [${order.orderNumber}].`);
  return { status: 'RE_RESERVED', valid: true };
}

/**
 * Scans and releases expired unpaid stock reservations.
 * Uses conditional database updates to ensure payment verification transactions are never disrupted.
 *
 * @param {import('@prisma/client').PrismaClient} [prismaClient]
 * @returns {Promise<number>} Count of expired reservations released
 */
export async function expireStaleReservations(prismaClient = prisma) {
  const now = new Date();

  // Find reservations that have expired and are still in 'RESERVED' state
  const expiredCandidates = await prismaClient.stockReservation.findMany({
    where: {
      status: 'RESERVED',
      expiresAt: { lte: now }
    },
    include: {
      order: {
        select: { id: true, orderNumber: true, status: true }
      }
    },
    take: 100
  });

  if (!expiredCandidates || expiredCandidates.length === 0) {
    return 0;
  }

  let totalExpired = 0;

  for (const cand of expiredCandidates) {
    try {
      await prismaClient.$transaction(async (tx) => {
        // Conditional update: only update if status is STILL 'RESERVED'
        // If a payment capture concurrently confirmed it, this raw query returns 0 rows!
        const updated = await tx.$queryRaw`
          UPDATE "StockReservation"
          SET status = 'EXPIRED'::"ReservationStatus", "releasedAt" = NOW(), "updatedAt" = NOW()
          WHERE id = ${cand.id} AND status = 'RESERVED'::"ReservationStatus"
          RETURNING id, "productId", quantity, "orderId"
        `;

        if (!updated || updated.length === 0) {
          // Concurrently confirmed or already processed; skip
          return;
        }

        const resRecord = updated[0];

        // Restore available quantity by decrementing reservedQuantity
        await tx.product.update({
          where: { id: resRecord.productId },
          data: {
            reservedQuantity: { decrement: resRecord.quantity }
          }
        });

        // If parent order is still PENDING, update to CANCELLED due to expiration
        if (cand.order && (cand.order.status === 'PENDING' || cand.order.status === 'PENDING_PAYMENT')) {
          await tx.order.update({
            where: { id: cand.order.id },
            data: { status: 'CANCELLED' }
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: cand.order.id,
              previousStatus: cand.order.status,
              newStatus: 'CANCELLED',
              notes: 'Order cancelled due to stock reservation expiration (unpaid checkout timeout)'
            }
          });

          logger.info(`Order [${cand.order.orderNumber}] automatically cancelled due to reservation expiration.`);
        }

        totalExpired++;
      });
    } catch (err) {
      logger.error(`Failed to expire reservation [${cand.id}]: ${err.message}`);
    }
  }

  return totalExpired;
}

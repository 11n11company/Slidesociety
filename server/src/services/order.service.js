import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import {
  reserveStockForOrder,
  releaseReservationForOrder,
  confirmReservationForOrder
} from './inventoryReservation.service.js';

// Valid Order Status State Machine Transitions
const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
  PENDING_PAYMENT: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'FABRICATING', 'CANCELLED'],
  PROCESSING: ['FABRICATING', 'READY_TO_SHIP', 'CANCELLED'],
  FABRICATING: ['READY_TO_SHIP', 'CANCELLED'],
  READY_TO_SHIP: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  CANCELLED: [], // Terminal
  RETURNED: [],  // Terminal
  REFUNDED: []   // Terminal
};

// Zod Validation Schemas
const rawAddressSchema = z.object({
  recipientName: z.string().trim().min(2, 'Recipient name is required'),
  phone: z.string().trim().min(7, 'Valid contact phone number is required'),
  streetLine1: z.string().trim().min(3, 'Street address is required'),
  streetLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State / Province is required'),
  postalCode: z.string().trim().min(3, 'Postal code is required'),
  country: z.string().trim().default('India')
});

export const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid().optional(),
  shippingAddress: z.preprocess((val) => {
    if (!val || typeof val !== 'object') return val;
    return {
      recipientName: val.recipientName || val.fullName || val.name || '',
      phone: val.phone || val.phoneNumber || '',
      streetLine1: val.streetLine1 || val.street || val.addressLine1 || val.address || '',
      streetLine2: val.streetLine2 || val.addressLine2 || '',
      city: val.city || '',
      state: val.state || '',
      postalCode: val.postalCode || val.pincode || val.zipCode || '',
      country: val.country || 'India'
    };
  }, rawAddressSchema).optional(),
  customerNotes: z.string().trim().max(500).optional(),
  idempotencyKey: z.string().trim().min(8).max(100).optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).default(1)
  })).optional()
}).refine(data => data.shippingAddressId || data.shippingAddress, {
  message: 'Either shippingAddressId or shippingAddress object must be provided',
  path: ['shippingAddress']
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(3, 'Please provide a reason for cancellation').max(300).optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'FABRICATING',
    'READY_TO_SHIP',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED'
  ]),
  notes: z.string().trim().max(500).optional()
});

/**
 * Generates an atomic, sequential human-readable order number (e.g. SLIDE-20261117-1001)
 */
async function generateOrderNumber(tx = prisma) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const prefix = `SLIDE-${year}${month}${day}-`;

  try {
    const seqResult = await tx.$queryRaw`SELECT nextval('order_number_seq')::text as num`;
    if (seqResult && seqResult.length > 0) {
      return `${prefix}${seqResult[0].num}`;
    }
  } catch (err) {
    logger.warn(`Sequence error in generateOrderNumber: ${err.message}. Using fallback.`);
  }

  // Fallback if sequence is inaccessible
  const entropy = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${Date.now().toString().slice(-4)}-${entropy}`;
}

/**
 * Create a new customer order from their PostgreSQL database cart
 */
export async function createCustomerOrder(userId, input) {
  const validated = createOrderSchema.parse(input);

  // 1. Idempotency Check
  if (validated.idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: validated.idempotencyKey },
      include: {
        items: true,
        statusHistory: true,
        shippingAddress: true
      }
    });
    if (existingOrder) {
      logger.info(`Idempotent request matched existing order [${existingOrder.orderNumber}]`);
      return {
        order: existingOrder,
        isIdempotentReplay: true
      };
    }
  }

  // 2. Fetch Customer Cart from input items OR from PostgreSQL cart
  let cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  let cartItems = [];

  if (validated.items && validated.items.length > 0) {
    for (const it of validated.items) {
      let prod = await prisma.product.findUnique({
        where: { id: it.productId }
      });
      // Fallback fuzzy match for truncated IDs or legacy slug handles
      if (!prod && it.productId) {
        prod = await prisma.product.findFirst({
          where: {
            OR: [
              { id: { startsWith: it.productId.slice(0, 30) } },
              { id: { contains: it.productId.slice(0, 20) } }
            ]
          }
        });
      }
      if (prod) {
        cartItems.push({
          productId: prod.id,
          quantity: it.quantity || 1,
          product: prod
        });
      }
    }
  }

  // Fallback to database cart if validated.items was not provided
  if (cartItems.length === 0 && cart && cart.items && cart.items.length > 0) {
    cartItems = cart.items;
  }

  if (cartItems.length === 0) {
    const error = new Error('Cannot place an order with an empty cart. Please add items to your cart.');
    error.statusCode = 400;
    error.code = 'EMPTY_CART';
    throw error;
  }

  // 3. Address Resolution & Validation
  let addressId = validated.shippingAddressId || null;
  let addressSnapshot = null;

  if (addressId) {
    // Verify address belongs to customer
    const addr = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });
    if (!addr) {
      const error = new Error('Selected delivery address does not belong to your account.');
      error.statusCode = 400;
      error.code = 'INVALID_ADDRESS';
      throw error;
    }
    addressSnapshot = JSON.stringify(addr);
  } else if (validated.shippingAddress) {
    // Create new address record for user
    const newAddr = await prisma.address.create({
      data: {
        userId,
        recipientName: validated.shippingAddress.recipientName,
        phone: validated.shippingAddress.phone,
        streetLine1: validated.shippingAddress.streetLine1,
        streetLine2: validated.shippingAddress.streetLine2 || null,
        city: validated.shippingAddress.city,
        state: validated.shippingAddress.state,
        postalCode: validated.shippingAddress.postalCode,
        country: validated.shippingAddress.country || 'India',
        addressType: 'SHIPPING'
      }
    });
    addressId = newAddr.id;
    addressSnapshot = JSON.stringify(newAddr);
  }

  // 4. Server-Side Price Calculation & Verification
  // Never trust client-submitted prices! Always query PostgreSQL Product table.
  let subtotal = 0;
  const orderItemsData = [];

  for (const cartItem of cartItems) {
    const product = cartItem.product;
    if (!product || !product.isAvailable) {
      const error = new Error(`Product [${cartItem.productId}] is currently unavailable or out of stock.`);
      error.statusCode = 400;
      error.code = 'PRODUCT_UNAVAILABLE';
      throw error;
    }

    if (cartItem.quantity <= 0) {
      const error = new Error(`Invalid quantity [${cartItem.quantity}] for item [${cartItem.productId}].`);
      error.statusCode = 400;
      error.code = 'INVALID_QUANTITY';
      throw error;
    }

    const currentReserved = product.reservedQuantity || 0;
    const availableStock = product.stockQuantity - currentReserved;
    if (availableStock < cartItem.quantity) {
      const error = new Error(
        `Insufficient stock for '${product.name}'. Available: ${Math.max(0, availableStock)}, requested: ${cartItem.quantity}.`
      );
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_STOCK';
      error.details = {
        productId: product.id,
        productName: product.name,
        availableStock: Math.max(0, availableStock),
        requestedQuantity: cartItem.quantity
      };
      throw error;
    }

    const unitPrice = Number(product.priceInr);
    const lineTotal = unitPrice * cartItem.quantity;
    subtotal += lineTotal;

    orderItemsData.push({
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      productImageUrl: product.imageUrl,
      unitPrice,
      quantity: cartItem.quantity,
      lineTotal,
      customRigName: cartItem.customRigName || null
    });
  }

  // 5. Configurable Shipping & Tax Rules
  // Free shipping for orders >= ₹50,000, otherwise ₹1,500 standard sim-racing freight
  const shippingAmount = subtotal >= 50000 ? 0.00 : 1500.00;
  
  // Tax breakdown: 18% GST (Standard in India for gaming hardware / electronic peripherals)
  const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
  const discountAmount = 0.00;
  const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

  // 6. Prisma Database Transaction (Stock reservation + Order creation + cart clearance)
  // If anything fails, transaction rolls back automatically and cart is 100% preserved!
  const createdOrder = await prisma.$transaction(async (tx) => {
    // 6a. Lock products deterministically FOR UPDATE to guarantee ACID serialization
    // and prevent PostgreSQL foreign-key deadlock with concurrent OrderItem inserts
    const sortedProductIds = [...new Set(orderItemsData.map(i => i.productId))].sort();
    for (const prodId of sortedProductIds) {
      await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${prodId} FOR UPDATE`;
    }

    // 6b. Generate Unique Sequential Order Number atomically from PostgreSQL sequence
    const orderNumber = await generateOrderNumber(tx);

    // 6c. Create Order Record
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        shippingAddressId: addressId,
        shippingAddressSnapshot: addressSnapshot,
        subtotal,
        shippingAmount,
        taxAmount,
        discountAmount,
        totalAmount,
        currency: 'INR',
        status: 'PENDING',
        notes: validated.customerNotes || null,
        idempotencyKey: validated.idempotencyKey || null,
        items: {
          create: orderItemsData
        },
        statusHistory: {
          create: {
            previousStatus: null,
            newStatus: 'PENDING',
            changedByUserId: userId,
            notes: 'Order placed by customer (pending payment)'
          }
        }
      },
      include: {
        items: true,
        statusHistory: true,
        shippingAddress: true
      }
    });

    // 6c. Atomically Reserve Stock for Order Items (ACID row lock)
    // If stock is insufficient, throws 400 INSUFFICIENT_STOCK and transaction rolls back completely!
    await reserveStockForOrder(tx, {
      orderId: order.id,
      items: orderItemsData.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      expiryMinutes: env.RESERVATION_EXPIRY_MINUTES
    });

    // 6d. Clear Purchased Items from Customer Cart (if cart existed in DB)
    if (cart && cart.id) {
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    return order;
  });

  logger.info(`Order [${createdOrder.orderNumber}] created successfully for user [${userId}]. Total: INR ${totalAmount}`);

  return {
    order: createdOrder,
    isIdempotentReplay: false
  };
}

/**
 * List orders for authenticated customer with pagination
 */
export async function getCustomerOrders(userId, { page = 1, limit = 10, status = null } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  const where = { userId };
  if (status && status !== 'ALL') {
    where.status = status;
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: l,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        shippingAddress: true,
        invoice: true,
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            providerPaymentId: true,
            verifiedAt: true
          }
        }
      }
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders,
    pagination: {
      page: p,
      limit: l,
      totalCount,
      totalPages: Math.ceil(totalCount / l) || 1
    }
  };
}

/**
 * Retrieve one order belonging to the authenticated customer
 * Enforces ownership check (prevents IDOR access to other customers' orders)
 */
export async function getCustomerOrderById(userId, orderId) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId // Strictly restricted to calling user
    },
    include: {
      items: {
        orderBy: { createdAt: 'asc' }
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' }
      },
      shippingAddress: true,
      invoice: true,
      shipment: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          amount: true,
          providerPaymentId: true,
          method: true,
          verifiedAt: true
        }
      }
    }
  });

  if (!order) {
    const error = new Error('Order not found or you do not have permission to view this order.');
    error.statusCode = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  return order;
}

/**
 * Customer Order Cancellation Request
 * Allowed only for PENDING or CONFIRMED orders
 */
export async function cancelCustomerOrder(userId, orderId, reason) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId }
  });

  if (!order) {
    const error = new Error('Order not found or you do not have permission to modify this order.');
    error.statusCode = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  // Check eligibility for cancellation
  const allowedForCustomerCancellation = ['PENDING', 'PENDING_PAYMENT', 'CONFIRMED'];
  if (!allowedForCustomerCancellation.includes(order.status)) {
    const error = new Error(
      `Order [${order.orderNumber}] cannot be cancelled because its current status is '${order.status}'. Cancellation is only available before fabrication or shipment.`
    );
    error.statusCode = 400;
    error.code = 'CANCELLATION_NOT_ALLOWED';
    throw error;
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' }
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: 'CANCELLED',
        changedByUserId: userId,
        notes: reason || 'Cancelled by customer'
      }
    });

    // Release stock reservation and restore inventory (handles pending and confirmed)
    await releaseReservationForOrder(tx, order.id, { reason: reason || 'Cancelled by customer' });

    return updated;
  });

  logger.info(`Order [${order.orderNumber}] cancelled by customer [${userId}]. Reason: ${reason || 'None'}`);

  return updatedOrder;
}

/**
 * Admin: List all orders across all customers with search, filters and sorting
 */
export async function getAdminOrders({
  page = 1,
  limit = 15,
  status = null,
  paymentStatus = null,
  search = null,
  startDate = null,
  endDate = null,
  sort = 'desc'
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
  const skip = (p - 1) * l;

  const where = {};
  const validOrderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'FABRICATING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (status && status !== 'ALL') {
    if (!validOrderStatuses.includes(status.toUpperCase())) {
      const error = new Error(`Invalid order status filter '${status}'. Valid statuses: ${validOrderStatuses.join(', ')}`);
      error.statusCode = 400;
      error.code = 'INVALID_FILTER';
      throw error;
    }
    where.status = status.toUpperCase();
  }

  const validPaymentStatuses = ['PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'];
  if (paymentStatus && paymentStatus !== 'ALL') {
    if (!validPaymentStatuses.includes(paymentStatus.toUpperCase())) {
      const error = new Error(`Invalid payment status filter '${paymentStatus}'. Valid statuses: ${validPaymentStatuses.join(', ')}`);
      error.statusCode = 400;
      error.code = 'INVALID_FILTER';
      throw error;
    }
    where.payments = {
      some: {
        status: paymentStatus.toUpperCase()
      }
    };
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      const s = new Date(startDate);
      if (!isNaN(s.getTime())) where.createdAt.gte = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      if (!isNaN(e.getTime())) where.createdAt.lte = e;
    }
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { user: { fullName: { contains: q, mode: 'insensitive' } } }
    ];
  }

  const sortDirection = sort === 'asc' ? 'asc' : 'desc';

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: l,
      orderBy: { createdAt: sortDirection },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        items: true,
        shippingAddress: true,
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            issuedAt: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            amount: true,
            method: true,
            providerPaymentId: true,
            verifiedAt: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        shipment: true
      }
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders,
    pagination: {
      page: p,
      limit: l,
      totalCount,
      totalPages: Math.ceil(totalCount / l) || 1
    }
  };
}

/**
 * Admin: Retrieve single order with complete customer details and audit history
 */
export async function getAdminOrderById(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true
        }
      },
      items: {
        orderBy: { createdAt: 'asc' }
      },
      shippingAddress: true,
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
      },
      payments: true,
      invoice: true,
      shipment: {
        include: {
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
      }
    }
  });

  if (!order) {
    const error = new Error(`Order [${orderId}] not found.`);
    error.statusCode = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  return order;
}

/**
 * Admin: Transition order status according to strict state machine rules
 */
export async function updateOrderStatusByAdmin(orderId, { newStatus, notes, adminUserId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    const error = new Error(`Order [${orderId}] not found.`);
    error.statusCode = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  if (order.status === newStatus) {
    const error = new Error(`Order is already in '${newStatus}' status.`);
    error.statusCode = 400;
    error.code = 'SAME_STATUS';
    throw error;
  }

  // Validate state machine transition
  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
  if (!allowedNextStatuses.includes(newStatus)) {
    const error = new Error(
      `Invalid status transition from '${order.status}' to '${newStatus}'. Allowed transitions: [${allowedNextStatuses.join(', ') || 'None (Terminal state)'}].`
    );
    error.statusCode = 400;
    error.code = 'INVALID_STATUS_TRANSITION';
    throw error;
  }

  // Enforce Payment Requirement: Do not allow an unpaid or merely authorized order to enter production
  const productionStatuses = ['PROCESSING', 'FABRICATING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'];
  if (productionStatuses.includes(newStatus)) {
    const capturedPayment = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
        status: 'CAPTURED'
      }
    });

    if (!capturedPayment) {
      const error = new Error(
        `Order [${order.orderNumber}] cannot transition to production status '${newStatus}' without a verified CAPTURED payment.`
      );
      error.statusCode = 400;
      error.code = 'PAYMENT_REQUIRED';
      throw error;
    }
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: newStatus },
      include: {
        items: true,
        statusHistory: true,
        shippingAddress: true
      }
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus,
        changedByUserId: adminUserId,
        notes: notes || `Status updated to ${newStatus} by administrator`
      }
    });

    if (newStatus === 'CANCELLED') {
      await releaseReservationForOrder(tx, order.id, { reason: notes || `Cancelled by admin [${adminUserId}]` });
    }

    return updated;
  });

  logger.info(`Admin [${adminUserId}] changed Order [${order.orderNumber}] status from '${order.status}' to '${newStatus}'`);

  return updatedOrder;
}

/**
 * Admin: Update order items, shipping fare, and optional discount
 * Recalculates subtotal, 18% GST tax, and total amount.
 * If an invoice exists, automatically regenerates it so the PDF bill matches.
 */
export async function updateOrderFareAndItems(orderId, { items, shippingAmount, discountAmount, notes, adminUserId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shippingAddress: true,
      payments: true,
      invoice: true
    }
  });

  if (!order) {
    const error = new Error(`Order [${orderId}] not found.`);
    error.statusCode = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  if (['CANCELLED', 'RETURNED'].includes(order.status)) {
    const error = new Error(`Cannot modify items or fare for order in terminal status '${order.status}'.`);
    error.statusCode = 400;
    error.code = 'INVALID_ORDER_STATE';
    throw error;
  }

  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('At least one item must be present in the order.');
    error.statusCode = 400;
    error.code = 'EMPTY_ITEMS';
    throw error;
  }

  // Fetch product definitions to ensure items are valid and metadata is preserved
  const productIds = items.map(it => it.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  const validatedItems = [];
  let subtotal = 0;

  for (const it of items) {
    const qty = parseInt(it.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      const error = new Error(`Invalid quantity '${it.quantity}' for product [${it.productId}]. Must be >= 1.`);
      error.statusCode = 400;
      error.code = 'INVALID_QUANTITY';
      throw error;
    }

    const prod = productMap.get(it.productId);
    const unitPrice = (it.unitPrice !== undefined && it.unitPrice !== null && !isNaN(Number(it.unitPrice)) && Number(it.unitPrice) >= 0)
      ? Number(it.unitPrice)
      : (prod ? Number(prod.priceInr) : Number(it.price || 0));

    const productName = it.productName || prod?.name || 'Custom Hardware Component';
    const productCategory = it.productCategory || prod?.category || 'Hardware';
    const productImageUrl = it.productImageUrl || prod?.imageUrl || null;
    const lineTotal = unitPrice * qty;

    subtotal += lineTotal;

    validatedItems.push({
      orderId: order.id,
      productId: it.productId,
      productName,
      productCategory,
      productImageUrl,
      unitPrice,
      quantity: qty,
      lineTotal,
      customRigName: it.customRigName || null
    });
  }

  const parsedShipping = (shippingAmount !== undefined && shippingAmount !== null && !isNaN(Number(shippingAmount)) && Number(shippingAmount) >= 0)
    ? Number(shippingAmount)
    : Number(order.shippingAmount);

  const parsedDiscount = (discountAmount !== undefined && discountAmount !== null && !isNaN(Number(discountAmount)) && Number(discountAmount) >= 0)
    ? Number(discountAmount)
    : Number(order.discountAmount);

  const taxAmount = Math.round(subtotal * 0.18);
  const totalAmount = Math.max(0, subtotal + parsedShipping - parsedDiscount);

  await prisma.$transaction(async (tx) => {
    // 1. Replace order items
    await tx.orderItem.deleteMany({ where: { orderId: order.id } });
    await tx.orderItem.createMany({ data: validatedItems });

    // 2. Update order totals
    await tx.order.update({
      where: { id: order.id },
      data: {
        subtotal,
        taxAmount,
        shippingAmount: parsedShipping,
        discountAmount: parsedDiscount,
        totalAmount
      }
    });

    // 3. Log history
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: order.status,
        changedByUserId: adminUserId,
        notes: notes || `Order items and fare modified by admin: Subtotal ₹${subtotal}, Shipping ₹${parsedShipping}, Total ₹${totalAmount}`
      }
    });
  });

  // 4. If invoice already exists, regenerate it to reflect new items, subtotal, and fare
  if (order.invoice) {
    try {
      const { createInvoiceForOrder } = await import('./invoice.service.js');
      await createInvoiceForOrder({ orderId: order.id, triggerSource: 'admin_order_update', forceRegenerate: true });
    } catch (invErr) {
      logger.warn(`Could not regenerate invoice after order update: ${invErr.message}`);
    }
  }

  logger.info(`Admin [${adminUserId}] updated items and fare for Order [${order.orderNumber}]. New Total: ${totalAmount}`);
  return getAdminOrderById(order.id);
}

/**
 * Admin: Record payment for order (e.g. UPI, Bank Transfer NEFT/IMPS, Cash, Manual)
 * Creates a CAPTURED payment record, optionally sets order status to CONFIRMED,
 * and automatically triggers official tax invoice generation.
 */
export async function recordOrderPaymentByAdmin(orderId, { amount, method, transactionReference, notes, autoConfirm = true, adminUserId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shippingAddress: true,
      payments: true,
      invoice: true
    }
  });

  if (!order) {
    const error = new Error(`Order [${orderId}] not found.`);
    error.statusCode = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  const payAmount = (amount !== undefined && amount !== null && !isNaN(Number(amount)) && Number(amount) > 0)
    ? Number(amount)
    : Number(order.totalAmount);

  const payMethod = method ? String(method).toUpperCase() : 'UPI';
  const txRef = transactionReference ? String(transactionReference).trim() : `MANUAL_${Date.now()}`;

  await prisma.$transaction(async (tx) => {
    // 1. Create Payment record with CAPTURED status
    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: 'MANUAL',
        providerOrderId: `ord_${order.orderNumber}`,
        providerPaymentId: txRef,
        paymentGateway: 'MANUAL',
        amount: payAmount,
        currency: order.currency || 'INR',
        status: 'CAPTURED',
        method: payMethod,
        paidAt: new Date(),
        verifiedAt: new Date(),
        rawResponse: JSON.stringify({
          recordedBy: adminUserId,
          method: payMethod,
          transactionReference: txRef,
          notes: notes || 'Manual payment recorded by administrator',
          timestamp: new Date().toISOString()
        })
      }
    });

    // 2. Transition order status to CONFIRMED if autoConfirm or currently PENDING
    if (autoConfirm || order.status === 'PENDING') {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' }
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          newStatus: 'CONFIRMED',
          changedByUserId: adminUserId,
          notes: notes || `Payment of ₹${payAmount} captured via ${payMethod} (${txRef}). Order confirmed.`
        }
      });
    }

    // 3. Atomically confirm inventory reservations and deduct stock
    await confirmReservationForOrder(tx, order.id);
  });

  // 3. Generate official Tax Invoice
  try {
    const { createInvoiceForOrder } = await import('./invoice.service.js');
    await createInvoiceForOrder({ orderId: order.id, triggerSource: 'admin_payment_confirmation', forceRegenerate: true });
  } catch (invErr) {
    logger.warn(`Could not generate invoice after recording payment: ${invErr.message}`);
  }

  logger.info(`Admin [${adminUserId}] recorded payment for Order [${order.orderNumber}]: ₹${payAmount} via ${payMethod}.`);
  return getAdminOrderById(order.id);
}

/**
 * Admin: Generate or force-regenerate tax invoice for an order.
 */
export async function generateAdminInvoice(orderId) {
  const { createInvoiceForOrder } = await import('./invoice.service.js');
  return createInvoiceForOrder({ orderId, triggerSource: 'admin_manual_invoice', forceRegenerate: true });
}

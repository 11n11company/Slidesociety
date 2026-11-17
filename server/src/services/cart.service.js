import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Get or create an active cart for an authenticated user
 */
export async function getOrCreateUserCart(userId) {
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

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  return cart;
}

/**
 * Merge guest cart items into the authenticated customer's cart
 * Preserves all quantities, custom configurations, and prevents duplicate item records
 */
export async function mergeGuestCart(userId, guestItems) {
  const cart = await getOrCreateUserCart(userId);

  // Normalize guestItems into array of { productId, quantity, customRigName }
  const normalizedItems = [];

  if (Array.isArray(guestItems)) {
    for (const it of guestItems) {
      if (it && it.productId && it.quantity > 0) {
        normalizedItems.push({
          productId: it.productId,
          quantity: parseInt(it.quantity, 10) || 1,
          customRigName: it.customRigName || null
        });
      }
    }
  } else if (guestItems && typeof guestItems === 'object') {
    // Map format: { "frame-x": 1, "pedals-pro": 2 }
    for (const [productId, qty] of Object.entries(guestItems)) {
      if (qty > 0) {
        normalizedItems.push({
          productId,
          quantity: parseInt(qty, 10) || 1,
          customRigName: null
        });
      }
    }
  }

  // Upsert each item into the user's cart
  for (const item of normalizedItems) {
    // Verify product exists in database
    const productExists = await prisma.product.findUnique({
      where: { id: item.productId }
    });

    if (!productExists) {
      logger.warn(`Skipping nonexistent product during cart merge: [${item.productId}]`);
      continue;
    }

    // Check if item already exists in this cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: item.productId,
        customRigName: item.customRigName
      }
    });

    if (existingCartItem) {
      // Merge quantity without duplicating row
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + item.quantity
        }
      });
    } else {
      // Create new cart item row
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
          customRigName: item.customRigName
        }
      });
    }
  }

  // Return the fresh merged cart with full product details
  return getUserCartDetails(userId);
}

/**
 * Retrieve full cart details for a user
 */
export async function getUserCartDetails(userId) {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              priceInr: true,
              priceEurDisplay: true,
              imageUrl: true,
              isAvailable: true,
              stockQuantity: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!cart) {
    return {
      items: [],
      cartMap: {},
      totalCount: 0,
      subtotalInr: 0
    };
  }

  const cartMap = {};
  let totalCount = 0;
  let subtotalInr = 0;

  for (const item of cart.items) {
    cartMap[item.productId] = (cartMap[item.productId] || 0) + item.quantity;
    totalCount += item.quantity;
    subtotalInr += Number(item.product.priceInr) * item.quantity;
  }

  return {
    cartId: cart.id,
    items: cart.items,
    cartMap,
    totalCount,
    subtotalInr
  };
}

/**
 * Update single cart item quantity
 */
export async function updateCartItem(userId, { productId, quantity, customRigName = null }) {
  const cart = await getOrCreateUserCart(userId);

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      customRigName
    }
  });

  if (quantity <= 0) {
    if (existing) {
      await prisma.cartItem.delete({ where: { id: existing.id } });
    }
  } else {
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          customRigName
        }
      });
    }
  }

  return getUserCartDetails(userId);
}

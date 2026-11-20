import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

const PRODUCT_SELECT = {
  id: true,
  name: true,
  category: true,
  priceInr: true,
  priceEurDisplay: true,
  specDescription: true,
  compatibilityNotes: true,
  rating: true,
  isAvailable: true,
  stockQuantity: true,
  imageUrl: true
};

/**
 * Get all wishlist items for an authenticated user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getUserWishlist(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: PRODUCT_SELECT
      }
    }
  });

  return items;
}

/**
 * Get wishlist item count for a user
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function getWishlistCount(userId) {
  if (!userId) {
    return 0;
  }

  return await prisma.wishlistItem.count({
    where: { userId }
  });
}

/**
 * Add a product to the user's wishlist
 * Idempotent: If already in wishlist, returns existing item without error
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<Object>}
 */
export async function addToWishlist(userId, productId) {
  if (!userId) {
    const err = new Error('User ID is required');
    err.statusCode = 401;
    throw err;
  }

  if (!productId || typeof productId !== 'string') {
    const err = new Error('Product ID is required');
    err.statusCode = 400;
    throw err;
  }

  // Verify product exists in database
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: PRODUCT_SELECT
  });

  if (!product) {
    const err = new Error(`Product with ID '${productId}' not found`);
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  // Check if item is already in user's wishlist (idempotency)
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    },
    include: {
      product: {
        select: PRODUCT_SELECT
      }
    }
  });

  if (existing) {
    return existing;
  }

  // Create new wishlist item
  const newItem = await prisma.wishlistItem.create({
    data: {
      userId,
      productId
    },
    include: {
      product: {
        select: PRODUCT_SELECT
      }
    }
  });

  logger.info(`Product '${productId}' added to wishlist for user '${userId}'`);
  return newItem;
}

/**
 * Remove a product from the user's wishlist
 * Idempotent: If not found, resolves successfully without throwing
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<{ removed: boolean, count: number }>}
 */
export async function removeFromWishlist(userId, productId) {
  if (!userId) {
    const err = new Error('User ID is required');
    err.statusCode = 401;
    throw err;
  }

  if (!productId || typeof productId !== 'string') {
    const err = new Error('Product ID is required');
    err.statusCode = 400;
    throw err;
  }

  const deleteResult = await prisma.wishlistItem.deleteMany({
    where: {
      userId,
      productId
    }
  });

  logger.info(`Product '${productId}' removed from wishlist for user '${userId}' (count: ${deleteResult.count})`);
  return {
    removed: deleteResult.count > 0,
    count: deleteResult.count
  };
}

/**
 * Merge guest wishlist items into user account upon sign-in
 * @param {string} userId
 * @param {Array<string|Object>} guestItems - Array of productIds or objects with id/productId
 * @returns {Promise<Array>} Updated wishlist
 */
export async function mergeGuestWishlist(userId, guestItems) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!Array.isArray(guestItems) || guestItems.length === 0) {
    return await getUserWishlist(userId);
  }

  // Extract clean string product IDs
  const productIds = [];
  for (const item of guestItems) {
    let id = null;
    if (typeof item === 'string') {
      id = item.trim();
    } else if (item && typeof item === 'object') {
      id = (item.productId || item.id || '').trim();
    }
    if (id && !productIds.includes(id)) {
      productIds.push(id);
    }
  }

  if (productIds.length > 0) {
    // Find all valid existing products from the database
    const existingProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: { id: true }
    });

    const validProductIds = new Set(existingProducts.map((p) => p.id));

    // Batch insert items that don't already exist for this user
    for (const pid of productIds) {
      if (validProductIds.has(pid)) {
        try {
          await prisma.wishlistItem.upsert({
            where: {
              userId_productId: {
                userId,
                productId: pid
              }
            },
            create: {
              userId,
              productId: pid
            },
            update: {} // No-op if already present
          });
        } catch (e) {
          logger.warn(`Failed to merge wishlist item ${pid} for user ${userId}: ${e.message}`);
        }
      }
    }
  }

  return await getUserWishlist(userId);
}

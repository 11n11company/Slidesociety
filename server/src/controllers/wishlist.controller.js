import {
  getUserWishlist,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
  mergeGuestWishlist
} from '../services/wishlist.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Get customer's wishlist items
 * GET /api/v1/wishlist
 */
export async function getWishlist(req, res, next) {
  try {
    const items = await getUserWishlist(req.user.id);
    return ApiResponse.success(res, items, 'Wishlist retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get customer's wishlist count
 * GET /api/v1/wishlist/count
 */
export async function getCount(req, res, next) {
  try {
    const count = await getWishlistCount(req.user.id);
    return ApiResponse.success(res, { count }, 'Wishlist count retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Add a product to wishlist
 * POST /api/v1/wishlist/:productId
 */
export async function addItem(req, res, next) {
  try {
    const { productId } = req.params;
    if (!productId) {
      return ApiResponse.error(res, 'Product ID parameter is required', 400);
    }

    const item = await addToWishlist(req.user.id, productId);
    return ApiResponse.success(res, item, 'Product added to wishlist', 201);
  } catch (err) {
    if (err.statusCode === 404 || err.code === 'NOT_FOUND') {
      return ApiResponse.error(res, err.message || 'Product not found', 404, null, 'NOT_FOUND');
    }
    next(err);
  }
}

/**
 * Remove a product from wishlist
 * DELETE /api/v1/wishlist/:productId
 */
export async function removeItem(req, res, next) {
  try {
    const { productId } = req.params;
    if (!productId) {
      return ApiResponse.error(res, 'Product ID parameter is required', 400);
    }

    const result = await removeFromWishlist(req.user.id, productId);
    return ApiResponse.success(res, result, 'Product removed from wishlist');
  } catch (err) {
    next(err);
  }
}

/**
 * Merge guest wishlist items into customer profile
 * POST /api/v1/wishlist/merge
 */
export async function mergeWishlist(req, res, next) {
  try {
    const guestItems = req.body.items || req.body.productIds || req.body.wishlist || [];
    const items = await mergeGuestWishlist(req.user.id, guestItems);
    return ApiResponse.success(res, {
      items,
      count: items.length
    }, 'Guest wishlist merged successfully with customer profile');
  } catch (err) {
    next(err);
  }
}

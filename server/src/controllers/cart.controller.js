import {
  mergeGuestCart,
  getUserCartDetails,
  updateCartItem
} from '../services/cart.service.js';
import { prisma } from '../config/db.js';

/**
 * Merge Guest Cart with Authenticated Customer Cart
 * POST /api/v1/cart/merge
 */
export async function mergeCart(req, res, next) {
  try {
    const { items } = req.body;
    const cartDetails = await mergeGuestCart(req.user.id, items);

    return res.status(200).json({
      success: true,
      message: 'Guest cart merged successfully with customer profile.',
      data: cartDetails
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Customer Cart
 * GET /api/v1/cart
 */
export async function getCart(req, res, next) {
  try {
    const cartDetails = await getUserCartDetails(req.user.id);

    return res.status(200).json({
      success: true,
      data: cartDetails
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Cart Item Quantity
 * PUT /api/v1/cart/items
 */
export async function updateItem(req, res, next) {
  try {
    const { productId, quantity, customRigName } = req.body;
    const cartDetails = await updateCartItem(req.user.id, {
      productId,
      quantity: parseInt(quantity, 10),
      customRigName
    });

    return res.status(200).json({
      success: true,
      data: cartDetails
    });
  } catch (err) {
    next(err);
  }
}


import {
  getProductReviews as fetchProductReviews,
  checkReviewEligibility,
  createReview as submitProductReview,
  updateCustomerReview,
  deleteCustomerReview,
  getAdminReviews as fetchAdminReviews,
  moderateReview as applyReviewModeration
} from '../services/review.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Public: Get approved reviews and rating aggregate for a product
 * GET /api/v1/products/:productId/reviews
 */
export async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    const { page, limit } = req.query;
    const userId = req.user?.id || null;

    const data = await fetchProductReviews(productId, { page, limit, userId });
    return ApiResponse.success(res, data, 'Product reviews retrieved successfully');
  } catch (err) {
    if (err.statusCode) {
      return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
    }
    next(err);
  }
}

/**
 * Customer: Check verified purchase review eligibility
 * GET /api/v1/products/:productId/reviews/eligibility
 */
export async function checkEligibility(req, res, next) {
  try {
    const { productId } = req.params;
    const result = await checkReviewEligibility(req.user.id, productId);
    return ApiResponse.success(res, result, 'Review eligibility checked successfully');
  } catch (err) {
    if (err.statusCode) {
      return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
    }
    next(err);
  }
}

/**
 * Customer: Submit a new product review
 * POST /api/v1/products/:productId/reviews
 */
export async function createReview(req, res, next) {
  try {
    const { productId } = req.params;
    const { rating, title, comment, orderId } = req.body;

    const review = await submitProductReview(req.user.id, productId, {
      rating,
      title,
      comment,
      orderId
    });

    return ApiResponse.success(res, review, 'Review submitted successfully. It will appear publicly upon moderator approval.', 201);
  } catch (err) {
    if (err.statusCode) {
      return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
    }
    next(err);
  }
}

/**
 * Customer: Edit an existing review
 * PATCH /api/v1/reviews/:reviewId
 */
export async function updateReview(req, res, next) {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await updateCustomerReview(req.user.id, reviewId, {
      rating,
      title,
      comment
    });

    return ApiResponse.success(res, review, 'Review updated successfully. It has been queued for moderator re-approval.');
  } catch (err) {
    if (err.statusCode) {
      return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
    }
    next(err);
  }
}

/**
 * Customer / Admin: Delete a review
 * DELETE /api/v1/reviews/:reviewId
 */
export async function deleteReview(req, res, next) {
  try {
    const { reviewId } = req.params;
    const result = await deleteCustomerReview(req.user.id, reviewId, req.user.role);

    return ApiResponse.success(res, result, 'Review deleted successfully');
  } catch (err) {
    if (err.statusCode) {
      return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
    }
    next(err);
  }
}

/**
 * Admin / Support: View submitted reviews for moderation
 * GET /api/v1/admin/reviews
 */
export async function getAdminReviews(req, res, next) {
  try {
    const { status, productId, page, limit, search } = req.query;
    const data = await fetchAdminReviews({ status, productId, page, limit, search });

    return ApiResponse.success(res, data, 'Admin reviews retrieved successfully');
  } catch (err) {
    if (err.statusCode) {
      return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
    }
    next(err);
  }
}

/**
 * Admin: Moderate review (Approve or Reject)
 * PATCH /api/v1/admin/reviews/:reviewId/status
 */
export async function moderateReview(req, res, next) {
  try {
    const { reviewId } = req.params;
    const { status, moderationNote } = req.body;

    const updated = await applyReviewModeration(req.user.id, reviewId, {
      status,
      moderationNote
    });

    return ApiResponse.success(res, updated, `Review status updated to ${status}`);
  } catch (err) {
    if (err.statusCode) {
      return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
    }
    next(err);
  }
}

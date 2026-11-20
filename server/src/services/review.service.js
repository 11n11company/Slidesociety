import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendReviewModerationEmail } from '../utils/email.service.js';

/**
 * Get approved product reviews and rating aggregates for public view
 */
export async function getProductReviews(productId, { page = 1, limit = 10, userId = null } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, rating: true, isAvailable: true }
  });

  if (!product) {
    const err = new Error(`Product '${productId}' not found`);
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  // Aggregate stats across all APPROVED reviews for this product
  const [totalApproved, ratingAgg, starDistribution] = await Promise.all([
    prisma.productReview.count({
      where: { productId, status: 'APPROVED' }
    }),
    prisma.productReview.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true }
    }),
    prisma.productReview.groupBy({
      by: ['rating'],
      where: { productId, status: 'APPROVED' },
      _count: { rating: true }
    })
  ]);

  // Build star distribution map (1-5)
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const group of starDistribution) {
    if (distribution[group.rating] !== undefined) {
      distribution[group.rating] = group._count.rating;
    }
  }

  // Calculate average rating: fallback to baseline rating if no approved reviews
  const rawAvg = ratingAgg._avg.rating;
  const averageRating = rawAvg !== null ? Math.round(rawAvg * 10) / 10 : product.rating || 5.0;

  // Retrieve paginated approved reviews
  const reviews = await prisma.productReview.findMany({
    where: { productId, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    skip: (p - 1) * l,
    take: l,
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true
        }
      }
    }
  });

  // Format reviews for public consumption
  const formattedReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    isVerifiedPurchase: true,
    authorName: r.user?.fullName || 'Verified Driver',
    authorId: r.user?.id
  }));

  // If user is authenticated, query their own review (any status) and review eligibility
  let userReview = null;
  let eligibility = { canReview: false, reason: 'UNAUTHENTICATED' };

  if (userId) {
    const existing = await prisma.productReview.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        status: true,
        moderationNote: true,
        createdAt: true,
        updatedAt: true,
        orderId: true
      }
    });

    if (existing) {
      userReview = existing;
    }

    try {
      eligibility = await checkReviewEligibility(userId, productId);
    } catch {
      // Non-blocking
    }
  }

  return {
    productId,
    productName: product.name,
    averageRating,
    totalCount: totalApproved,
    distribution,
    reviews: formattedReviews,
    pagination: {
      page: p,
      limit: l,
      totalCount: totalApproved,
      totalPages: Math.ceil(totalApproved / l) || 1
    },
    userReview,
    eligibility
  };
}

/**
 * Check if customer is eligible to review a product
 */
export async function checkReviewEligibility(userId, productId) {
  if (!userId) {
    return {
      canReview: false,
      reason: 'UNAUTHENTICATED',
      message: 'Please sign in to write a review.'
    };
  }

  // 1. Check if user already reviewed this product
  const existingReview = await prisma.productReview.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  if (existingReview) {
    return {
      canReview: false,
      reason: 'ALREADY_REVIEWED',
      message: 'You have already submitted a review for this product.',
      existingReview: {
        id: existingReview.id,
        rating: existingReview.rating,
        title: existingReview.title,
        status: existingReview.status,
        createdAt: existingReview.createdAt
      }
    };
  }

  // 2. Find delivered order with captured payment containing the product
  const eligibleOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: 'DELIVERED',
      items: {
        some: { productId }
      },
      payments: {
        some: { status: 'CAPTURED' }
      }
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true
    }
  });

  if (eligibleOrder) {
    return {
      canReview: true,
      orderId: eligibleOrder.id,
      orderNumber: eligibleOrder.orderNumber,
      message: 'Verified delivered purchase.'
    };
  }

  // 3. Fallback: check if customer has any order with this product to give specific feedback
  const anyOrder = await prisma.order.findFirst({
    where: {
      userId,
      items: {
        some: { productId }
      }
    },
    include: {
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  if (anyOrder) {
    if (anyOrder.status !== 'DELIVERED') {
      return {
        canReview: false,
        reason: 'NOT_DELIVERED',
        orderNumber: anyOrder.orderNumber,
        message: `Order ${anyOrder.orderNumber} is currently ${anyOrder.status}. You can review this item once it is DELIVERED.`
      };
    }

    const hasCaptured = anyOrder.payments.some((p) => p.status === 'CAPTURED');
    if (!hasCaptured) {
      return {
        canReview: false,
        reason: 'PAYMENT_NOT_CAPTURED',
        orderNumber: anyOrder.orderNumber,
        message: 'Payment has not been captured for this order.'
      };
    }
  }

  return {
    canReview: false,
    reason: 'NOT_PURCHASED',
    message: 'Reviews are reserved for verified drivers who have purchased and received this product.'
  };
}

/**
 * Submit a customer product review
 */
export async function createReview(userId, productId, { rating, title, comment, orderId }) {
  if (!userId) {
    const err = new Error('Authentication required');
    err.statusCode = 401;
    throw err;
  }

  // Validate rating (1 to 5)
  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    const err = new Error('Rating must be an integer between 1 and 5');
    err.statusCode = 400;
    err.code = 'INVALID_RATING';
    throw err;
  }

  // Validate comment
  const cleanComment = typeof comment === 'string' ? comment.trim() : '';
  if (!cleanComment || cleanComment.length < 5 || cleanComment.length > 1000) {
    const err = new Error('Review comment must be between 5 and 1000 characters');
    err.statusCode = 400;
    err.code = 'INVALID_COMMENT';
    throw err;
  }

  // Validate optional title
  const cleanTitle = title && typeof title === 'string' ? title.trim().slice(0, 100) : null;

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    const err = new Error(`Product '${productId}' not found`);
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  // Enforce one review per customer per product
  const existingReview = await prisma.productReview.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  if (existingReview) {
    const err = new Error('You have already submitted a review for this product');
    err.statusCode = 409;
    err.code = 'DUPLICATE_REVIEW';
    throw err;
  }

  // Verify Purchase Eligibility
  let verifiedOrderId = null;

  if (orderId) {
    // If orderId is provided by frontend, strictly validate it
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true
      }
    });

    if (!order) {
      const err = new Error('Specified order not found');
      err.statusCode = 400;
      err.code = 'ORDER_NOT_FOUND';
      throw err;
    }

    if (order.userId !== userId) {
      const err = new Error('Order does not belong to the authenticated customer');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    const hasProduct = order.items.some((it) => it.productId === productId);
    if (!hasProduct) {
      const err = new Error('The specified order does not contain this product');
      err.statusCode = 400;
      err.code = 'PRODUCT_NOT_IN_ORDER';
      throw err;
    }

    if (order.status !== 'DELIVERED') {
      const err = new Error(`Reviews are only permitted for DELIVERED orders (current: ${order.status})`);
      err.statusCode = 400;
      err.code = 'ORDER_NOT_DELIVERED';
      throw err;
    }

    const hasCaptured = order.payments.some((p) => p.status === 'CAPTURED');
    if (!hasCaptured) {
      const err = new Error('Payment for this order has not been captured');
      err.statusCode = 400;
      err.code = 'PAYMENT_NOT_CAPTURED';
      throw err;
    }

    verifiedOrderId = order.id;
  } else {
    // Deduce eligible delivered order automatically
    const eligibleOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: { productId }
        },
        payments: {
          some: { status: 'CAPTURED' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!eligibleOrder) {
      const err = new Error('Reviews are only permitted for customers with a verified DELIVERED purchase and captured payment');
      err.statusCode = 400;
      err.code = 'NOT_ELIGIBLE';
      throw err;
    }

    verifiedOrderId = eligibleOrder.id;
  }

  // Create review with PENDING status for moderation
  const newReview = await prisma.productReview.create({
    data: {
      userId,
      productId,
      orderId: verifiedOrderId,
      rating: numRating,
      title: cleanTitle,
      comment: cleanComment,
      status: 'PENDING'
    },
    include: {
      user: {
        select: { id: true, fullName: true, email: true }
      },
      product: {
        select: { id: true, name: true, imageUrl: true }
      },
      order: {
        select: { id: true, orderNumber: true }
      }
    }
  });

  logger.info(`Review created for product '${productId}' by user '${userId}', Order '${verifiedOrderId}' (Status: PENDING)`);
  return newReview;
}

/**
 * Edit an existing customer review
 * Policy: Customer edits reset status back to PENDING for admin re-moderation
 */
export async function updateCustomerReview(userId, reviewId, { rating, title, comment }) {
  if (!userId) {
    const err = new Error('Authentication required');
    err.statusCode = 401;
    throw err;
  }

  const review = await prisma.productReview.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (review.userId !== userId) {
    const err = new Error('You can only modify your own reviews');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const data = {};

  if (rating !== undefined) {
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      const err = new Error('Rating must be an integer between 1 and 5');
      err.statusCode = 400;
      err.code = 'INVALID_RATING';
      throw err;
    }
    data.rating = numRating;
  }

  if (comment !== undefined) {
    const cleanComment = typeof comment === 'string' ? comment.trim() : '';
    if (!cleanComment || cleanComment.length < 5 || cleanComment.length > 1000) {
      const err = new Error('Review comment must be between 5 and 1000 characters');
      err.statusCode = 400;
      err.code = 'INVALID_COMMENT';
      throw err;
    }
    data.comment = cleanComment;
  }

  if (title !== undefined) {
    data.title = title && typeof title === 'string' ? title.trim().slice(0, 100) : null;
  }

  // Reset to PENDING for moderation and clear prior moderation note
  data.status = 'PENDING';
  data.moderationNote = null;

  const updated = await prisma.productReview.update({
    where: { id: reviewId },
    data,
    include: {
      user: { select: { id: true, fullName: true } },
      product: { select: { id: true, name: true } }
    }
  });

  logger.info(`Review '${reviewId}' updated by author '${userId}'. Status reset to PENDING.`);
  return updated;
}

/**
 * Delete a customer review
 * Allowed by review author or ADMIN
 */
export async function deleteCustomerReview(userId, reviewId, userRole = 'CUSTOMER') {
  if (!userId) {
    const err = new Error('Authentication required');
    err.statusCode = 401;
    throw err;
  }

  const review = await prisma.productReview.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const isAdmin = userRole === 'ADMIN';
  if (!isAdmin && review.userId !== userId) {
    const err = new Error('You do not have permission to delete this review');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  await prisma.productReview.delete({
    where: { id: reviewId }
  });

  logger.info(`Review '${reviewId}' deleted by user '${userId}' (Role: ${userRole})`);
  return { deleted: true, id: reviewId };
}

/**
 * Admin: Query all reviews across catalog with moderation filters
 */
export async function getAdminReviews({ status, productId, page = 1, limit = 20, search } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

  const where = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (productId) {
    where.productId = productId;
  }

  if (search && typeof search === 'string') {
    const q = search.trim();
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { comment: { contains: q, mode: 'insensitive' } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
        { user: { fullName: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { order: { orderNumber: { contains: q, mode: 'insensitive' } } }
      ];
    }
  }

  const [totalCount, reviews] = await Promise.all([
    prisma.productReview.count({ where }),
    prisma.productReview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (p - 1) * l,
      take: l,
      include: {
        product: {
          select: { id: true, name: true, category: true, imageUrl: true }
        },
        user: {
          select: { id: true, fullName: true, email: true }
        },
        order: {
          select: { id: true, orderNumber: true, createdAt: true }
        }
      }
    })
  ]);

  return {
    reviews,
    pagination: {
      page: p,
      limit: l,
      totalCount,
      totalPages: Math.ceil(totalCount / l) || 1
    }
  };
}

/**
 * Admin: Approve or Reject a submitted product review
 */
export async function moderateReview(adminUserId, reviewId, { status, moderationNote }) {
  if (!reviewId) {
    const err = new Error('Review ID is required');
    err.statusCode = 400;
    throw err;
  }

  if (status !== 'APPROVED' && status !== 'REJECTED') {
    const err = new Error("Status must be either 'APPROVED' or 'REJECTED'");
    err.statusCode = 400;
    err.code = 'INVALID_STATUS';
    throw err;
  }

  const review = await prisma.productReview.findUnique({
    where: { id: reviewId },
    include: {
      user: true,
      product: true
    }
  });

  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const updated = await prisma.productReview.update({
    where: { id: reviewId },
    data: {
      status,
      moderationNote: moderationNote ? String(moderationNote).trim() : null
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      product: { select: { id: true, name: true } },
      order: { select: { id: true, orderNumber: true } }
    }
  });

  logger.info(`Review '${reviewId}' moderated to [${status}] by admin '${adminUserId}'`);

  // Asynchronously attempt to send customer notification email
  try {
    if (review.user?.email) {
      sendReviewModerationEmail({
        to: review.user.email,
        customerName: review.user.fullName,
        productName: review.product?.name || 'Hardware Gear',
        status,
        moderationNote
      }).catch((emailErr) => {
        logger.warn(`Review moderation notification non-fatal error: ${emailErr.message}`);
      });
    }
  } catch (emailErr) {
    logger.warn(`Failed to dispatch review notification: ${emailErr.message}`);
  }

  return updated;
}

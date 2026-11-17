import {
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminInventory,
  updateProductStock
} from '../services/adminProduct.service.js';

/**
 * GET /api/v1/admin/products
 * List all products with inventory counts and filtering.
 */
export async function listProducts(req, res, next) {
  try {
    const { page, limit, search, category, isAvailable, sortBy, sortOrder } = req.query;
    const result = await getAdminProducts({
      page,
      limit,
      search,
      category,
      isAvailable,
      sortBy,
      sortOrder
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/admin/products/:id
 * Retrieve a single product by ID.
 */
export async function getProductDetails(req, res, next) {
  try {
    const product = await getAdminProductById(req.params.id);

    return res.status(200).json({
      success: true,
      data: { product }
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
 * POST /api/v1/admin/products
 * Create a new product.
 */
export async function createProduct(req, res, next) {
  try {
    const product = await createAdminProduct(req.body);

    return res.status(201).json({
      success: true,
      message: `Product '${product.name}' created successfully.`,
      data: { product }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid product payload',
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
 * PATCH /api/v1/admin/products/:id
 * Update product fields.
 */
export async function updateProduct(req, res, next) {
  try {
    const product = await updateAdminProduct(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: `Product '${product.name}' updated successfully.`,
      data: { product }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid product update fields',
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
 * DELETE /api/v1/admin/products/:id
 * Safe delete: Blocks deletion if referenced in orders; deactivates instead.
 */
export async function deleteProduct(req, res, next) {
  try {
    const result = await deleteAdminProduct(req.params.id);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result
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
 * GET /api/v1/admin/inventory
 * Inventory summary and stock levels.
 */
export async function listInventory(req, res, next) {
  try {
    const { page, limit, status, search } = req.query;
    const result = await getAdminInventory({ page, limit, status, search });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/admin/products/:id/stock
 * Adjust or set stock quantity. Prevents negative inventory.
 */
export async function updateStock(req, res, next) {
  try {
    const result = await updateProductStock(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: `Stock for '${result.name}' updated to ${result.currentStock}.`,
      data: result
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid stock update payload',
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

import {
  getAdminCustomersList,
  getAdminCustomerById
} from '../services/admin.service.js';

/**
 * GET /api/v1/admin/customers
 * Paginated list of registered customers with statistics.
 */
export async function listCustomers(req, res, next) {
  try {
    const { page, limit, search, registeredAfter } = req.query;
    const result = await getAdminCustomersList({ page, limit, search, registeredAfter });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/admin/customers/:id
 * Retrieve customer profile, order history and statistics.
 * Strictly excludes passwordHash and sensitive authentication secrets.
 */
export async function getCustomerDetails(req, res, next) {
  try {
    const result = await getAdminCustomerById(req.params.id);

    return res.status(200).json({
      success: true,
      data: result
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

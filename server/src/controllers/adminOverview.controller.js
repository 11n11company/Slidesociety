import { getDashboardOverview } from '../services/admin.service.js';

/**
 * GET /api/v1/admin/overview
 * Real database-driven statistics for Admin dashboard.
 */
export async function getOverview(req, res, next) {
  try {
    const overviewData = await getDashboardOverview();

    return res.status(200).json({
      success: true,
      message: 'Access granted to Slidescoiety Administration Console.',
      data: {
        adminUser: req.user.email,
        role: req.user.role,
        systemStatus: 'ONLINE',
        ...overviewData
      }
    });
  } catch (err) {
    next(err);
  }
}


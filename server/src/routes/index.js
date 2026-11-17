import { Router } from 'express';
import healthRoutes from './health.routes.js';
import productRoutes from './product.routes.js';
import authRoutes from './auth.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import adminOrderRoutes from './adminOrder.routes.js';
import { getCategories } from '../controllers/product.controller.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// /api/health
router.use('/health', healthRoutes);

// /api/v1/auth
router.use('/v1/auth', authRoutes);

// /api/v1/cart
router.use('/v1/cart', cartRoutes);

// /api/v1/orders (Customer Order Management)
router.use('/v1/orders', orderRoutes);

// /api/v1/admin/orders (Admin Order Management)
router.use('/v1/admin/orders', adminOrderRoutes);

// /api/v1/categories (direct alias)
router.get('/v1/categories', getCategories);

// /api/v1/products
router.use('/v1/products', productRoutes);

// /api/v1/admin/overview (Protected by ADMIN role check)
router.get(
  '/v1/admin/overview',
  authenticateCustomer,
  requireRole('ADMIN'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Access granted to Slidescoiety Administration Console.',
      data: {
        adminUser: req.user.email,
        role: req.user.role,
        systemStatus: 'ONLINE'
      }
    });
  }
);

export default router;

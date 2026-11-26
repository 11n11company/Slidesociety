import { Router } from 'express';
import healthRoutes from './health.routes.js';
import productRoutes from './product.routes.js';
import authRoutes from './auth.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import adminOrderRoutes from './adminOrder.routes.js';
import adminProductRoutes from './adminProduct.routes.js';
import adminInventoryRoutes from './adminInventory.routes.js';
import adminCustomerRoutes from './adminCustomer.routes.js';
import adminShippingRoutes from './adminShipping.routes.js';
import paymentRoutes from './payment.routes.js';
import invoiceRoutes from './invoice.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import reviewRoutes from './review.routes.js';
import adminReviewRoutes from './adminReview.routes.js';
import { getOverview } from '../controllers/adminOverview.controller.js';
import { getCategories } from '../controllers/product.controller.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// /api/health
router.use('/health', healthRoutes);

// /api/v1/auth
router.use('/v1/auth', authRoutes);

// /api/v1/cart
router.use('/v1/cart', cartRoutes);

// /api/v1/wishlist (Customer Wishlist Management)
router.use('/v1/wishlist', wishlistRoutes);

// /api/v1/reviews (Customer Reviews)
router.use('/v1/reviews', reviewRoutes);

// /api/v1/orders (Customer Order Management)
router.use('/v1/orders', orderRoutes);

// /api/v1/payments (Razorpay Payment Integration)
router.use('/v1/payments', paymentRoutes);

// /api/v1/invoices (PDF Invoices & Email Resend)
router.use('/v1/invoices', invoiceRoutes);

// /api/v1/admin/overview (Dashboard Analytics - Accessible by ADMIN only)
router.get(
  '/v1/admin/overview',
  authenticateCustomer,
  requireRole('ADMIN'),
  getOverview
);

// /api/v1/admin/orders (Admin Order Management)
router.use('/v1/admin/orders', adminOrderRoutes);

// /api/v1/admin/products (Admin Product Management)
router.use('/v1/admin/products', adminProductRoutes);

// /api/v1/admin/inventory (Admin Inventory Management)
router.use('/v1/admin/inventory', adminInventoryRoutes);

// /api/v1/admin/customers (Admin Customer Management)
router.use('/v1/admin/customers', adminCustomerRoutes);

// /api/v1/admin/shipments (Admin Shipping & Logistics Management)
router.use('/v1/admin/shipments', adminShippingRoutes);

// /api/v1/admin/reviews (Admin Review Moderation)
router.use('/v1/admin/reviews', adminReviewRoutes);

// /api/v1/categories (direct alias)
router.get('/v1/categories', getCategories);

// /api/v1/products
router.use('/v1/products', productRoutes);

export default router;

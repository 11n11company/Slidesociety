import { Router } from 'express';
import healthRoutes from './health.routes.js';
import productRoutes from './product.routes.js';
import { getCategories } from '../controllers/product.controller.js';

const router = Router();

// /api/health
router.use('/health', healthRoutes);

// /api/v1/categories (direct alias)
router.get('/v1/categories', getCategories);

// /api/v1/products
router.use('/v1/products', productRoutes);

export default router;

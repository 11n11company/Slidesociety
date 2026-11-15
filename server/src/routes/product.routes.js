import { Router } from 'express';
import { getProducts, getProduct, getCategories } from '../controllers/product.controller.js';

const router = Router();

// /api/v1/products
router.get('/', getProducts);
router.get('/:id', getProduct);

export default router;

import { Router } from 'express';
import { mergeCart, getCart, updateItem } from '../controllers/cart.controller.js';
import { authenticateCustomer } from '../middleware/auth.middleware.js';

const router = Router();

// Protected Customer Cart Endpoints
router.use(authenticateCustomer);

router.post('/merge', mergeCart);
router.get('/', getCart);
router.put('/items', updateItem);

export default router;


import { Router } from 'express';
import {
  listInventory,
  updateStock
} from '../controllers/adminProduct.controller.js';
import { expireStaleReservations } from '../services/inventoryReservation.service.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Authentication required
router.use(authenticateCustomer);

// Read inventory: strictly ADMIN only
router.get('/', requireRole('ADMIN'), listInventory);

// Adjust inventory stock: strictly ADMIN only
router.patch('/:id/stock', requireRole('ADMIN'), updateStock);

// Maintenance: Expire stale reservations manually (ADMIN only)
router.post('/expire-reservations', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const expiredCount = await expireStaleReservations();
    return res.status(200).json({
      success: true,
      message: `Processed expired reservations. Released: ${expiredCount}.`,
      data: { expiredCount }
    });
  } catch (err) {
    next(err);
  }
});

export default router;


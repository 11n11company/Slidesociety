import { Router } from 'express';
import {
  listShipments,
  getShipment,
  createShipment,
  updateShipment,
  updateStatus
} from '../controllers/adminShipping.controller.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All admin shipment endpoints require authentication and ADMIN role
router.use(authenticateCustomer);
router.use(requireRole('ADMIN'));

// Read endpoints: accessible by ADMIN only
router.get('/', listShipments);
router.get('/:id', getShipment);

// Mutation endpoints: strictly restricted to ADMIN role
router.post('/order/:orderId', requireRole('ADMIN'), createShipment);
router.patch('/:id', requireRole('ADMIN'), updateShipment);
router.patch('/:id/status', requireRole('ADMIN'), updateStatus);

export default router;

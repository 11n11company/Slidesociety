import { Router } from 'express';
import {
  listAllOrders,
  getOrderDetails,
  updateStatus,
  updateFareAndItems,
  recordPayment,
  generateInvoiceForOrder
} from '../controllers/adminOrder.controller.js';
import { createShipment } from '../controllers/adminShipping.controller.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All admin order endpoints require authentication & ADMIN or SUPPORT role
router.use(authenticateCustomer);
router.use(requireRole('ADMIN', 'SUPPORT'));

router.get('/', listAllOrders);
router.get('/:id', getOrderDetails);
router.patch('/:id/status', requireRole('ADMIN'), updateStatus); // Status changes require ADMIN
router.patch('/:id/fare-and-items', requireRole('ADMIN'), updateFareAndItems); // Modify items & shipping fare
router.post('/:id/payment', requireRole('ADMIN'), recordPayment); // Record manual/UPI payment & confirm
router.post('/:id/invoice', requireRole('ADMIN'), generateInvoiceForOrder); // Generate or regenerate tax invoice
router.post('/:orderId/shipment', requireRole('ADMIN'), createShipment); // Create shipment for order requires ADMIN

export default router;

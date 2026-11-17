import { Router } from 'express';
import {
  listCustomers,
  getCustomerDetails
} from '../controllers/adminCustomer.controller.js';
import { authenticateCustomer, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Authentication required
router.use(authenticateCustomer);

// Customers list and details accessible by ADMIN and SUPPORT
router.use(requireRole('ADMIN', 'SUPPORT'));

router.get('/', listCustomers);
router.get('/:id', getCustomerDetails);

export default router;


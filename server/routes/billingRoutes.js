import express from 'express';
import {
  getEncounterBillingEstimate,
  createInvoice,
  settlePayment,
  getInvoices,
} from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/estimate/:encounterId', getEncounterBillingEstimate);
router.post('/invoice', authorize('CASHIER', 'ADMIN'), createInvoice);
router.post('/invoices/:id/pay', authorize('CASHIER', 'ADMIN'), settlePayment);
router.get('/invoices', getInvoices);

export default router;

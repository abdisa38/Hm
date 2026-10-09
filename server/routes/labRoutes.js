import express from 'express';
import { getLabOrders, getLabOrderById, updateLabResults } from '../controllers/labController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getLabOrders);

router.route('/:id')
  .get(getLabOrderById);

router.route('/:id/results')
  .put(authorize('LAB_TECH', 'ADMIN'), updateLabResults);

export default router;

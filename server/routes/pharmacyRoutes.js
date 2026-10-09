import express from 'express';
import {
  getPrescriptions,
  dispensePrescription,
  getInventory,
  addInventoryItem,
  updateInventoryItem,
} from '../controllers/pharmacyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions/:id/dispense', authorize('PHARMACIST', 'ADMIN'), dispensePrescription);

router.route('/inventory')
  .get(getInventory)
  .post(authorize('PHARMACIST', 'ADMIN'), addInventoryItem);

router.put('/inventory/:id', authorize('PHARMACIST', 'ADMIN'), updateInventoryItem);

export default router;

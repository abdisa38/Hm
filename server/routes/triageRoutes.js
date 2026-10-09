import express from 'express';
import { recordTriage, getTriageByEncounter } from '../controllers/triageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('NURSE', 'DOCTOR', 'ADMIN'), recordTriage);
router.get('/encounter/:encounterId', getTriageByEncounter);

export default router;

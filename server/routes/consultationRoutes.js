import express from 'express';
import { saveConsultation, getConsultationByEncounter } from '../controllers/consultationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('DOCTOR', 'ADMIN'), saveConsultation);
router.get('/encounter/:encounterId', getConsultationByEncounter);

export default router;

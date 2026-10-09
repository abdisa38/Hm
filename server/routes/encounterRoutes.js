import express from 'express';
import {
  createEncounter,
  getEncounters,
  getEncounterById,
  updateEncounterStatus,
  getLiveQueue,
} from '../controllers/encounterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/live-queue', getLiveQueue); // Public display screen can poll this!

router.use(protect);
router.route('/')
  .post(createEncounter)
  .get(getEncounters);

router.route('/:id')
  .get(getEncounterById);

router.route('/:id/status')
  .patch(updateEncounterStatus);

export default router;

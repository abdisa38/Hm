import express from 'express';
import { registerPatient, getPatients, getPatientById, updatePatient } from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // all patient routes require logged in staff

router.route('/')
  .post(registerPatient)
  .get(getPatients);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient);

export default router;

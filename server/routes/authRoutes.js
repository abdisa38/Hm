import express from 'express';
import { loginUser, getUserProfile, getStaffList } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/staff', protect, authorize('ADMIN', 'DIRECTOR', 'RECEPTIONIST'), getStaffList);

export default router;

import express from 'express';
import { getDashboardStats, getAuditLogs } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', authorize('DIRECTOR', 'ADMIN'), getDashboardStats);
router.get('/audit-logs', authorize('DIRECTOR', 'ADMIN'), getAuditLogs);

export default router;

import Patient from '../models/Patient.js';
import Encounter from '../models/Encounter.js';
import Billing from '../models/Billing.js';
import LabOrder from '../models/LabOrder.js';
import Inventory from '../models/Inventory.js';
import Consultation from '../models/Consultation.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Executive Dashboard statistics for Hospital Director / Management
// @route   GET /api/analytics/dashboard
// @access  Private (Director, Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Patient & Encounter counts
    const totalPatients = await Patient.countDocuments();
    const todayEncounters = await Encounter.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } });

    const opdVisitsToday = todayEncounters.filter((e) => e.visitType === 'OPD').length;
    const emergencyVisitsToday = todayEncounters.filter((e) => e.visitType === 'EMERGENCY').length;
    const completedVisitsToday = todayEncounters.filter((e) => e.status === 'COMPLETED').length;
    const inQueueToday = todayEncounters.filter((e) => e.status !== 'COMPLETED').length;

    // Financial revenue today
    const paidInvoicesToday = await Billing.find({
      paidAt: { $gte: startOfDay, $lte: endOfDay },
      paymentStatus: 'PAID',
    });
    const totalRevenueToday = paidInvoicesToday.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);

    // Lab & Inventory alerts
    const pendingLabOrders = await LabOrder.countDocuments({ status: { $ne: 'COMPLETED' } });
    const lowStockItems = await Inventory.find({ status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] } }).limit(5);

    // Departmental distribution
    const departmentDistribution = await Encounter.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    // Top diagnoses recently
    const topDiagnoses = await Consultation.aggregate([
      { $group: { _id: '$assessment.primaryDiagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      summary: {
        totalPatients,
        todayTotalVisits: todayEncounters.length,
        opdVisitsToday,
        emergencyVisitsToday,
        completedVisitsToday,
        inQueueToday,
        totalRevenueToday,
        pendingLabOrders,
        lowStockAlertsCount: lowStockItems.length,
      },
      lowStockItems,
      departmentDistribution,
      topDiagnoses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit trail logs
// @route   GET /api/analytics/audit-logs
// @access  Private (Director, Admin)
export const getAuditLogs = async (req, res) => {
  try {
    const { action, limit = 50 } = req.query;
    let query = {};
    if (action) query.action = action;

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import LabOrder from '../models/LabOrder.js';
import Encounter from '../models/Encounter.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// @desc    Get lab orders list
// @route   GET /api/lab
// @access  Private (Lab Tech, Doctor, Admin)
export const getLabOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const orders = await LabOrder.find(query)
      .populate('patient')
      .populate('orderedByDoctor', 'name department')
      .populate('technician', 'name')
      .populate('encounter', 'queueNumber department')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lab order
// @route   GET /api/lab/:id
// @access  Private
export const getLabOrderById = async (req, res) => {
  try {
    const order = await LabOrder.findById(req.params.id)
      .populate('patient')
      .populate('orderedByDoctor', 'name department')
      .populate('technician', 'name')
      .populate('encounter');

    if (!order) {
      return res.status(404).json({ message: 'Lab order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update and publish laboratory results
// @route   PUT /api/lab/:id/results
// @access  Private (Lab Tech, Admin)
export const updateLabResults = async (req, res) => {
  try {
    const { tests, clinicalNotes, overallStatus = 'COMPLETED' } = req.body;

    const order = await LabOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Lab order not found' });
    }

    if (tests) {
      order.tests = tests;
    }
    if (clinicalNotes) order.clinicalNotes = clinicalNotes;
    order.status = overallStatus;
    order.technician = req.user._id;
    if (overallStatus === 'COMPLETED') {
      order.reportedAt = new Date();
    }

    await order.save();

    // Check encounter status and update
    const encounter = await Encounter.findById(order.encounter);
    if (encounter) {
      if (encounter.prescriptions && encounter.prescriptions.length > 0) {
        encounter.status = 'PHARMACY_PENDING';
      } else {
        // Return to doctor for review, or billing
        encounter.status = 'WAITING_DOCTOR';
      }
      await encounter.save();
    }

    await logAuditEvent({
      req,
      action: 'LAB_RESULTS_PUBLISHED',
      entityType: 'LabOrder',
      entityId: order._id.toString(),
      description: `Lab technician ${req.user.name} published results for order ${order.orderNumber}`,
      details: { testsSummary: order.tests.map((t) => `${t.testName}: ${t.resultValue}`) },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

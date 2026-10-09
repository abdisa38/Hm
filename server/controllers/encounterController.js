import Encounter from '../models/Encounter.js';
import Patient from '../models/Patient.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// Helper for generating Encounter and Queue numbers
const generateEncounterNumbers = async (department = 'OPD') => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Count encounters created today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  const todayCount = await Encounter.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const seq = String(todayCount + 1).padStart(3, '0');
  const encounterNumber = `ENC-${dateStr}-${seq}`;
  const prefix = department.includes('Emergency') ? 'EMG' : 'OPD';
  const queueNumber = `${prefix}-${seq}`;

  return { encounterNumber, queueNumber };
};

// @desc    Check-in patient / Start hospital encounter
// @route   POST /api/encounters
// @access  Private (Receptionist, Nurse, Admin)
export const createEncounter = async (req, res) => {
  try {
    const { patientId, visitType, department, assignedDoctor, priority } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient record not found' });
    }

    const { encounterNumber, queueNumber } = await generateEncounterNumbers(department);

    const encounter = await Encounter.create({
      encounterNumber,
      queueNumber,
      patient: patient._id,
      visitType: visitType || 'OPD',
      department: department || 'General OPD',
      assignedDoctor,
      priority: priority || 'ROUTINE',
      status: 'WAITING_TRIAGE',
      createdBy: req.user?._id,
    });

    await logAuditEvent({
      req,
      action: 'ENCOUNTER_CREATED',
      entityType: 'Encounter',
      entityId: encounter._id.toString(),
      description: `New visit check-in for ${patient.firstName} ${patient.fatherName} (${queueNumber})`,
    });

    res.status(201).json(encounter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get encounters list with filters
// @route   GET /api/encounters
// @access  Private
export const getEncounters = async (req, res) => {
  try {
    const { status, department, doctorId, date } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (department) {
      query.department = department;
    }
    if (doctorId) {
      query.assignedDoctor = doctorId;
    }
    if (date) {
      const selectedDate = new Date(date);
      const start = new Date(selectedDate.setHours(0, 0, 0, 0));
      const end = new Date(selectedDate.setHours(23, 59, 59, 999));
      query.createdAt = { $gte: start, $lte: end };
    }

    const encounters = await Encounter.find(query)
      .populate('patient')
      .populate('triageId')
      .populate('assignedDoctor', 'name department')
      .sort({ createdAt: -1 });

    res.json(encounters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get encounter by ID with full patient journey data
// @route   GET /api/encounters/:id
// @access  Private
export const getEncounterById = async (req, res) => {
  try {
    const encounter = await Encounter.findById(req.params.id)
      .populate('patient')
      .populate('triageId')
      .populate('consultationId')
      .populate({
        path: 'labOrders',
        populate: { path: 'technician', select: 'name' },
      })
      .populate({
        path: 'prescriptions',
        populate: { path: 'dispensedByPharmacist', select: 'name' },
      })
      .populate('invoices')
      .populate('assignedDoctor', 'name department');

    if (!encounter) {
      return res.status(404).json({ message: 'Encounter not found' });
    }

    res.json(encounter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update encounter status
// @route   PATCH /api/encounters/:id/status
// @access  Private
export const updateEncounterStatus = async (req, res) => {
  try {
    const { status, assignedDoctor } = req.body;
    const encounter = await Encounter.findById(req.params.id);

    if (!encounter) {
      return res.status(404).json({ message: 'Encounter not found' });
    }

    if (status) encounter.status = status;
    if (assignedDoctor) encounter.assignedDoctor = assignedDoctor;
    if (status === 'COMPLETED') encounter.completedTime = new Date();

    const updated = await encounter.save();

    await logAuditEvent({
      req,
      action: 'ENCOUNTER_STATUS_CHANGED',
      entityType: 'Encounter',
      entityId: encounter._id.toString(),
      description: `Encounter ${encounter.queueNumber} status updated to ${status}`,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get live waiting room TV queue display
// @route   GET /api/encounters/live-queue
// @access  Public
export const getLiveQueue = async (req, res) => {
  try {
    // Encounters from today that are active
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const activeEncounters = await Encounter.find({
      createdAt: { $gte: startOfDay },
      status: { $in: ['WAITING_TRIAGE', 'WAITING_DOCTOR', 'IN_CONSULTATION', 'LAB_PENDING', 'PHARMACY_PENDING', 'BILLING_PENDING'] },
    })
      .populate('assignedDoctor', 'name department')
      .select('queueNumber department status priority assignedDoctor updatedAt')
      .sort({ priority: -1, updatedAt: -1 })
      .limit(20);

    res.json(activeEncounters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

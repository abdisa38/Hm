import Triage from '../models/Triage.js';
import Encounter from '../models/Encounter.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// @desc    Record patient triage and vital signs
// @route   POST /api/triage
// @access  Private (Nurse, Doctor, Admin)
export const recordTriage = async (req, res) => {
  try {
    const {
      encounterId,
      patientId,
      vitalSigns,
      chiefComplaint,
      painScale,
      priority,
      nurseNotes,
    } = req.body;

    const encounter = await Encounter.findById(encounterId).populate('patient');
    if (!encounter) {
      return res.status(404).json({ message: 'Encounter not found' });
    }

    const triage = await Triage.create({
      encounter: encounter._id,
      patient: patientId || encounter.patient._id,
      nurse: req.user._id,
      vitalSigns,
      chiefComplaint,
      painScale: painScale || 0,
      priority: priority || encounter.priority || 'ROUTINE',
      nurseNotes,
    });

    // Advance encounter status to WAITING_DOCTOR and link triage
    encounter.triageId = triage._id;
    encounter.priority = triage.priority;
    encounter.status = 'WAITING_DOCTOR';
    await encounter.save();

    await logAuditEvent({
      req,
      action: 'TRIAGE_RECORDED',
      entityType: 'Triage',
      entityId: triage._id.toString(),
      description: `Nurse ${req.user.name} recorded triage for ${encounter.queueNumber} (Priority: ${triage.priority})`,
      details: { vitalSigns: triage.vitalSigns, chiefComplaint },
    });

    res.status(201).json(triage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get triage by encounter ID
// @route   GET /api/triage/encounter/:encounterId
// @access  Private
export const getTriageByEncounter = async (req, res) => {
  try {
    const triage = await Triage.findOne({ encounter: req.params.encounterId })
      .populate('nurse', 'name')
      .populate('patient');

    if (!triage) {
      return res.status(404).json({ message: 'Triage record not found for this encounter' });
    }

    res.json(triage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

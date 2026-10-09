import Consultation from '../models/Consultation.js';
import Encounter from '../models/Encounter.js';
import LabOrder from '../models/LabOrder.js';
import Prescription from '../models/Prescription.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// @desc    Record Doctor Consultation (SOAP, Diagnoses, Orders)
// @route   POST /api/consultations
// @access  Private (Doctor, Admin)
export const saveConsultation = async (req, res) => {
  try {
    const {
      encounterId,
      patientId,
      subjective,
      objective,
      assessment,
      plan,
      labOrders, // optional inline array of tests: [{ testName, category, specimen }]
      medications, // optional inline array: [{ medicineName, dosage, frequency, duration, quantity }]
    } = req.body;

    const encounter = await Encounter.findById(encounterId).populate('patient');
    if (!encounter) {
      return res.status(404).json({ message: 'Encounter not found' });
    }

    // 1. Create Consultation
    const consultation = await Consultation.create({
      encounter: encounter._id,
      patient: patientId || encounter.patient._id,
      doctor: req.user._id,
      subjective,
      objective,
      assessment,
      plan,
    });

    encounter.consultationId = consultation._id;
    encounter.assignedDoctor = req.user._id;

    // 2. If Doctor ordered Lab Tests, create LabOrder
    if (labOrders && labOrders.length > 0) {
      const orderCount = await LabOrder.countDocuments();
      const orderNumber = `LAB-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, '0')}`;

      const createdLabOrder = await LabOrder.create({
        orderNumber,
        encounter: encounter._id,
        patient: encounter.patient._id,
        orderedByDoctor: req.user._id,
        tests: labOrders.map((t) => ({
          testName: t.testName,
          category: t.category || 'General',
          specimen: t.specimen || 'Whole Blood',
          status: 'PENDING',
        })),
        status: 'ORDERED',
      });

      encounter.labOrders.push(createdLabOrder._id);
      encounter.status = 'LAB_PENDING';
    }

    // 3. If Doctor prescribed medications, create Prescription
    if (medications && medications.length > 0) {
      const rxCount = await Prescription.countDocuments();
      const prescriptionNumber = `RX-${new Date().getFullYear()}-${String(rxCount + 1).padStart(5, '0')}`;

      const createdRx = await Prescription.create({
        prescriptionNumber,
        encounter: encounter._id,
        patient: encounter.patient._id,
        prescribedByDoctor: req.user._id,
        medications: medications.map((m) => ({
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          route: m.route || 'Oral',
          instructions: m.instructions || '',
          quantity: m.quantity || 1,
          dispensed: false,
        })),
        status: 'PENDING',
      });

      encounter.prescriptions.push(createdRx._id);
      // If lab wasn't ordered, set to PHARMACY_PENDING
      if (!labOrders || labOrders.length === 0) {
        encounter.status = 'PHARMACY_PENDING';
      }
    }

    // If neither lab nor medications ordered, ready for billing / completion
    if ((!labOrders || labOrders.length === 0) && (!medications || medications.length === 0)) {
      encounter.status = 'BILLING_PENDING';
    }

    await encounter.save();

    await logAuditEvent({
      req,
      action: 'CONSULTATION_SAVED',
      entityType: 'Consultation',
      entityId: consultation._id.toString(),
      description: `Dr. ${req.user.name} completed consultation for ${encounter.queueNumber} - Primary Diagnosis: ${assessment.primaryDiagnosis}`,
      details: { assessment, hasLab: !!labOrders?.length, hasRx: !!medications?.length },
    });

    res.status(201).json({
      consultation,
      encounterStatus: encounter.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get consultation by encounter
// @route   GET /api/consultations/encounter/:encounterId
// @access  Private
export const getConsultationByEncounter = async (req, res) => {
  try {
    const consultation = await Consultation.findOne({ encounter: req.params.encounterId })
      .populate('doctor', 'name department')
      .populate('patient');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation record not found' });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Patient from '../models/Patient.js';
import Encounter from '../models/Encounter.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// Helper to generate unique Patient ID: ORH-2026-00001
const generatePatientId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Patient.countDocuments();
  const sequence = String(count + 1).padStart(5, '0');
  return `ORH-${currentYear}-${sequence}`;
};

// @desc    Register new patient
// @route   POST /api/patients
// @access  Private (Receptionist, Nurse, Admin)
export const registerPatient = async (req, res) => {
  try {
    const {
      firstName,
      fatherName,
      grandFatherName,
      gender,
      age,
      dateOfBirth,
      phone,
      address,
      emergencyContact,
      bloodGroup,
      allergies,
      chronicConditions,
    } = req.body;

    if (!firstName || !fatherName || !gender || !age || !phone) {
      return res.status(400).json({ message: 'First name, father name, gender, age, and phone are required.' });
    }

    const patientId = await generatePatientId();

    const patient = await Patient.create({
      patientId,
      firstName,
      fatherName,
      grandFatherName,
      gender,
      age,
      dateOfBirth,
      phone,
      address,
      emergencyContact,
      bloodGroup: bloodGroup || 'Unknown',
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      registeredBy: req.user?._id,
    });

    await logAuditEvent({
      req,
      action: 'PATIENT_REGISTERED',
      entityType: 'Patient',
      entityId: patient._id.toString(),
      description: `New patient registered: ${patient.firstName} ${patient.fatherName} (${patient.patientId})`,
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search patients by ID, Name, or Phone
// @route   GET /api/patients
// @access  Private
export const getPatients = async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { patientId: searchRegex },
          { firstName: searchRegex },
          { fatherName: searchRegex },
          { phone: searchRegex },
        ],
      };
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient details with comprehensive medical history
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const encounters = await Encounter.find({ patient: patient._id })
      .populate('triageId')
      .populate('consultationId')
      .populate('labOrders')
      .populate('prescriptions')
      .populate('invoices')
      .populate('assignedDoctor', 'name department')
      .sort({ createdAt: -1 });

    res.json({
      patient,
      encounters,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update patient record
// @route   PUT /api/patients/:id
// @access  Private
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    Object.assign(patient, req.body);
    const updatedPatient = await patient.save();

    await logAuditEvent({
      req,
      action: 'PATIENT_UPDATED',
      entityType: 'Patient',
      entityId: patient._id.toString(),
      description: `Updated demographic/clinical details for patient ${patient.patientId}`,
    });

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

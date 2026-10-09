import mongoose from 'mongoose';

const encounterSchema = new mongoose.Schema(
  {
    encounterNumber: {
      type: String,
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    visitType: {
      type: String,
      enum: ['OPD', 'EMERGENCY', 'FOLLOW_UP', 'REFERRAL', 'INPATIENT'],
      default: 'OPD',
    },
    department: {
      type: String,
      default: 'General OPD',
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    queueNumber: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'EMERGENCY'],
      default: 'ROUTINE',
    },
    status: {
      type: String,
      enum: [
        'WAITING_TRIAGE',
        'TRIAGE_DONE',
        'WAITING_DOCTOR',
        'IN_CONSULTATION',
        'LAB_PENDING',
        'PHARMACY_PENDING',
        'BILLING_PENDING',
        'COMPLETED',
        'ADMITTED',
      ],
      default: 'WAITING_TRIAGE',
    },
    triageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Triage',
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
    },
    labOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabOrder',
      },
    ],
    prescriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
      },
    ],
    invoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Billing',
      },
    ],
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    completedTime: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Encounter = mongoose.model('Encounter', encounterSchema);
export default Encounter;

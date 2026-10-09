import mongoose from 'mongoose';

const labTestItemSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  category: {
    type: String,
    enum: ['Hematology', 'Parasitology', 'Biochemistry', 'Microbiology', 'Serology', 'General'],
    default: 'General',
  },
  specimen: { type: String, default: 'Whole Blood' },
  resultValue: { type: String },
  referenceRange: { type: String },
  unit: { type: String },
  isAbnormal: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING',
  },
  notes: { type: String },
});

const labOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    encounter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Encounter',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    orderedByDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tests: [labTestItemSchema],
    status: {
      type: String,
      enum: ['ORDERED', 'SAMPLE_COLLECTED', 'IN_ANALYSIS', 'COMPLETED'],
      default: 'ORDERED',
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedAt: {
      type: Date,
    },
    clinicalNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const LabOrder = mongoose.model('LabOrder', labOrderSchema);
export default LabOrder;

import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
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
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjective: {
      chiefComplaint: { type: String, required: true },
      historyOfPresentIllness: { type: String },
      pastMedicalHistory: { type: String },
    },
    objective: {
      physicalExamination: { type: String },
      systemicFindings: { type: String },
    },
    assessment: {
      primaryDiagnosis: { type: String, required: true },
      icdCode: { type: String },
      secondaryDiagnoses: [{ type: String }],
      differentialDiagnoses: [{ type: String }],
    },
    plan: {
      clinicalNotes: { type: String },
      treatmentPlan: { type: String },
      followUpDate: { type: Date },
      disposition: {
        type: String,
        enum: ['DISCHARGE_HOME', 'ADMIT_WARD', 'REFER_HIGHER_FACILITY'],
        default: 'DISCHARGE_HOME',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;

import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. 500mg
  frequency: { type: String, required: true }, // e.g. TID / 3 times daily
  duration: { type: String, required: true }, // e.g. 5 days
  route: {
    type: String,
    enum: ['Oral', 'IV', 'IM', 'Topical', 'Sublingual', 'Inhalation'],
    default: 'Oral',
  },
  instructions: { type: String },
  quantity: { type: Number, required: true },
  dispensed: { type: Boolean, default: false },
});

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
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
    prescribedByDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medications: [prescriptionItemSchema],
    status: {
      type: String,
      enum: ['PENDING', 'PARTIALLY_DISPENSED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    dispensedByPharmacist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dispensedAt: {
      type: Date,
    },
    pharmacistNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;

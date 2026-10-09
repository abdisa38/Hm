import mongoose from 'mongoose';

const triageSchema = new mongoose.Schema(
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
    nurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vitalSigns: {
      bloodPressureSystolic: { type: Number },
      bloodPressureDiastolic: { type: Number },
      pulseRate: { type: Number }, // bpm
      respiratoryRate: { type: Number }, // per min
      temperature: { type: Number }, // °C
      oxygenSaturation: { type: Number }, // %
      weight: { type: Number }, // kg
      height: { type: Number }, // cm
      bmi: { type: Number },
      randomBloodSugar: { type: Number }, // mg/dL
    },
    chiefComplaint: {
      type: String,
      required: true,
      trim: true,
    },
    painScale: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'EMERGENCY'],
      default: 'ROUTINE',
    },
    nurseNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate BMI hook
triageSchema.pre('save', function (next) {
  if (this.vitalSigns?.weight && this.vitalSigns?.height && this.vitalSigns.height > 0) {
    const heightInMeters = this.vitalSigns.height / 100;
    this.vitalSigns.bmi = parseFloat((this.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  next();
});

const Triage = mongoose.model('Triage', triageSchema);
export default Triage;

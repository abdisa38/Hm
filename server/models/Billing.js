import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['CONSULTATION', 'LABORATORY', 'PHARMACY', 'PROCEDURE', 'EMERGENCY', 'OTHER'],
    default: 'CONSULTATION',
  },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const billingSchema = new mongoose.Schema(
  {
    invoiceNumber: {
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
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID'],
      default: 'UNPAID',
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'TELEBIRR', 'CBE_BIRR', 'BANK_TRANSFER', 'INSURANCE_CBHI'],
      default: 'CASH',
    },
    paymentReference: {
      type: String, // e.g. Telebirr Txn ID or CBE Slip #
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Billing = mongoose.model('Billing', billingSchema);
export default Billing;

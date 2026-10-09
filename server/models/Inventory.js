import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Antibiotics',
        'Analgesics',
        'Antimalarials',
        'Antihypertensives',
        'Antidiabetics',
        'IV Fluids',
        'Vitamins & Supplements',
        'Medical Consumables',
      ],
      default: 'Analgesics',
    },
    batchNumber: {
      type: String,
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      default: 50,
    },
    unit: {
      type: String,
      default: 'tablets',
    },
    unitPrice: {
      type: Number,
      required: true, // ETB
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    supplier: {
      type: String,
      default: 'Ethiopian Pharmaceuticals Supply Service (EPSS)',
    },
    status: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED'],
      default: 'IN_STOCK',
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.pre('save', function (next) {
  const isExpired = new Date(this.expiryDate) < new Date();
  if (isExpired) {
    this.status = 'EXPIRED';
  } else if (this.currentStock === 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.currentStock <= this.reorderLevel) {
    this.status = 'LOW_STOCK';
  } else {
    this.status = 'IN_STOCK';
  }
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;

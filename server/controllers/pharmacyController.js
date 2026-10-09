import Prescription from '../models/Prescription.js';
import Inventory from '../models/Inventory.js';
import Encounter from '../models/Encounter.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// @desc    Get prescriptions list
// @route   GET /api/pharmacy/prescriptions
// @access  Private (Pharmacist, Doctor, Admin)
export const getPrescriptions = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('patient')
      .populate('prescribedByDoctor', 'name department')
      .populate('dispensedByPharmacist', 'name')
      .populate('encounter', 'queueNumber department')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dispense prescription & auto-deduct inventory
// @route   POST /api/pharmacy/prescriptions/:id/dispense
// @access  Private (Pharmacist, Admin)
export const dispensePrescription = async (req, res) => {
  try {
    const { pharmacistNotes } = req.body;
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Prescription is already fully dispensed' });
    }

    // Process stock deduction for each prescribed medicine
    const inventoryUpdates = [];
    for (const med of prescription.medications) {
      if (!med.dispensed) {
        // Find matching inventory by name or generic name (case-insensitive)
        const item = await Inventory.findOne({
          name: new RegExp(med.medicineName.trim().split(' ')[0], 'i'),
        });

        if (item) {
          const qty = med.quantity || 1;
          item.currentStock = Math.max(0, item.currentStock - qty);
          await item.save();
          inventoryUpdates.push({
            name: item.name,
            deducted: qty,
            remainingStock: item.currentStock,
          });
        }
        med.dispensed = true;
      }
    }

    prescription.status = 'COMPLETED';
    prescription.dispensedByPharmacist = req.user._id;
    prescription.dispensedAt = new Date();
    if (pharmacistNotes) prescription.pharmacistNotes = pharmacistNotes;

    await prescription.save();

    // Advance encounter status to BILLING_PENDING
    const encounter = await Encounter.findById(prescription.encounter);
    if (encounter) {
      encounter.status = 'BILLING_PENDING';
      await encounter.save();
    }

    await logAuditEvent({
      req,
      action: 'MEDICATION_DISPENSED',
      entityType: 'Prescription',
      entityId: prescription._id.toString(),
      description: `Pharmacist ${req.user.name} dispensed Rx ${prescription.prescriptionNumber} (${prescription.medications.length} items)`,
      details: { inventoryUpdates },
    });

    res.json({
      prescription,
      inventoryUpdates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pharmacy inventory with stock status
// @route   GET /api/pharmacy/inventory
// @access  Private
export const getInventory = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { genericName: regex }, { batchNumber: regex }];
    }

    const items = await Inventory.find(query).sort({ status: -1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new medicine to inventory
// @route   POST /api/pharmacy/inventory
// @access  Private (Pharmacist, Admin)
export const addInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);

    await logAuditEvent({
      req,
      action: 'INVENTORY_ADDED',
      entityType: 'Inventory',
      entityId: item._id.toString(),
      description: `New medicine stock added: ${item.name} (${item.currentStock} ${item.unit})`,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory item / restock
// @route   PUT /api/pharmacy/inventory/:id
// @access  Private (Pharmacist, Admin)
export const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    Object.assign(item, req.body);
    const updated = await item.save();

    await logAuditEvent({
      req,
      action: 'INVENTORY_UPDATED',
      entityType: 'Inventory',
      entityId: item._id.toString(),
      description: `Inventory item updated: ${item.name} (Stock: ${item.currentStock})`,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Billing from '../models/Billing.js';
import Encounter from '../models/Encounter.js';
import LabOrder from '../models/LabOrder.js';
import Prescription from '../models/Prescription.js';
import Inventory from '../models/Inventory.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// Price schedule constants (ETB) - representative of Ethiopian General Hospitals
const STANDARD_FEES = {
  CONSULTATION_OPD: 150,
  CONSULTATION_EMERGENCY: 250,
  LAB_CBC: 180,
  LAB_MALARIA_RDT: 90,
  LAB_URINALYSIS: 120,
  LAB_BLOOD_SUGAR: 80,
  LAB_DEFAULT: 140,
};

// @desc    Auto-calculate billable items for an encounter
// @route   GET /api/billing/estimate/:encounterId
// @access  Private
export const getEncounterBillingEstimate = async (req, res) => {
  try {
    const encounter = await Encounter.findById(req.params.encounterId)
      .populate('patient')
      .populate('consultationId');

    if (!encounter) {
      return res.status(404).json({ message: 'Encounter not found' });
    }

    const items = [];

    // 1. Consultation fee
    const consultationFee =
      encounter.visitType === 'EMERGENCY'
        ? STANDARD_FEES.CONSULTATION_EMERGENCY
        : STANDARD_FEES.CONSULTATION_OPD;

    items.push({
      description: `${encounter.department} Consultation Fee`,
      category: 'CONSULTATION',
      quantity: 1,
      unitPrice: consultationFee,
      totalPrice: consultationFee,
    });

    // 2. Lab tests fees
    const labOrders = await LabOrder.find({ encounter: encounter._id });
    for (const order of labOrders) {
      for (const test of order.tests) {
        let fee = STANDARD_FEES.LAB_DEFAULT;
        if (test.testName.toLowerCase().includes('cbc')) fee = STANDARD_FEES.LAB_CBC;
        else if (test.testName.toLowerCase().includes('malaria')) fee = STANDARD_FEES.LAB_MALARIA_RDT;
        else if (test.testName.toLowerCase().includes('urinalysis')) fee = STANDARD_FEES.LAB_URINALYSIS;
        else if (test.testName.toLowerCase().includes('sugar') || test.testName.toLowerCase().includes('glucose'))
          fee = STANDARD_FEES.LAB_BLOOD_SUGAR;

        items.push({
          description: `Laboratory: ${test.testName}`,
          category: 'LABORATORY',
          quantity: 1,
          unitPrice: fee,
          totalPrice: fee,
        });
      }
    }

    // 3. Prescribed medications
    const prescriptions = await Prescription.find({ encounter: encounter._id });
    for (const rx of prescriptions) {
      for (const med of rx.medications) {
        const item = await Inventory.findOne({
          name: new RegExp(med.medicineName.trim().split(' ')[0], 'i'),
        });
        const unitPrice = item ? item.unitPrice : 35; // fallback price in ETB
        const qty = med.quantity || 1;
        items.push({
          description: `Pharmacy: ${med.medicineName} (${qty} ${item ? item.unit : 'units'})`,
          category: 'PHARMACY',
          quantity: qty,
          unitPrice: unitPrice,
          totalPrice: unitPrice * qty,
        });
      }
    }

    const subtotal = items.reduce((acc, curr) => acc + curr.totalPrice, 0);

    res.json({
      encounterId: encounter._id,
      patient: encounter.patient,
      items,
      subtotal,
      totalAmount: subtotal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate official invoice
// @route   POST /api/billing/invoice
// @access  Private (Cashier, Admin)
export const createInvoice = async (req, res) => {
  try {
    const { encounterId, patientId, items, discount = 0 } = req.body;

    const encounter = await Encounter.findById(encounterId).populate('patient');
    if (!encounter) {
      return res.status(404).json({ message: 'Encounter not found' });
    }

    const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
    const totalAmount = Math.max(0, subtotal - discount);

    const invoiceCount = await Billing.countDocuments();
    const invoiceNumber = `ORH-INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;

    const invoice = await Billing.create({
      invoiceNumber,
      encounter: encounter._id,
      patient: patientId || encounter.patient._id,
      items,
      subtotal,
      discount,
      totalAmount,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
    });

    encounter.invoices.push(invoice._id);
    await encounter.save();

    await logAuditEvent({
      req,
      action: 'INVOICE_GENERATED',
      entityType: 'Billing',
      entityId: invoice._id.toString(),
      description: `Invoice ${invoiceNumber} created for ${encounter.queueNumber} - Total: ${totalAmount} ETB`,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Settle invoice payment (Cash / Telebirr / CBE Birr) & Complete visit
// @route   POST /api/billing/invoices/:id/pay
// @access  Private (Cashier, Admin)
export const settlePayment = async (req, res) => {
  try {
    const { paymentMethod, paymentReference, paidAmount } = req.body;

    const invoice = await Billing.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.paidAmount = paidAmount !== undefined ? paidAmount : invoice.totalAmount;
    invoice.paymentStatus = invoice.paidAmount >= invoice.totalAmount ? 'PAID' : 'PARTIAL';
    invoice.paymentMethod = paymentMethod || 'CASH';
    invoice.paymentReference = paymentReference || '';
    invoice.cashier = req.user._id;
    invoice.paidAt = new Date();

    await invoice.save();

    // If fully paid, mark encounter COMPLETED!
    const encounter = await Encounter.findById(invoice.encounter);
    if (encounter && invoice.paymentStatus === 'PAID') {
      encounter.status = 'COMPLETED';
      encounter.completedTime = new Date();
      await encounter.save();
    }

    await logAuditEvent({
      req,
      action: 'PAYMENT_SETTLED',
      entityType: 'Billing',
      entityId: invoice._id.toString(),
      description: `Payment of ${invoice.paidAmount} ETB received via ${invoice.paymentMethod} for ${invoice.invoiceNumber}`,
      details: { paymentMethod, paymentReference },
    });

    res.json({
      invoice,
      encounterStatus: encounter?.status || 'COMPLETED',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List hospital invoices
// @route   GET /api/billing/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.paymentStatus = status;

    const invoices = await Billing.find(query)
      .populate('patient')
      .populate('cashier', 'name')
      .populate('encounter', 'queueNumber department')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

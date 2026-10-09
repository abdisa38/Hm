import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Encounter from '../models/Encounter.js';
import Triage from '../models/Triage.js';
import Consultation from '../models/Consultation.js';
import LabOrder from '../models/LabOrder.js';
import Prescription from '../models/Prescription.js';
import Inventory from '../models/Inventory.js';
import Billing from '../models/Billing.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oda_roba_hospital_ms');
    console.log('[ORHIMS Seeder] Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Patient.deleteMany();
    await Encounter.deleteMany();
    await Triage.deleteMany();
    await Consultation.deleteMany();
    await LabOrder.deleteMany();
    await Prescription.deleteMany();
    await Inventory.deleteMany();
    await Billing.deleteMany();
    await AuditLog.deleteMany();

    console.log('[ORHIMS Seeder] Purged old collections.');

    // 1. Seed Hospital Staff Accounts
    const users = await User.create([
      {
        name: 'Dr. Sisay Kebede',
        username: 'director',
        email: 'director@odarobahospital.gov.et',
        password: 'password123',
        role: 'DIRECTOR',
        department: 'Hospital Administration',
        phone: '+251911223344',
      },
      {
        name: 'System Administrator',
        username: 'admin',
        email: 'admin@odarobahospital.gov.et',
        password: 'password123',
        role: 'ADMIN',
        department: 'ICT & Health Informatics',
        phone: '+251911000000',
      },
      {
        name: 'Dr. Ahmed Mohammed',
        username: 'doctor',
        email: 'ahmed.m@odarobahospital.gov.et',
        password: 'password123',
        role: 'DOCTOR',
        department: 'General OPD',
        phone: '+251912345678',
      },
      {
        name: 'Nurse Fatuma Ali',
        username: 'nurse',
        email: 'fatuma.a@odarobahospital.gov.et',
        password: 'password123',
        role: 'NURSE',
        department: 'Triage & OPD Nursing',
        phone: '+251922334455',
      },
      {
        name: 'Chala Bekele',
        username: 'lab',
        email: 'chala.b@odarobahospital.gov.et',
        password: 'password123',
        role: 'LAB_TECH',
        department: 'Clinical Laboratory',
        phone: '+251933445566',
      },
      {
        name: 'Tigist Haile',
        username: 'pharmacy',
        email: 'tigist.h@odarobahospital.gov.et',
        password: 'password123',
        role: 'PHARMACIST',
        department: 'Main Hospital Pharmacy',
        phone: '+251944556677',
      },
      {
        name: 'Dawit Tadesse',
        username: 'cashier',
        email: 'dawit.t@odarobahospital.gov.et',
        password: 'password123',
        role: 'CASHIER',
        department: 'Revenue & Finance',
        phone: '+251955667788',
      },
      {
        name: 'Meron Abebe',
        username: 'reception',
        email: 'meron.a@odarobahospital.gov.et',
        password: 'password123',
        role: 'RECEPTIONIST',
        department: 'Patient Admissions & Reception',
        phone: '+251966778899',
      },
    ]);

    const doctorUser = users.find((u) => u.role === 'DOCTOR');
    const nurseUser = users.find((u) => u.role === 'NURSE');
    const labUser = users.find((u) => u.role === 'LAB_TECH');
    const pharmUser = users.find((u) => u.role === 'PHARMACIST');
    const cashierUser = users.find((u) => u.role === 'CASHIER');
    const receptionUser = users.find((u) => u.role === 'RECEPTIONIST');

    console.log(`[ORHIMS Seeder] Created ${users.length} staff accounts.`);

    // 2. Seed Pharmacy Inventory
    const inventoryItems = await Inventory.create([
      {
        name: 'Amoxicillin 500mg Capsules',
        genericName: 'Amoxicillin',
        category: 'Antibiotics',
        batchNumber: 'EPSS-2026-AMX-01',
        currentStock: 450,
        reorderLevel: 100,
        unit: 'capsules',
        unitPrice: 5.5,
        expiryDate: new Date('2027-12-31'),
        supplier: 'EPSS (Ethiopian Pharmaceuticals Supply Service)',
      },
      {
        name: 'Coartem (Artemether / Lumefantrine 20/120mg)',
        genericName: 'Artemether + Lumefantrine',
        category: 'Antimalarials',
        batchNumber: 'EPSS-2026-COA-09',
        currentStock: 180,
        reorderLevel: 50,
        unit: 'strips',
        unitPrice: 45.0,
        expiryDate: new Date('2028-06-30'),
        supplier: 'EPSS / Global Fund',
      },
      {
        name: 'Paracetamol 500mg Tablets',
        genericName: 'Paracetamol',
        category: 'Analgesics',
        batchNumber: 'BATCH-PCM-2026',
        currentStock: 1200,
        reorderLevel: 300,
        unit: 'tablets',
        unitPrice: 1.5,
        expiryDate: new Date('2027-09-15'),
        supplier: 'Cadila Pharmaceuticals Ethiopia',
      },
      {
        name: 'Ciprofloxacin 500mg Tablets',
        genericName: 'Ciprofloxacin',
        category: 'Antibiotics',
        batchNumber: 'EPSS-CIP-881',
        currentStock: 320,
        reorderLevel: 80,
        unit: 'tablets',
        unitPrice: 8.0,
        expiryDate: new Date('2027-08-20'),
        supplier: 'EPSS',
      },
      {
        name: 'Normal Saline 0.9% 500ml IV Infusion',
        genericName: 'Sodium Chloride 0.9%',
        category: 'IV Fluids',
        batchNumber: 'IV-NS-2026-44',
        currentStock: 35, // low stock!
        reorderLevel: 50,
        unit: 'bottles',
        unitPrice: 65.0,
        expiryDate: new Date('2028-01-01'),
        supplier: 'Sino-Ethiopian Associates',
      },
      {
        name: 'Omeprazole 20mg Capsules',
        genericName: 'Omeprazole',
        category: 'Analgesics',
        batchNumber: 'OMP-2026-12',
        currentStock: 500,
        reorderLevel: 100,
        unit: 'capsules',
        unitPrice: 4.0,
        expiryDate: new Date('2027-11-30'),
        supplier: 'EPSS',
      },
      {
        name: 'Metformin 500mg Tablets',
        genericName: 'Metformin',
        category: 'Antidiabetics',
        batchNumber: 'MET-2026-30',
        currentStock: 25, // low stock!
        reorderLevel: 60,
        unit: 'tablets',
        unitPrice: 3.5,
        expiryDate: new Date('2027-10-15'),
        supplier: 'EPSS',
      },
    ]);

    console.log(`[ORHIMS Seeder] Created ${inventoryItems.length} inventory items.`);

    // 3. Seed Patients (Bale Robe local demographics)
    const patient1 = await Patient.create({
      patientId: 'ORH-2026-00001',
      firstName: 'Hana',
      fatherName: 'Mohammed',
      grandFatherName: 'Ibrahim',
      gender: 'Female',
      age: 28,
      phone: '0911456789',
      address: {
        region: 'Oromia',
        zone: 'Bale',
        city: 'Bale Robe',
        kebele: 'Kebele 02',
        houseNumber: 'H-412',
      },
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      chronicConditions: [],
      registeredBy: receptionUser._id,
    });

    const patient2 = await Patient.create({
      patientId: 'ORH-2026-00002',
      firstName: 'Abdisa',
      fatherName: 'Awel',
      grandFatherName: 'Tahir',
      gender: 'Male',
      age: 34,
      phone: '0922891234',
      address: {
        region: 'Oromia',
        zone: 'Bale',
        city: 'Bale Robe',
        kebele: 'Kebele 01',
        houseNumber: 'H-108',
      },
      bloodGroup: 'A+',
      allergies: [],
      chronicConditions: ['Mild Hypertension'],
      registeredBy: receptionUser._id,
    });

    const patient3 = await Patient.create({
      patientId: 'ORH-2026-00003',
      firstName: 'Chaltu',
      fatherName: 'Gemechu',
      grandFatherName: 'Tolasa',
      gender: 'Female',
      age: 52,
      phone: '0933789012',
      address: {
        region: 'Oromia',
        zone: 'Bale',
        city: 'Goba',
        kebele: 'Kebele 03',
        houseNumber: 'G-219',
      },
      bloodGroup: 'B+',
      allergies: ['Sulfa drugs'],
      chronicConditions: ['Type 2 Diabetes'],
      registeredBy: receptionUser._id,
    });

    console.log('[ORHIMS Seeder] Created sample patients.');

    // 4. Create Active Encounters representing different stages of the Patient Journey

    // Journey A: Hana Mohammed is WAITING_DOCTOR (Triage completed)
    const encounter1 = await Encounter.create({
      encounterNumber: 'ENC-20261008-001',
      queueNumber: 'OPD-001',
      patient: patient1._id,
      visitType: 'OPD',
      department: 'General OPD',
      assignedDoctor: doctorUser._id,
      priority: 'URGENT',
      status: 'WAITING_DOCTOR',
      createdBy: receptionUser._id,
    });

    const triage1 = await Triage.create({
      encounter: encounter1._id,
      patient: patient1._id,
      nurse: nurseUser._id,
      vitalSigns: {
        bloodPressureSystolic: 125,
        bloodPressureDiastolic: 82,
        pulseRate: 88,
        respiratoryRate: 18,
        temperature: 38.6, // High temp!
        oxygenSaturation: 97,
        weight: 58,
        height: 165,
        bmi: 21.3,
      },
      chiefComplaint: 'High grade fever for 3 days, chills, severe headache, and joint pain.',
      painScale: 6,
      priority: 'URGENT',
      nurseNotes: 'Patient shivering upon arrival. Prompt doctor evaluation requested.',
    });

    encounter1.triageId = triage1._id;
    await encounter1.save();

    // Journey B: Abdisa Awel has just arrived and is WAITING_TRIAGE
    const encounter2 = await Encounter.create({
      encounterNumber: 'ENC-20261008-002',
      queueNumber: 'OPD-002',
      patient: patient2._id,
      visitType: 'OPD',
      department: 'General OPD',
      assignedDoctor: doctorUser._id,
      priority: 'ROUTINE',
      status: 'WAITING_TRIAGE',
      createdBy: receptionUser._id,
    });

    // Journey C: Chaltu Gemechu has full journey COMPLETED (Consultation + Lab + Rx + Billing settled)
    const encounter3 = await Encounter.create({
      encounterNumber: 'ENC-20261008-003',
      queueNumber: 'OPD-003',
      patient: patient3._id,
      visitType: 'OPD',
      department: 'General OPD',
      assignedDoctor: doctorUser._id,
      priority: 'ROUTINE',
      status: 'COMPLETED',
      completedTime: new Date(),
      createdBy: receptionUser._id,
    });

    const triage3 = await Triage.create({
      encounter: encounter3._id,
      patient: patient3._id,
      nurse: nurseUser._id,
      vitalSigns: {
        bloodPressureSystolic: 138,
        bloodPressureDiastolic: 88,
        pulseRate: 76,
        respiratoryRate: 16,
        temperature: 36.8,
        oxygenSaturation: 98,
        weight: 68,
        height: 160,
        bmi: 26.6,
      },
      chiefComplaint: 'Routine diabetes check-up and burning sensation during urination.',
      painScale: 3,
      priority: 'ROUTINE',
      nurseNotes: 'Vitals stable. Fasting blood sugar requested.',
    });
    encounter3.triageId = triage3._id;

    const consultation3 = await Consultation.create({
      encounter: encounter3._id,
      patient: patient3._id,
      doctor: doctorUser._id,
      subjective: {
        chiefComplaint: 'Dysuria for 4 days, polyuria, diabetic follow-up.',
        historyOfPresentIllness: 'Known T2DM patient on Metformin. Reports increased urinary frequency and burning.',
        pastMedicalHistory: 'Type 2 Diabetes Mellitus x 5 years.',
      },
      objective: {
        physicalExamination: 'Abdomen soft, suprapubic tenderness noted.',
        systemicFindings: 'CVS: S1+S2, RS: Clear.',
      },
      assessment: {
        primaryDiagnosis: 'Urinary Tract Infection (UTI)',
        icdCode: 'N39.0',
        secondaryDiagnoses: ['Type 2 Diabetes Mellitus (E11.9)'],
      },
      plan: {
        clinicalNotes: 'Initiate Ciprofloxacin course, continue Metformin, counsel on hydration.',
        treatmentPlan: 'Antibiotic therapy + glycemic control.',
        disposition: 'DISCHARGE_HOME',
      },
    });
    encounter3.consultationId = consultation3._id;

    const lab3 = await LabOrder.create({
      orderNumber: 'LAB-2026-00001',
      encounter: encounter3._id,
      patient: patient3._id,
      orderedByDoctor: doctorUser._id,
      technician: labUser._id,
      status: 'COMPLETED',
      reportedAt: new Date(),
      tests: [
        {
          testName: 'Urinalysis',
          category: 'Microbiology',
          specimen: 'Urine',
          resultValue: 'WBC 15-20 / HPF, Nitrite Positive',
          referenceRange: 'WBC 0-5 / HPF, Nitrite Negative',
          unit: 'HPF',
          isAbnormal: true,
          status: 'COMPLETED',
        },
        {
          testName: 'Random Blood Sugar (RBS)',
          category: 'Biochemistry',
          specimen: 'Whole Blood',
          resultValue: '154',
          referenceRange: '70 - 140',
          unit: 'mg/dL',
          isAbnormal: true,
          status: 'COMPLETED',
        },
      ],
    });
    encounter3.labOrders.push(lab3._id);

    const rx3 = await Prescription.create({
      prescriptionNumber: 'RX-2026-00001',
      encounter: encounter3._id,
      patient: patient3._id,
      prescribedByDoctor: doctorUser._id,
      dispensedByPharmacist: pharmUser._id,
      status: 'COMPLETED',
      dispensedAt: new Date(),
      medications: [
        {
          medicineName: 'Ciprofloxacin 500mg Tablets',
          dosage: '500mg',
          frequency: 'BID (Twice daily)',
          duration: '5 days',
          quantity: 10,
          dispensed: true,
        },
        {
          medicineName: 'Paracetamol 500mg Tablets',
          dosage: '500mg',
          frequency: 'PRN (As needed)',
          duration: '3 days',
          quantity: 6,
          dispensed: true,
        },
      ],
    });
    encounter3.prescriptions.push(rx3._id);

    const invoice3 = await Billing.create({
      invoiceNumber: 'ORH-INV-2026-00001',
      encounter: encounter3._id,
      patient: patient3._id,
      items: [
        { description: 'General OPD Consultation Fee', category: 'CONSULTATION', quantity: 1, unitPrice: 150, totalPrice: 150 },
        { description: 'Laboratory: Urinalysis', category: 'LABORATORY', quantity: 1, unitPrice: 120, totalPrice: 120 },
        { description: 'Laboratory: Random Blood Sugar (RBS)', category: 'LABORATORY', quantity: 1, unitPrice: 80, totalPrice: 80 },
        { description: 'Pharmacy: Ciprofloxacin 500mg (10 tabs)', category: 'PHARMACY', quantity: 10, unitPrice: 8, totalPrice: 80 },
        { description: 'Pharmacy: Paracetamol 500mg (6 tabs)', category: 'PHARMACY', quantity: 6, unitPrice: 1.5, totalPrice: 9 },
      ],
      subtotal: 439,
      discount: 0,
      totalAmount: 439,
      paidAmount: 439,
      paymentStatus: 'PAID',
      paymentMethod: 'TELEBIRR',
      paymentReference: 'TB-8941209384',
      cashier: cashierUser._id,
      paidAt: new Date(),
    });
    encounter3.invoices.push(invoice3._id);

    await encounter3.save();

    // 5. Seed Audit Logs
    await AuditLog.create([
      {
        user: receptionUser._id,
        userName: receptionUser.name,
        userRole: 'RECEPTIONIST',
        action: 'PATIENT_REGISTERED',
        entityType: 'Patient',
        entityId: patient1._id.toString(),
        description: `Registered patient ${patient1.firstName} ${patient1.fatherName} (${patient1.patientId})`,
      },
      {
        user: nurseUser._id,
        userName: nurseUser.name,
        userRole: 'NURSE',
        action: 'TRIAGE_RECORDED',
        entityType: 'Triage',
        entityId: triage1._id.toString(),
        description: `Completed triage for ${encounter1.queueNumber} - Temp: 38.6°C (Priority: URGENT)`,
      },
      {
        user: cashierUser._id,
        userName: cashierUser.name,
        userRole: 'CASHIER',
        action: 'PAYMENT_SETTLED',
        entityType: 'Billing',
        entityId: invoice3._id.toString(),
        description: `Settled 439 ETB payment via Telebirr for Invoice ${invoice3.invoiceNumber}`,
      },
    ]);

    console.log('[ORHIMS Seeder] Successfully seeded full demo database with realistic Ethiopian records!');
    process.exit(0);
  } catch (error) {
    console.error(`[ORHIMS Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

# Oda Roba Hospital MS (ORHIMS) - Demo & Execution Guide

## 1. System Status & Verification Summary

| Component | Status | Details |
| :--- | :--- | :--- |
| **Git Repository** | **Clean & Synced** | Branch `main` pushed to `https://github.com/abdisa38/Oda-Roba-Hospital-MS.git` |
| **Git Security** | **Protected** | Root `.gitignore` in place (ignores `node_modules`, `dist`, `.env`) |
| **Database** | **Connected & Seeded** | MongoDB Atlas cluster connected with demo staff, Bale Robe patients & inventory |
| **Backend API** | **Running (Port 5000)** | Full REST endpoints with JWT auth, RBAC, and Audit Logging |
| **Frontend Client**| **Running (Port 3000)** | Vite + React + Tailwind CSS + Lucide Icons (Production build verified) |

---

## 2. Quick Commands

### Start Backend Server:
```bash
cd "Oda-Roba-Hospital-MS/server"
npm start
```
*(Runs on `http://localhost:5000`)*

### Start Frontend Client:
```bash
cd "Oda-Roba-Hospital-MS/client"
npm run dev
```
*(Runs on `http://localhost:3000`)*

---

## 3. Demo Persona Accounts (1-Click Switchable on Login Page)

| Role | Username | Password | Purpose in Demo |
| :--- | :--- | :--- | :--- |
| **Medical Director** | `director` | `password123` | Executive KPI dashboard, revenue summary, audit logs |
| **Receptionist** | `reception` | `password123` | Patient lookup, new registration, OPD queue ticket issue |
| **Triage Nurse** | `nurse` | `password123` | Vital signs entry (BP, Temp, Pulse, SpO2, Auto BMI, Acuity) |
| **Physician / Doctor** | `doctor` | `password123` | SOAP clinical workspace, diagnosis, lab & rx orders |
| **Lab Technician** | `lab` | `password123` | Test worklist, results entry, reference ranges, publishing |
| **Pharmacist** | `pharmacy` | `password123` | Prescription fulfillment, auto-deduct stock, inventory check |
| **Cashier / Billing** | `cashier` | `password123` | Consolidated itemized invoice, Telebirr/CBE payment settlement |
| **System Admin** | `admin` | `password123` | System oversight & configuration |

---

## 4. The Competition-Winning Evaluation Presentation Script

When you present to the Oda Roba Hospital leadership team, follow this narrative:

1. **Step 1: The Public Face**
   - Open `http://localhost:3000`
   - Show the hospital branding, 24/7 emergency hotline (+251 22 665 0123), clinical departments, and online booking.
   - Click **Waiting Queue Screen** (`/queue-display`) to show the wall-mounted TV view that informs patients in the waiting hall.

2. **Step 2: Admissions & Reception**
   - Go to `/login` and click **Receptionist**.
   - Show how fast it is to search existing patients (e.g., search "Hana").
   - Click **Register New Patient** or select **Hana Mohammed** and click **Check In / Visit**.
   - Issue queue ticket `OPD-001` to General OPD.

3. **Step 3: Nurse Triage & Vitals**
   - Switch role to **Triage Nurse**.
   - Open patient from the triage intake queue.
   - Enter vitals: Blood Pressure `125/82`, Temperature `38.6°C` (shows fever badge), Pulse `88`, SpO2 `97%`, Weight `58kg`, Height `165cm` (BMI automatically computes to `21.3`).
   - Tag acuity as **Urgent**.
   - Click **Complete Triage & Dispatch to Doctor**.

4. **Step 4: Doctor OPD Clinical Workspace**
   - Switch role to **Physician / Doctor**.
   - Show the live OPD queue with the vitals already visible to the doctor.
   - Open the patient to view the complete unified dossier.
   - Review SOAP notes, select primary diagnosis: **Acute Falciparum Malaria** (`B50.9`).
   - Order **Malaria Rapid Diagnostic Test (RDT)** and **Complete Blood Count (CBC)** with 1 click.
   - Prescribe **Coartem (Artemether / Lumefantrine)** with 1 click.
   - Click **Save Consultation & Dispatch Orders**.

5. **Step 5: Laboratory Diagnosis**
   - Switch role to **Lab Technician**.
   - The lab order is already waiting in the queue without anyone carrying paper!
   - Enter test findings: e.g., Malaria RDT: `P. falciparum Rings Positive (+)`.
   - Click **Certify & Publish Laboratory Results**.

6. **Step 6: Pharmacy Dispensing**
   - Switch role to **Pharmacist**.
   - Open the prescription queue.
   - Verify prescribed Coartem and Paracetamol.
   - Click **Dispense & Auto-Deduct Stock**.
   - Switch to the **Pharmacy Inventory** tab to prove that the stock was automatically reduced!

7. **Step 7: Cashier & Billing**
   - Switch role to **Cashier & Billing**.
   - Open the patient's billing encounter.
   - Point out that the system automatically computed the exact total: Consultation Fee + Lab Tests + Dispensed Medicines!
   - Select payment method: **Telebirr** (or CBE Birr), enter transaction slip number, and click **Settle & Complete Visit**.
   - Print or preview the official hospital receipt.

8. **Step 8: Executive Director & Regulatory Audit Trail**
   - Switch role to **Medical Director**.
   - Show the real-time revenue collected today in ETB, OPD attendance, and disease distribution.
   - Scroll down to the **Regulatory Clinical Audit Trail** and explain:
     > *"Every action we just performed—the registration, vitals recorded by the nurse, diagnosis by the doctor, lab results certified, stock deducted, and payment received—has been permanently logged with user name, role, and timestamp in full compliance with Ethiopian Ministry of Health Electronic Health Information standards."*

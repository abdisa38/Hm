import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
  Stethoscope,
  Heart,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  FileText,
  Microscope,
  Pill,
  Send,
  Plus,
  Trash2,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export default function DoctorWorkspace() {
  const [encounters, setEncounters] = useState([]);
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // SOAP State
  const [soap, setSoap] = useState({
    historyOfPresentIllness: '',
    pastMedicalHistory: '',
    physicalExamination: '',
    systemicFindings: '',
    primaryDiagnosis: 'Acute Falciparum Malaria',
    icdCode: 'B50.9',
    clinicalNotes: '',
    treatmentPlan: '',
  });

  // Lab Orders State
  const [orderedLabs, setOrderedLabs] = useState([]);

  // Prescriptions State
  const [prescriptions, setPrescriptions] = useState([]);

  const commonDiagnoses = [
    { label: 'Acute Falciparum Malaria', code: 'B50.9' },
    { label: 'Urinary Tract Infection (UTI)', code: 'N39.0' },
    { label: 'Acute Gastroenteritis (AGE)', code: 'A09' },
    { label: 'Typhoid Fever', code: 'A01.0' },
    { label: 'Community Acquired Pneumonia', code: 'J18.9' },
    { label: 'Essential Hypertension', code: 'I10' },
    { label: 'Type 2 Diabetes Mellitus', code: 'E11.9' },
    { label: 'Upper Respiratory Tract Infection (URTI)', code: 'J06.9' },
  ];

  const commonLabTests = [
    { testName: 'Complete Blood Count (CBC)', category: 'Hematology', specimen: 'Whole Blood' },
    { testName: 'Malaria Rapid Diagnostic Test (RDT)', category: 'Parasitology', specimen: 'Capillary Blood' },
    { testName: 'Urinalysis (Dipstick & Micro)', category: 'Microbiology', specimen: 'Urine' },
    { testName: 'Random Blood Sugar (RBS)', category: 'Biochemistry', specimen: 'Whole Blood' },
    { testName: 'Widal / Typhoid Serology', category: 'Serology', specimen: 'Serum' },
    { testName: 'Stool Wet Mount Microscopy', category: 'Parasitology', specimen: 'Stool' },
  ];

  const fetchDoctorQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/encounters?status=WAITING_DOCTOR');
      setEncounters(res.data);
      if (res.data.length > 0 && !activeEncounter) {
        loadEncounterDetails(res.data[0]._id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadEncounterDetails = async (encId) => {
    try {
      const res = await api.get(`/encounters/${encId}`);
      setActiveEncounter(res.data);
      // Pre-fill chief complaint
      setSoap((prev) => ({
        ...prev,
        historyOfPresentIllness: res.data.triageId?.chiefComplaint || '',
      }));
      setOrderedLabs([]);
      setPrescriptions([]);
      setFeedback(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoctorQueue();
    const interval = setInterval(fetchDoctorQueue, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleLab = (test) => {
    const exists = orderedLabs.some((l) => l.testName === test.testName);
    if (exists) {
      setOrderedLabs(orderedLabs.filter((l) => l.testName !== test.testName));
    } else {
      setOrderedLabs([...orderedLabs, test]);
    }
  };

  const handleAddMedication = () => {
    setPrescriptions([
      ...prescriptions,
      {
        medicineName: 'Coartem (Artemether / Lumefantrine)',
        dosage: '1 strip (6 doses)',
        frequency: 'According to weight schedule',
        duration: '3 days',
        quantity: 1,
        instructions: 'Take with fatty food or milk',
      },
    ]);
  };

  const handleRemoveMedication = (index) => {
    setPrescriptions(prescriptions.filter((_, idx) => idx !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!activeEncounter) return;

    try {
      const payload = {
        encounterId: activeEncounter._id,
        patientId: activeEncounter.patient?._id,
        subjective: {
          chiefComplaint: activeEncounter.triageId?.chiefComplaint || soap.historyOfPresentIllness,
          historyOfPresentIllness: soap.historyOfPresentIllness,
          pastMedicalHistory: soap.pastMedicalHistory,
        },
        objective: {
          physicalExamination: soap.physicalExamination,
          systemicFindings: soap.systemicFindings,
        },
        assessment: {
          primaryDiagnosis: soap.primaryDiagnosis,
          icdCode: soap.icdCode,
        },
        plan: {
          clinicalNotes: soap.clinicalNotes,
          treatmentPlan: soap.treatmentPlan,
          disposition: 'DISCHARGE_HOME',
        },
        labOrders: orderedLabs,
        medications: prescriptions,
      };

      const res = await api.post('/consultations', payload);
      setFeedback({
        type: 'success',
        text: `Consultation saved! Patient status updated to ${res.data.encounterStatus}. Orders dispatched to Lab & Pharmacy.`,
      });
      setActiveEncounter(null);
      fetchDoctorQueue();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Error saving consultation.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-hospital-navy flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-hospital-teal" /> Physician Clinical Workspace (SOAP)
          </h2>
          <p className="text-xs text-slate-500">
            Outpatient consultation, medical diagnostics, laboratory ordering, and electronic prescription.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            Patients in Queue: {encounters.length}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's OPD Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Waiting for Physician
            </h3>
            <button onClick={fetchDoctorQueue} className="text-[11px] text-hospital-teal font-semibold hover:underline">
              Refresh
            </button>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading OPD queue...</div>
            ) : encounters.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No patients waiting in queue.
              </div>
            ) : (
              encounters.map((enc) => {
                const isSelected = activeEncounter?._id === enc._id;
                return (
                  <div
                    key={enc._id}
                    onClick={() => loadEncounterDetails(enc._id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-hospital-teal bg-teal-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-sm text-hospital-blue">
                        {enc.queueNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          enc.priority === 'EMERGENCY'
                            ? 'bg-rose-100 text-rose-700'
                            : enc.priority === 'URGENT'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {enc.priority}
                      </span>
                    </div>

                    <div className="mt-1 font-bold text-xs text-slate-800">
                      {enc.patient?.firstName} {enc.patient?.fatherName}
                    </div>

                    {/* Vitals quick badges */}
                    {enc.triageId?.vitalSigns && (
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          BP: {enc.triageId.vitalSigns.bloodPressureSystolic || '-'}/{enc.triageId.vitalSigns.bloodPressureDiastolic || '-'}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            enc.triageId.vitalSigns.temperature >= 38.0
                              ? 'bg-rose-100 text-rose-700 font-bold'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          T: {enc.triageId.vitalSigns.temperature}°C
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          SpO2: {enc.triageId.vitalSigns.oxygenSaturation}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Comprehensive Single-Screen Consultation Desk */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          {activeEncounter ? (
            <form onSubmit={handleCompleteConsultation} className="space-y-6">
              {/* Patient Dossier Strip */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-hospital-navy">
                        {activeEncounter.patient?.firstName} {activeEncounter.patient?.fatherName}{' '}
                        {activeEncounter.patient?.grandFatherName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 font-mono text-xs font-bold text-slate-700">
                        {activeEncounter.patient?.patientId}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {activeEncounter.patient?.age} yrs • {activeEncounter.patient?.gender} • Phone: {activeEncounter.patient?.phone} •{' '}
                      {activeEncounter.patient?.address?.city || 'Bale Robe'}
                    </div>

                    {/* Allergies Alert */}
                    {activeEncounter.patient?.allergies?.length > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        ALLERGIES: {activeEncounter.patient.allergies.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xl font-black text-hospital-teal">
                      {activeEncounter.queueNumber}
                    </span>
                    <div className="text-xs text-slate-400">Queue Ticket</div>
                  </div>
                </div>

                {/* Triage Vitals Summary */}
                {activeEncounter.triageId && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Triage Findings (Nurse Assessment)
                    </div>
                    <p className="text-xs font-medium text-slate-800 italic mb-2">
                      "{activeEncounter.triageId.chiefComplaint}"
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400">BP</div>
                        <div className="font-mono font-bold">
                          {activeEncounter.triageId.vitalSigns?.bloodPressureSystolic || '-'}/
                          {activeEncounter.triageId.vitalSigns?.bloodPressureDiastolic || '-'}
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400">Pulse</div>
                        <div className="font-mono font-bold">{activeEncounter.triageId.vitalSigns?.pulseRate || '-'} bpm</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400">Temp</div>
                        <div className={`font-mono font-bold ${activeEncounter.triageId.vitalSigns?.temperature >= 38 ? 'text-rose-600' : ''}`}>
                          {activeEncounter.triageId.vitalSigns?.temperature || '-'}°C
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400">SpO2</div>
                        <div className="font-mono font-bold">{activeEncounter.triageId.vitalSigns?.oxygenSaturation || '-'}%</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400">BMI</div>
                        <div className="font-mono font-bold">{activeEncounter.triageId.vitalSigns?.bmi || '-'}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400">Pain</div>
                        <div className="font-mono font-bold">{activeEncounter.triageId.painScale || 0}/10</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SOAP Documentation Section */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-hospital-navy uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-hospital-teal" /> Medical SOAP Notes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Subjective: History of Present Illness (HPI)
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Symptoms duration, onset, severity, triggers..."
                      value={soap.historyOfPresentIllness}
                      onChange={(e) => setSoap({ ...soap, historyOfPresentIllness: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Objective: Physical Examination Findings
                    </label>
                    <textarea
                      rows="3"
                      placeholder="CVS, Respiratory, Abdominal exam, HEENT findings..."
                      value={soap.physicalExamination}
                      onChange={(e) => setSoap({ ...soap, physicalExamination: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                    ></textarea>
                  </div>
                </div>

                {/* Assessment & Diagnosis Selector */}
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-3">
                  <div className="text-xs font-bold text-hospital-navy">Assessment & Clinical Diagnosis</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Select Standard Diagnosis (Bale Robe Profile)
                      </label>
                      <select
                        value={soap.primaryDiagnosis}
                        onChange={(e) => {
                          const selected = commonDiagnoses.find((d) => d.label === e.target.value);
                          setSoap({
                            ...soap,
                            primaryDiagnosis: e.target.value,
                            icdCode: selected ? selected.code : '',
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-hospital-teal focus:outline-none bg-white"
                      >
                        {commonDiagnoses.map((d, idx) => (
                          <option key={idx} value={d.label}>
                            {d.label} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        ICD-10 Code
                      </label>
                      <input
                        type="text"
                        value={soap.icdCode}
                        onChange={(e) => setSoap({ ...soap, icdCode: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 1-Click Laboratory Orders Module */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-hospital-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Microscope className="w-4 h-4 text-purple-600" /> Digital Laboratory Orders
                  </h4>
                  <span className="text-xs text-purple-700 font-semibold">
                    {orderedLabs.length} tests selected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {commonLabTests.map((test, idx) => {
                    const isChecked = orderedLabs.some((l) => l.testName === test.testName);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleLab(test)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                          isChecked
                            ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{test.testName}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Electronic Prescription Module */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-hospital-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-amber-600" /> Electronic Prescription (e-Rx)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1 border border-amber-200"
                  >
                    <Plus className="w-3 h-3" /> Add Medication
                  </button>
                </div>

                {prescriptions.length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    No medications added. Click "Add Medication" above to prescribe.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.map((med, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-600">Medication Name</label>
                            <input
                              type="text"
                              value={med.medicineName}
                              onChange={(e) => handleMedChange(idx, 'medicineName', e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600">Dosage</label>
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded-lg bg-white"
                            />
                          </div>
                          <div className="flex items-end gap-1">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-600">Duration</label>
                              <input
                                type="text"
                                value={med.duration}
                                onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded-lg bg-white"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMedication(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Complete & Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-hospital-navy hover:bg-hospital-blue text-white shadow-lg shadow-blue-900/10 flex items-center gap-2 transition"
                >
                  <Send className="w-4 h-4 text-teal-300" />
                  <span>Save Consultation & Dispatch Orders</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Stethoscope className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">No Patient Encounter Selected</div>
              <div className="text-xs">Select a patient from the waiting queue on the left to open clinical workspace.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

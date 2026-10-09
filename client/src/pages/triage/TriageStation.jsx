import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Gauge,
  Weight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
} from 'lucide-react';

export default function TriageStation() {
  const [encounters, setEncounters] = useState([]);
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [vitals, setVitals] = useState({
    bpSys: '',
    bpDia: '',
    pulse: '',
    respRate: '',
    temp: '',
    spo2: '',
    weight: '',
    height: '',
    chiefComplaint: '',
    painScale: 0,
    priority: 'ROUTINE',
    nurseNotes: '',
  });

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/encounters?status=WAITING_TRIAGE');
      setEncounters(res.data);
      if (res.data.length > 0 && !selectedEncounter) {
        setSelectedEncounter(res.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000); // Polling for new arrivals
    return () => clearInterval(interval);
  }, []);

  // Compute BMI dynamically
  const calculateBMI = () => {
    if (vitals.weight && vitals.height && Number(vitals.height) > 0) {
      const hM = Number(vitals.height) / 100;
      return (Number(vitals.weight) / (hM * hM)).toFixed(1);
    }
    return null;
  };

  const handleSelect = (enc) => {
    setSelectedEncounter(enc);
    setFeedback(null);
    setVitals({
      bpSys: '',
      bpDia: '',
      pulse: '',
      respRate: '',
      temp: '',
      spo2: '',
      weight: '',
      height: '',
      chiefComplaint: '',
      painScale: 0,
      priority: enc.priority || 'ROUTINE',
      nurseNotes: '',
    });
  };

  const handleSubmitTriage = async (e) => {
    e.preventDefault();
    if (!selectedEncounter) return;

    try {
      const payload = {
        encounterId: selectedEncounter._id,
        patientId: selectedEncounter.patient?._id,
        vitalSigns: {
          bloodPressureSystolic: Number(vitals.bpSys) || undefined,
          bloodPressureDiastolic: Number(vitals.bpDia) || undefined,
          pulseRate: Number(vitals.pulse) || undefined,
          respiratoryRate: Number(vitals.respRate) || undefined,
          temperature: Number(vitals.temp) || undefined,
          oxygenSaturation: Number(vitals.spo2) || undefined,
          weight: Number(vitals.weight) || undefined,
          height: Number(vitals.height) || undefined,
          bmi: calculateBMI() ? Number(calculateBMI()) : undefined,
        },
        chiefComplaint: vitals.chiefComplaint,
        painScale: Number(vitals.painScale),
        priority: vitals.priority,
        nurseNotes: vitals.nurseNotes,
      };

      await api.post('/triage', payload);
      setFeedback({
        type: 'success',
        text: `Triage complete for ${selectedEncounter.queueNumber}! Patient routed to Doctor Consultation Queue.`,
      });
      setSelectedEncounter(null);
      fetchQueue();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save triage assessment.',
      });
    }
  };

  const currentBMI = calculateBMI();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-hospital-navy flex items-center gap-2">
            <Activity className="w-5 h-5 text-hospital-teal" /> Nurse Triage & Vital Signs Station
          </h2>
          <p className="text-xs text-slate-500">
            Rapid patient assessment, physiological vitals monitoring, and acuity prioritization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            Waiting in Triage: {encounters.length}
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
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Triage Queue List */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Triage Intake Queue
            </h3>
            <button
              onClick={fetchQueue}
              className="text-[11px] text-hospital-teal hover:underline font-semibold"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading incoming patients...</div>
            ) : encounters.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No patients currently waiting for triage. All caught up!
              </div>
            ) : (
              encounters.map((enc) => {
                const isSelected = selectedEncounter?._id === enc._id;
                return (
                  <div
                    key={enc._id}
                    onClick={() => handleSelect(enc)}
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
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {enc.priority}
                      </span>
                    </div>

                    <div className="mt-1 font-semibold text-xs text-slate-800">
                      {enc.patient?.firstName} {enc.patient?.fatherName}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{enc.patient?.gender} • {enc.patient?.age} yrs</span>
                      <span className="font-mono">{enc.patient?.patientId}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Vitals Recording Sheet */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {selectedEncounter ? (
            <form onSubmit={handleSubmitTriage} className="space-y-6">
              {/* Patient Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Active Patient Assessment
                  </div>
                  <div className="text-base font-extrabold text-hospital-navy">
                    {selectedEncounter.patient?.firstName} {selectedEncounter.patient?.fatherName}{' '}
                    {selectedEncounter.patient?.grandFatherName}
                  </div>
                  <div className="text-xs text-slate-500">
                    ID: <span className="font-mono font-semibold text-hospital-blue">{selectedEncounter.patient?.patientId}</span> •{' '}
                    {selectedEncounter.patient?.age} Years Old • {selectedEncounter.patient?.gender}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Queue Number</div>
                  <div className="font-mono font-extrabold text-lg text-hospital-teal">
                    {selectedEncounter.queueNumber}
                  </div>
                  <div className="text-xs text-slate-500">{selectedEncounter.department}</div>
                </div>
              </div>

              {/* Vitals Form Grid */}
              <div>
                <h4 className="font-bold text-xs text-hospital-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" /> Objective Physiological Vital Signs
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Blood Pressure */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      BP (Systolic / Diastolic)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="120"
                        value={vitals.bpSys}
                        onChange={(e) => setVitals({ ...vitals, bpSys: e.target.value })}
                        className="w-1/2 px-2 py-1.5 border rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500"
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        type="number"
                        placeholder="80"
                        value={vitals.bpDia}
                        onChange={(e) => setVitals({ ...vitals, bpDia: e.target.value })}
                        className="w-1/2 px-2 py-1.5 border rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">mmHg</span>
                  </div>

                  {/* Pulse Rate */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Pulse Rate (HR)
                    </label>
                    <input
                      type="number"
                      placeholder="72"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500"
                    />
                    <span className="text-[10px] text-slate-400">beats / min</span>
                  </div>

                  {/* Temperature */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                      <span>Temperature</span>
                      {Number(vitals.temp) >= 38.0 && (
                        <span className="text-[10px] text-rose-600 font-bold">Fever</span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="36.8"
                      value={vitals.temp}
                      onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                      className={`w-full px-2 py-1.5 border rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500 ${
                        Number(vitals.temp) >= 38.0 ? 'border-rose-400 bg-rose-50 text-rose-700' : ''
                      }`}
                    />
                    <span className="text-[10px] text-slate-400">°C (Celsius)</span>
                  </div>

                  {/* Oxygen Saturation */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Oxygen (SpO2)
                    </label>
                    <input
                      type="number"
                      placeholder="98"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500"
                    />
                    <span className="text-[10px] text-slate-400">% Saturation</span>
                  </div>

                  {/* Respiratory Rate */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Respiratory Rate
                    </label>
                    <input
                      type="number"
                      placeholder="18"
                      value={vitals.respRate}
                      onChange={(e) => setVitals({ ...vitals, respRate: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500"
                    />
                    <span className="text-[10px] text-slate-400">breaths / min</span>
                  </div>

                  {/* Weight */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="65"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500"
                    />
                    <span className="text-[10px] text-slate-400">Kilograms</span>
                  </div>

                  {/* Height */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="165"
                      value={vitals.height}
                      onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500"
                    />
                    <span className="text-[10px] text-slate-400">Centimeters</span>
                  </div>

                  {/* Automated BMI */}
                  <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200">
                    <label className="block text-[11px] font-bold text-teal-900 mb-1">
                      Auto-Calculated BMI
                    </label>
                    <div className="text-base font-extrabold text-hospital-navy font-mono">
                      {currentBMI ? currentBMI : '--'}
                    </div>
                    <span className="text-[10px] text-teal-700">
                      {currentBMI
                        ? Number(currentBMI) > 25
                          ? 'Overweight'
                          : Number(currentBMI) < 18.5
                          ? 'Underweight'
                          : 'Normal Range'
                        : 'Enter Wt & Ht'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chief Complaint & Pain Assessment */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chief Complaint (Patient Symptoms) *
                  </label>
                  <textarea
                    required
                    rows="2"
                    placeholder="e.g. Fever for 3 days, body aches, shivering, headache..."
                    value={vitals.chiefComplaint}
                    onChange={(e) => setVitals({ ...vitals, chiefComplaint: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pain Scale: <span className="text-hospital-teal font-extrabold">{vitals.painScale} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={vitals.painScale}
                      onChange={(e) => setVitals({ ...vitals, painScale: e.target.value })}
                      className="w-full accent-hospital-teal cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0 (No Pain)</span>
                      <span>5 (Moderate)</span>
                      <span>10 (Severe Pain)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Acuity Priority Tag
                    </label>
                    <select
                      value={vitals.priority}
                      onChange={(e) => setVitals({ ...vitals, priority: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                    >
                      <option value="ROUTINE">Routine (Green)</option>
                      <option value="URGENT">Urgent (Yellow - High Fever / Pain)</option>
                      <option value="EMERGENCY">Emergency (Red - Immediate Doctor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nurse Clinical Observations & Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Patient visibly fatigued, alert, oriented to time and place."
                    value={vitals.nurseNotes}
                    onChange={(e) => setVitals({ ...vitals, nurseNotes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-hospital-navy hover:bg-hospital-blue text-white shadow-md flex items-center gap-2 transition"
                >
                  <span>Complete Triage & Dispatch to Doctor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Activity className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">No Patient Selected</div>
              <div className="text-xs">Select a patient from the left triage intake queue to record vital signs.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

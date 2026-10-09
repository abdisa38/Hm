import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
  UserPlus,
  Search,
  Users,
  Ticket,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileBadge,
  Calendar,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';

export default function ReceptionDashboard() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // New Patient Form State
  const [formData, setFormData] = useState({
    firstName: '',
    fatherName: '',
    grandFatherName: '',
    gender: 'Female',
    age: '',
    phone: '',
    kebele: 'Kebele 02',
    bloodGroup: 'O+',
    allergies: '',
  });

  // Check-In Form State
  const [checkInData, setCheckInData] = useState({
    department: 'General OPD',
    visitType: 'OPD',
    priority: 'ROUTINE',
  });

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/patients?search=${encodeURIComponent(query)}`);
      setPatients(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchTerm);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: formData.firstName,
        fatherName: formData.fatherName,
        grandFatherName: formData.grandFatherName,
        gender: formData.gender,
        age: Number(formData.age),
        phone: formData.phone,
        address: {
          region: 'Oromia',
          zone: 'Bale',
          city: 'Bale Robe',
          kebele: formData.kebele,
        },
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies ? formData.allergies.split(',').map((a) => a.trim()) : [],
      };

      const res = await api.post('/patients', payload);
      setFeedback({ type: 'success', text: `Patient registered: ${res.data.fullName} (${res.data.patientId})` });
      setShowRegisterModal(false);
      setSelectedPatient(res.data);
      fetchPatients();
      setFormData({
        firstName: '',
        fatherName: '',
        grandFatherName: '',
        gender: 'Female',
        age: '',
        phone: '',
        kebele: 'Kebele 02',
        bloodGroup: 'O+',
        allergies: '',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Error registering patient.' });
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const payload = {
        patientId: selectedPatient._id,
        department: checkInData.department,
        visitType: checkInData.visitType,
        priority: checkInData.priority,
      };
      const res = await api.post('/encounters', payload);
      setFeedback({
        type: 'success',
        text: `Patient checked in successfully! Ticket: ${res.data.queueNumber} dispatched to Nurse Triage.`,
      });
      setShowCheckInModal(false);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Check-in failed.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-hospital-navy">
            Patient Admissions & Reception Desk
          </h2>
          <p className="text-xs text-slate-500">
            Search patient records, issue national health cards, and generate OPD queue tickets.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-teal hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Patient ID (e.g. ORH-2026-00001), Full Name, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-hospital-teal"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-hospital-navy hover:bg-hospital-blue text-white rounded-xl text-xs font-semibold transition"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchPatients('');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Patients Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-hospital-navy">Registered Patients Directory</h3>
          <span className="text-xs text-slate-500">{patients.length} records found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Address / Kebele</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Loading patient records...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">No matching patient records.</td>
                </tr>
              ) : (
                patients.map((pt) => (
                  <tr key={pt._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-hospital-blue">
                      {pt.patientId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {pt.firstName} {pt.fatherName} {pt.grandFatherName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pt.age} yrs • {pt.gender}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {pt.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pt.address?.city || 'Bale Robe'}, {pt.address?.kebele || '02'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                        {pt.bloodGroup || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(pt);
                          setShowCheckInModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-hospital-teal font-semibold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <Ticket className="w-3 h-3" />
                        <span>Check In / Visit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(pt);
                          setShowCardModal(true);
                        }}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition inline-flex items-center gap-1"
                        title="Print Patient Card"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Card</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-hospital-navy flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-hospital-teal" /> Register New Patient
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hana"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Father Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammed"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Grandfather Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ibrahim"
                    value={formData.grandFatherName}
                    onChange={(e) => setFormData({ ...formData, grandFatherName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  >
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Age in years"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0911 234 567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kebele (Bale Robe)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kebele 02"
                    value={formData.kebele}
                    onChange={(e) => setFormData({ ...formData, kebele: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                  >
                    <option>Unknown</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Known Drug Allergies (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-hospital-teal hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Save & Assign Patient ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check In / Start Visit Modal */}
      {showCheckInModal && selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-hospital-navy flex items-center gap-2">
                <Ticket className="w-4 h-4 text-hospital-teal" /> OPD Check-In & Queue Issue
              </h3>
              <button onClick={() => setShowCheckInModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="py-3 bg-slate-50 rounded-xl p-3 my-3 text-xs">
              <div className="font-bold text-slate-800">{selectedPatient.firstName} {selectedPatient.fatherName}</div>
              <div className="font-mono text-hospital-teal">{selectedPatient.patientId} • {selectedPatient.age} yrs • {selectedPatient.gender}</div>
            </div>
            <form onSubmit={handleCheckIn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={checkInData.department}
                  onChange={(e) => setCheckInData({ ...checkInData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                >
                  <option>General OPD</option>
                  <option>Emergency & Trauma</option>
                  <option>Internal Medicine</option>
                  <option>Pediatrics</option>
                  <option>Obstetrics & Gynecology</option>
                  <option>General Surgery</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Acuity Priority</label>
                <select
                  value={checkInData.priority}
                  onChange={(e) => setCheckInData({ ...checkInData, priority: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-hospital-teal focus:outline-none"
                >
                  <option value="ROUTINE">Routine (Standard Queue)</option>
                  <option value="URGENT">Urgent (Priority Triage)</option>
                  <option value="EMERGENCY">Emergency (Immediate Resuscitation)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-3 py-2 border rounded-xl text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-hospital-navy hover:bg-hospital-blue text-white rounded-xl text-xs font-semibold shadow"
                >
                  Generate Ticket & Send to Triage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Card Printable Preview Modal */}
      {showCardModal && selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital Card</span>
              <button onClick={() => setShowCardModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-4 rounded-xl border-2 border-hospital-blue/30 bg-gradient-to-br from-hospital-navy to-hospital-blue text-white shadow-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] tracking-widest text-teal-300 font-bold uppercase">
                    Oda Roba General Hospital
                  </div>
                  <div className="text-xs text-slate-300">Bale Robe, Oromia, Ethiopia</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">
                  ORH
                </div>
              </div>

              <div className="pt-2">
                <div className="text-sm font-extrabold tracking-tight">
                  {selectedPatient.firstName} {selectedPatient.fatherName} {selectedPatient.grandFatherName}
                </div>
                <div className="text-xs text-slate-300">
                  {selectedPatient.gender} • {selectedPatient.age} Years Old
                </div>
              </div>

              <div className="flex justify-between items-end pt-2 border-t border-white/20 text-xs">
                <div>
                  <div className="text-[10px] text-slate-300">PATIENT ID:</div>
                  <div className="font-mono font-bold text-teal-300 text-sm">{selectedPatient.patientId}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-300">BLOOD TYPE:</div>
                  <div className="font-bold">{selectedPatient.bloodGroup}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-hospital-navy text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" /> Print Patient Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

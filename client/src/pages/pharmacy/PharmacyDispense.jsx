import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
  Pill,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function PharmacyDispense() {
  const [activeTab, setActiveTab] = useState('dispense'); // 'dispense' or 'inventory'
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedRx, setSelectedRx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/prescriptions?status=PENDING');
      setPrescriptions(res.data);
      if (res.data.length > 0 && !selectedRx) {
        setSelectedRx(res.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await api.get(`/pharmacy/inventory?search=${encodeURIComponent(inventorySearch)}`);
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchInventory();
    const interval = setInterval(() => {
      fetchPrescriptions();
      fetchInventory();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleDispense = async (e) => {
    e.preventDefault();
    if (!selectedRx) return;

    try {
      const res = await api.post(`/pharmacy/prescriptions/${selectedRx._id}/dispense`, {
        pharmacistNotes,
      });

      setFeedback({
        type: 'success',
        text: `Prescription ${selectedRx.prescriptionNumber} dispensed! Stock automatically deducted. Patient routed to Billing.`,
      });

      setSelectedRx(null);
      setPharmacistNotes('');
      fetchPrescriptions();
      fetchInventory();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Dispensing failed.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-hospital-navy flex items-center gap-2">
            <Pill className="w-5 h-5 text-amber-600" /> Pharmacy Dispensing & Stock Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Prescription fulfillment, automatic stock deduction, batch expiry tracking, and EPSS compliance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dispense')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'dispense' ? 'bg-amber-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending Dispense ({prescriptions.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('inventory');
              fetchInventory();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'inventory' ? 'bg-amber-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pharmacy Inventory ({inventory.length})
          </button>
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

      {/* Tab 1: Dispense Queue */}
      {activeTab === 'dispense' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pending Prescriptions */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Prescriptions Queue
              </h3>
              <span className="text-xs text-slate-400">{prescriptions.length} waiting</span>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading prescriptions...</div>
              ) : prescriptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No prescriptions waiting.</div>
              ) : (
                prescriptions.map((rx) => {
                  const isSelected = selectedRx?._id === rx._id;
                  return (
                    <div
                      key={rx._id}
                      onClick={() => {
                        setSelectedRx(rx);
                        setFeedback(null);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-xs text-amber-800">
                          {rx.prescriptionNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {rx.status}
                        </span>
                      </div>

                      <div className="mt-1 font-bold text-xs text-slate-800">
                        {rx.patient?.firstName} {rx.patient?.fatherName}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                        <span>{rx.medications?.length} items prescribed</span>
                        <span>Dr. {rx.prescribedByDoctor?.name || 'Physician'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Dispensing Details & Stock Verification */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {selectedRx ? (
              <form onSubmit={handleDispense} className="space-y-6">
                {/* Patient Header */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Patient Details</div>
                    <div className="text-base font-extrabold text-hospital-navy">
                      {selectedRx.patient?.firstName} {selectedRx.patient?.fatherName}
                    </div>
                    <div className="text-xs text-slate-500">
                      ID: <span className="font-mono font-semibold text-hospital-blue">{selectedRx.patient?.patientId}</span> •{' '}
                      {selectedRx.patient?.age} yrs • {selectedRx.patient?.gender}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Prescription #</div>
                    <div className="font-mono font-extrabold text-base text-amber-700">
                      {selectedRx.prescriptionNumber}
                    </div>
                    <div className="text-xs text-slate-500">
                      Dr. {selectedRx.prescribedByDoctor?.name || 'Physician'}
                    </div>
                  </div>
                </div>

                {/* Prescribed Items Table */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-hospital-navy uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Prescribed Medications Verification
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                          <th className="py-2.5 px-3">Medication</th>
                          <th className="py-2.5 px-3">Dosage / Freq</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3">Qty to Dispense</th>
                          <th className="py-2.5 px-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRx.medications?.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3 font-bold text-slate-800">
                              {m.medicineName}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {m.dosage} • {m.frequency}
                            </td>
                            <td className="py-3 px-3 text-slate-600">{m.duration}</td>
                            <td className="py-3 px-3 font-mono font-bold text-hospital-teal">
                              {m.quantity} units
                            </td>
                            <td className="py-3 px-3 text-slate-500 italic">
                              {m.instructions || 'Standard dosing'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pharmacist Instructions / Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Counseling Notes / Pharmacist Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Advised patient to complete full antibiotic course and take with plenty of fluids."
                    value={pharmacistNotes}
                    onChange={(e) => setPharmacistNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Dispense Trigger Button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center gap-2 transition"
                  >
                    <span>Dispense & Auto-Deduct Stock</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <Pill className="w-12 h-12 mx-auto text-slate-300" />
                <div className="text-sm font-semibold text-slate-600">No Prescription Selected</div>
                <div className="text-xs">Select a prescription from the queue on the left to verify and dispense.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Hospital Inventory */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <h3 className="font-bold text-sm text-hospital-navy flex items-center gap-2">
              <Package className="w-4 h-4 text-hospital-teal" /> Pharmaceutical Inventory & Supply Levels
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search stock by name, batch..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') fetchInventory();
                }}
                className="px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-hospital-teal"
              />
              <button
                onClick={fetchInventory}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Search
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-3 px-3">Medicine Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Batch Number</th>
                  <th className="py-3 px-3">Stock Level</th>
                  <th className="py-3 px-3">Unit Price (ETB)</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-bold text-slate-800">{item.name}</td>
                    <td className="py-3 px-3 text-slate-600">{item.category}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{item.batchNumber}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{item.unitPrice} ETB</td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'LOW_STOCK'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'OUT_OF_STOCK'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

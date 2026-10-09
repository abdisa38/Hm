import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
  Microscope,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';

export default function LaboratoryQueue() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lab');
      setOrders(res.data);
      if (res.data.length > 0 && !selectedOrder) {
        setSelectedOrder(res.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTestResultChange = (index, field, value) => {
    if (!selectedOrder) return;
    const updatedTests = [...selectedOrder.tests];
    updatedTests[index][field] = value;
    setSelectedOrder({ ...selectedOrder, tests: updatedTests });
  };

  const handlePublishResults = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const payload = {
        tests: selectedOrder.tests.map((t) => ({
          ...t,
          status: 'COMPLETED',
        })),
        clinicalNotes: selectedOrder.clinicalNotes || '',
        overallStatus: 'COMPLETED',
      };

      const res = await api.put(`/lab/${selectedOrder._id}/results`, payload);
      setFeedback({
        type: 'success',
        text: `Results verified and published for order ${res.data.orderNumber}! Results synced to Patient Medical Record.`,
      });
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to publish lab results.',
      });
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return o.status !== 'COMPLETED';
    if (filterStatus === 'COMPLETED') return o.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-hospital-navy flex items-center gap-2">
            <Microscope className="w-5 h-5 text-purple-600" /> Clinical Laboratory Diagnostic Unit
          </h2>
          <p className="text-xs text-slate-500">
            Specimen reception, automated diagnostic analysis, and certified test result publishing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'PENDING' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Pending Analysis
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'COMPLETED' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Completed
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Orders Worklist */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Diagnostic Worklist
            </h3>
            <span className="text-xs text-slate-400">{filteredOrders.length} orders</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading lab orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No lab orders in queue.</div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = selectedOrder?._id === ord._id;
                const isCompleted = ord.status === 'COMPLETED';

                return (
                  <div
                    key={ord._id}
                    onClick={() => {
                      setSelectedOrder(ord);
                      setFeedback(null);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-xs text-purple-700">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="mt-1 font-bold text-xs text-slate-800">
                      {ord.patient?.firstName} {ord.patient?.fatherName}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                      <span>{ord.tests?.length} tests ordered</span>
                      <span>By: Dr. {ord.orderedByDoctor?.name || 'Physician'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Results Entry / Verification Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {selectedOrder ? (
            <form onSubmit={handlePublishResults} className="space-y-6">
              {/* Order Header Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Patient Details</div>
                  <div className="text-base font-extrabold text-hospital-navy">
                    {selectedOrder.patient?.firstName} {selectedOrder.patient?.fatherName}
                  </div>
                  <div className="text-xs text-slate-500">
                    ID: <span className="font-mono font-semibold text-hospital-blue">{selectedOrder.patient?.patientId}</span> •{' '}
                    {selectedOrder.patient?.age} yrs • {selectedOrder.patient?.gender}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Lab Order #</div>
                  <div className="font-mono font-extrabold text-base text-purple-700">
                    {selectedOrder.orderNumber}
                  </div>
                  <div className="text-xs text-slate-500">
                    Dr. {selectedOrder.orderedByDoctor?.name || 'OPD Physician'}
                  </div>
                </div>
              </div>

              {/* Tests Results Form Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-hospital-navy uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-purple-600" /> Ordered Diagnostic Parameters
                </h4>

                <div className="space-y-3">
                  {selectedOrder.tests?.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition ${
                        t.isAbnormal ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                        <div>
                          <span className="font-bold text-xs text-slate-800">{t.testName}</span>
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {t.category} • Specimen: {t.specimen}
                          </span>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={t.isAbnormal || false}
                            onChange={(e) => handleTestResultChange(idx, 'isAbnormal', e.target.checked)}
                            className="rounded accent-rose-600"
                          />
                          <span>Flag Abnormal / Critical</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Diagnostic Result Findings *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Positive (+), Reactive, 14.2 g/dL, Normal..."
                            value={t.resultValue || ''}
                            onChange={(e) => handleTestResultChange(idx, 'resultValue', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Reference Interval / Range
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Negative, 12 - 16 g/dL"
                            value={t.referenceRange || ''}
                            onChange={(e) => handleTestResultChange(idx, 'referenceRange', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Technician Clinical Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lab Technician Diagnostic Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Specimen analyzed with automated Coulter counter, verified on peripheral smear."
                  value={selectedOrder.clinicalNotes || ''}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, clinicalNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-purple-700 hover:bg-purple-800 text-white shadow-md flex items-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Certify & Publish Laboratory Results</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Microscope className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">No Lab Order Selected</div>
              <div className="text-xs">Choose an order from the worklist to enter test findings.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

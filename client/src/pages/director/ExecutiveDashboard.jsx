import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
  LayoutDashboard,
  Users,
  Activity,
  CreditCard,
  Microscope,
  Package,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function ExecutiveDashboard() {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, auditRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/audit-logs?limit=25'),
      ]);
      setStats(dashRes.data);
      setAuditLogs(auditRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-16 text-center text-slate-400 text-xs">
        Loading Oda Roba Hospital executive analytics...
      </div>
    );
  }

  const { summary, lowStockItems, departmentDistribution, topDiagnoses } = stats;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-hospital-navy">
              Executive Director Operations Dashboard
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-hospital-teal border border-teal-200">
              Live Facility Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time administrative visibility across clinical departments, revenue collection, and health data governance.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          Refresh Statistics
        </button>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold">Registered Patients</span>
            <Users className="w-4 h-4 text-hospital-teal" />
          </div>
          <div className="text-2xl font-extrabold text-hospital-navy">
            {summary.totalPatients}
          </div>
          <div className="text-[11px] text-teal-700 font-medium">Bale Robe Master Registry</div>
        </div>

        {/* Today's Visits */}
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold">Today's Total Encounters</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-hospital-navy">
            {summary.todayTotalVisits}
          </div>
          <div className="text-[11px] text-slate-500">
            OPD: {summary.opdVisitsToday} | Emergency: {summary.emergencyVisitsToday}
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold">Revenue Collected Today</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {summary.totalRevenueToday.toLocaleString()} ETB
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Cash + Telebirr + CBE</div>
        </div>

        {/* Operational Flow */}
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold">Completed Discharges</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-hospital-navy">
            {summary.completedVisitsToday}
          </div>
          <div className="text-[11px] text-slate-500">
            Active in Hospital Queue: {summary.inQueueToday}
          </div>
        </div>
      </div>

      {/* Middle Grid: Disease Prevalence & Clinical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Diagnoses */}
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-hospital-teal" /> Top Clinical Diagnoses (Bale Robe OPD)
          </h3>

          <div className="space-y-3">
            {topDiagnoses.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">No diagnosis data recorded yet.</div>
            ) : (
              topDiagnoses.map((diag, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-800">{diag._id || 'General Consultation'}</div>
                  <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-hospital-teal text-xs font-bold font-mono">
                    {diag.count} cases
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pharmacy Stock Alerts */}
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Pharmacy Inventory Reorder Alerts
          </h3>

          <div className="space-y-2">
            {lowStockItems.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                All pharmaceutical items are well above safety threshold.
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item._id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-amber-900">{item.name}</div>
                    <div className="text-[10px] text-amber-700 font-mono">Batch: {item.batchNumber}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      {item.currentStock} {item.unit} left
                    </span>
                    <div className="text-[10px] text-slate-400">Reorder at: {item.reorderLevel}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Regulatory Healthcare Audit Trail Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-sm text-hospital-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-hospital-teal" /> Regulatory Clinical Audit Trail
            </h3>
            <p className="text-[11px] text-slate-500">
              Compliant with Ethiopian Ministry of Health Electronic Health Information standards (Security, Traceability & Non-Repudiation).
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Immutable System Log</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Staff Member</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Clinical Action</th>
                <th className="py-2.5 px-3">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {auditLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 text-slate-400 text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                    {log.userName}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-hospital-blue text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-600 truncate max-w-xs">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

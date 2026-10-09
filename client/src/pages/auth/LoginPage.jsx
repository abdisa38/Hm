import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Lock,
  User,
  ArrowRight,
  HeartPulse,
  Activity,
  Stethoscope,
  Microscope,
  Pill,
  CreditCard,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, demoLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      redirectByRole();
    } else {
      setError(res.message);
    }
  };

  const handleQuickDemo = async (roleUsername, defaultPath) => {
    setError('');
    const res = await demoLogin(roleUsername);
    if (res.success) {
      navigate(defaultPath);
    } else {
      setError(res.message);
    }
  };

  const redirectByRole = () => {
    const saved = localStorage.getItem('orhims_user');
    if (saved) {
      const user = JSON.parse(saved);
      switch (user.role) {
        case 'DIRECTOR':
          navigate('/director');
          break;
        case 'DOCTOR':
          navigate('/doctor');
          break;
        case 'NURSE':
          navigate('/triage');
          break;
        case 'RECEPTIONIST':
          navigate('/reception');
          break;
        case 'LAB_TECH':
          navigate('/laboratory');
          break;
        case 'PHARMACIST':
          navigate('/pharmacy');
          break;
        case 'CASHIER':
          navigate('/billing');
          break;
        default:
          navigate('/director');
      }
    }
  };

  const demoAccounts = [
    { name: 'Dr. Sisay Kebede', role: 'Medical Director', user: 'director', path: '/director', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { name: 'Meron Abebe', role: 'Receptionist', user: 'reception', path: '/reception', icon: UserPlus, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { name: 'Nurse Fatuma Ali', role: 'Triage Nurse', user: 'nurse', path: '/triage', icon: Activity, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { name: 'Dr. Ahmed Mohammed', role: 'Physician / Doctor', user: 'doctor', path: '/doctor', icon: Stethoscope, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { name: 'Chala Bekele', role: 'Lab Technician', user: 'lab', path: '/laboratory', icon: Microscope, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { name: 'Tigist Haile', role: 'Pharmacist', user: 'pharmacy', path: '/pharmacy', icon: Pill, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { name: 'Dawit Tadesse', role: 'Cashier / Billing', user: 'cashier', path: '/billing', icon: CreditCard, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { name: 'System Admin', role: 'IT Administrator', user: 'admin', path: '/director', icon: ShieldAlert, color: 'text-slate-700 bg-slate-100 border-slate-300' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-hospital-navy via-hospital-blue to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-hospital-teal flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-teal-500/30">
            ORH
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          ORHIMS Staff Portal
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Oda Roba Hospital Information & Management System
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. doctor, nurse, reception"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-hospital-teal focus:border-hospital-teal transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-hospital-teal focus:border-hospital-teal transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-hospital-navy hover:bg-hospital-blue transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Strip - Competition Winning Tool */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1-Click Role Switcher (Evaluation Demo)
              </span>
              <span className="text-[11px] text-hospital-teal font-semibold">
                Instant Access
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Click any staff role below to instantly load their dedicated workspace without typing credentials:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {demoAccounts.map((acc, idx) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickDemo(acc.user, acc.path)}
                    className={`p-2.5 rounded-xl border text-left transition hover:scale-[1.02] flex flex-col justify-between ${acc.color}`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <div>
                      <div className="font-bold text-xs leading-tight">{acc.role}</div>
                      <div className="text-[10px] opacity-75">{acc.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-slate-300 hover:text-white transition">
            ← Back to Oda Roba Hospital Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

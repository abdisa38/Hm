import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserPlus,
  Activity,
  Stethoscope,
  Microscope,
  Pill,
  CreditCard,
  LogOut,
  ChevronDown,
  Clock,
  Tv,
  Globe,
  FileText,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function StaffLayout() {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = async (username, path) => {
    setDemoMenuOpen(false);
    const res = await demoLogin(username);
    if (res.success) {
      navigate(path);
    }
  };

  const navLinks = [
    { label: 'Executive Dashboard', path: '/director', roles: ['DIRECTOR', 'ADMIN'], icon: LayoutDashboard },
    { label: 'Reception & Registry', path: '/reception', roles: ['RECEPTIONIST', 'DIRECTOR', 'ADMIN'], icon: UserPlus },
    { label: 'Nurse Triage Station', path: '/triage', roles: ['NURSE', 'DOCTOR', 'DIRECTOR', 'ADMIN'], icon: Activity },
    { label: 'Doctor OPD Workspace', path: '/doctor', roles: ['DOCTOR', 'DIRECTOR', 'ADMIN'], icon: Stethoscope },
    { label: 'Clinical Laboratory', path: '/laboratory', roles: ['LAB_TECH', 'DOCTOR', 'DIRECTOR', 'ADMIN'], icon: Microscope },
    { label: 'Pharmacy & Dispensing', path: '/pharmacy', roles: ['PHARMACIST', 'DIRECTOR', 'ADMIN'], icon: Pill },
    { label: 'Billing & Cashier', path: '/billing', roles: ['CASHIER', 'DIRECTOR', 'ADMIN'], icon: CreditCard },
  ];

  const currentRole = user?.role || 'DOCTOR';

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-hospital-navy text-white flex flex-col flex-shrink-0 z-20 shadow-xl">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-hospital-blue/50 bg-hospital-navy/95">
          <div className="w-9 h-9 rounded-xl bg-hospital-teal flex items-center justify-center font-bold text-white text-base shadow">
            ORH
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight truncate">
              ODA ROBA HOSPITAL
            </h1>
            <span className="text-[10px] text-teal-300 font-semibold tracking-wider uppercase block truncate">
              ORHIMS System
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Hospital Workspaces
          </div>
          {navLinks.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isAuthorized = item.roles.includes(currentRole);

            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-hospital-teal text-white shadow-md shadow-teal-900/30 font-semibold'
                    : isAuthorized
                    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'text-slate-500 hover:bg-white/5 opacity-70'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-teal-400'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Live Display & Portals
          </div>
          <Link
            to="/queue-display"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>Waiting Room TV Board</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Public Hospital Portal</span>
          </Link>
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-hospital-blue/40 bg-black/10">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-teal-300 truncate">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-mono">
              <Clock className="w-3.5 h-3.5 text-hospital-teal" />
              <span>Bale Robe Time: {time}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Oda Roba General Hospital • Bale Robe, Oromia</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Role Switcher Dropdown (Evaluation demo accelerator) */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-hospital-teal" />
                <span className="hidden sm:inline">Role Switcher:</span>
                <span className="font-bold underline">{user?.role}</span>
                <ChevronDown className="w-3 h-3 text-teal-700" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Role
                  </div>
                  <button
                    onClick={() => handleSwitchRole('director', '/director')}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Medical Director</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 rounded">DIRECTOR</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole('reception', '/reception')}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Receptionist</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 rounded">RECEPTION</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole('nurse', '/triage')}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Triage Nurse</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 rounded">NURSE</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole('doctor', '/doctor')}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Physician / Doctor</span>
                    <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 rounded">DOCTOR</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole('lab', '/laboratory')}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Lab Technician</span>
                    <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 rounded">LAB_TECH</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole('pharmacy', '/pharmacy')}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Pharmacist</span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 rounded">PHARMACY</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole('cashier', '/billing')}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Cashier & Billing</span>
                    <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 rounded">CASHIER</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

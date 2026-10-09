import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  PhoneCall,
  Clock,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Stethoscope,
  Microscope,
  Pill,
  Activity,
  ArrowRight,
  CheckCircle2,
  Tv,
  LogIn,
} from 'lucide-react';

export default function LandingPage() {
  const [appointmentSent, setAppointmentSent] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: 'General OPD',
    date: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setAppointmentSent(true);
    setTimeout(() => {
      setAppointmentSent(false);
      setFormData({ fullName: '', phone: '', department: 'General OPD', date: '', notes: '' });
    }, 4000);
  };

  const departments = [
    {
      title: 'Emergency & Trauma Care',
      desc: '24/7 Level 1 triage, resuscitation units, and rapid trauma surgical team.',
      icon: Activity,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Internal Medicine',
      desc: 'Comprehensive management of adult chronic diseases, hypertension, and infectious illnesses.',
      icon: Stethoscope,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Obstetrics & Gynecology',
      desc: 'Maternal health, safe delivery suites, prenatal diagnostics, and pediatric care.',
      icon: HeartPulse,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'General & Orthopedic Surgery',
      desc: 'Advanced surgical theaters for trauma reconstruction, elective and emergency surgery.',
      icon: ShieldCheck,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Clinical Laboratory',
      desc: 'Automated hematology, microbiology, parasitology, and rapid chemistry diagnostics.',
      icon: Microscope,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: '24-Hour Hospital Pharmacy',
      desc: 'Direct EPSS-linked pharmaceutical supply, temperature-controlled drug storage.',
      icon: Pill,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 24/7 Emergency Header Strip */}
      <div className="bg-hospital-navy text-white text-xs sm:text-sm py-2 px-4 border-b border-hospital-blue/40">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold animate-pulse">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span> 24/7 EMERGENCY HOTLINE:
            </span>
            <span className="font-mono font-medium">+251 22 665 0123 / Emergency 907</span>
          </div>
          <div className="flex items-center gap-6 text-slate-300 hidden md:flex">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-hospital-teal" /> Bale Robe, Oromia, Ethiopia
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-hospital-teal" /> OPD: 8:00 AM - 5:30 PM | Emergency 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-hospital-navy via-hospital-blue to-hospital-teal flex items-center justify-center shadow-md shadow-teal-500/20 text-white font-bold text-xl">
              ORH
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-hospital-navy leading-none">
                ODA ROBA
              </h1>
              <span className="text-xs font-semibold tracking-wider text-hospital-teal uppercase">
                General Hospital • Bale Robe
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-slate-600">
            <a href="#about" className="hover:text-hospital-teal transition-colors">About Hospital</a>
            <a href="#departments" className="hover:text-hospital-teal transition-colors">Departments</a>
            <a href="#services" className="hover:text-hospital-teal transition-colors">Clinical Services</a>
            <a href="#appointment" className="hover:text-hospital-teal transition-colors">Appointments</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/queue-display"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Public Waiting Room Screen"
            >
              <Tv className="w-4 h-4 text-hospital-teal" />
              <span className="hidden sm:inline">Waiting Queue Screen</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-hospital-blue hover:bg-hospital-navy text-white shadow-md shadow-blue-900/20 transition-all hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-hospital-navy via-hospital-blue to-[#0A3444] text-white pt-20 pb-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-hospital-teal text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-hospital-teal"></span>
                Digital Healthcare Excellence for Bale & Southeast Oromia
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Modern Care. <br />
                Compassionate Hearts. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">
                  Fully Digitized Workflow.
                </span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Oda Roba General Hospital provides 24-hour medical, surgical, maternal, and emergency care. 
                Equipped with our state-of-the-art Electronic Health & Management System (ORHIMS), 
                we eliminate waiting room confusion and connect diagnosis, laboratory, pharmacy, and billing seamlessly.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="#appointment"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-hospital-teal hover:bg-emerald-500 text-white shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book Consultation
                </a>
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition flex items-center gap-2"
                >
                  Enter Staff Workspace <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Verified Trust Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/15">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">250+</div>
                  <div className="text-xs text-slate-300 font-medium">Inpatient Beds</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">40+</div>
                  <div className="text-xs text-slate-300 font-medium">Physicians & Surgeons</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">24/7</div>
                  <div className="text-xs text-slate-300 font-medium">Digital EMR Care</div>
                </div>
              </div>
            </div>

            {/* Quick Online Booking Card */}
            <div className="lg:col-span-5" id="appointment">
              <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-hospital-navy">Book Patient Appointment</h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                    Online OPD
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Schedule an outpatient consultation with our medical specialists in Bale Robe.
                </p>

                {appointmentSent ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-emerald-900">Appointment Request Received!</h4>
                    <p className="text-xs text-emerald-700">
                      Our reception desk has registered your slot. An SMS confirmation will be sent shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Patient Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hana Mohammed Ibrahim"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-hospital-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number (Ethiopian)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0911 234 567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-hospital-teal"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Department
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-hospital-teal"
                        >
                          <option>General OPD</option>
                          <option>Internal Medicine</option>
                          <option>Pediatrics</option>
                          <option>Obstetrics & Gyn</option>
                          <option>General Surgery</option>
                          <option>Orthopedics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-hospital-teal"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Symptoms / Brief Note
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Chief complaint or symptoms..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-hospital-teal"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg font-semibold text-sm bg-hospital-navy hover:bg-hospital-blue text-white shadow-md transition"
                    >
                      Confirm Appointment Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Departments Section */}
      <section className="py-20 bg-white" id="departments">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-hospital-teal">
              Clinical Specializations
            </span>
            <h3 className="text-3xl font-extrabold text-hospital-navy">
              Comprehensive Hospital Departments
            </h3>
            <p className="text-sm text-slate-600">
              Delivering high-caliber specialized diagnosis, medical therapeutics, and surgical interventions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, idx) => {
              const Icon = dept.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200/80 hover:border-hospital-teal/50 hover:shadow-xl hover:shadow-teal-900/5 transition-all group bg-slate-50/50"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${dept.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 group-hover:text-hospital-navy transition mb-2">
                    {dept.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {dept.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Unified Digital Workflow Feature Callout */}
      <section className="py-16 bg-hospital-surface border-y border-slate-200" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-hospital-navy to-hospital-blue rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-semibold">
                ORHIMS Electronic Medical Records
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold">
                Paperless, Connected Healthcare for Bale Robe
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                From the moment a patient registers at the front desk, all vitals, physician consultation notes,
                laboratory findings, pharmaceutical prescriptions, and billing receipts reside in one secure record. 
                No lost paper slips. No redundant data entry.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-white text-hospital-navy hover:bg-slate-100 transition shadow"
                >
                  Launch Management System
                </Link>
                <Link
                  to="/queue-display"
                  className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
                >
                  View Waiting Room Board
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-hospital-teal flex items-center justify-center text-white text-xs">
                ORH
              </div>
              Oda Roba General Hospital
            </div>
            <p className="text-slate-400">
              Serving Bale Robe, Goba, Madda Walabu, and the surrounding zones of Oromia with dignity and state-of-the-art medical systems.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-3">Quick Navigation</h5>
            <ul className="space-y-2">
              <li><a href="#about" className="hover:text-white transition">About the Facility</a></li>
              <li><a href="#departments" className="hover:text-white transition">Departments & Services</a></li>
              <li><Link to="/queue-display" className="hover:text-white transition">Live OPD Queue Board</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Staff Management Portal</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-3">Hospital Leadership</h5>
            <p className="text-slate-400 mb-2">Medical Director: Dr. Sisay Kebede</p>
            <p className="text-slate-400 mb-2">Head of Clinical Services: Dr. Ahmed Mohammed</p>
            <p className="text-slate-400">Health Informatics: ORHIMS Enterprise Suite</p>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-3">Contact & Location</h5>
            <p className="text-slate-400 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-hospital-teal" /> Bale Robe, Kebele 02, Oromia
            </p>
            <p className="text-slate-400 mb-1 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-hospital-teal" /> Reception: +251 22 665 0411
            </p>
            <p className="text-slate-400 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" /> Emergency: +251 22 665 0123
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800 text-center text-slate-500">
          © {new Date().getFullYear()} Oda Roba General Hospital Information & Management System (ORHIMS). Developed by Abdisa Awel.
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Tv, Volume2, Building2, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LiveQueueDisplay() {
  const [queue, setQueue] = useState([]);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  const fetchLiveQueue = async () => {
    try {
      const res = await api.get('/encounters/live-queue');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 8000); // Poll every 8s
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const nowServing = queue.filter(
    (q) => q.status === 'IN_CONSULTATION' || q.status === 'WAITING_DOCTOR'
  );
  const waitingTriage = queue.filter((q) => q.status === 'WAITING_TRIAGE');
  const otherQueues = queue.filter(
    (q) => q.status !== 'IN_CONSULTATION' && q.status !== 'WAITING_DOCTOR' && q.status !== 'WAITING_TRIAGE'
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans select-none">
      {/* Top TV Banner */}
      <header className="h-20 bg-hospital-navy px-8 flex items-center justify-between border-b-2 border-hospital-teal shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-hospital-teal flex items-center justify-center font-extrabold text-2xl text-white shadow-lg shadow-teal-500/30">
            ORH
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">
              ODA ROBA GENERAL HOSPITAL
            </h1>
            <span className="text-xs font-bold tracking-widest text-teal-300 uppercase">
              Outpatient & Emergency Live Queue Display • Bale Robe
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-teal-300">{time}</div>
            <div className="text-[11px] text-slate-300">Ethiopian Standard Time</div>
          </div>
          <Link
            to="/"
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-slate-300 transition"
          >
            Exit TV Mode
          </Link>
        </div>
      </header>

      {/* Main Board Grid */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: NOW CALLING / SERVING IN CLINICAL ROOMS */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Volume2 className="w-6 h-6 animate-pulse text-teal-300" />
              Now Serving in Consultation Rooms
            </h2>
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold">
              Proceed When Called
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {nowServing.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center p-16 rounded-3xl bg-slate-800/50 border border-slate-700/60 text-slate-400 space-y-3">
                <CheckCircle2 className="w-16 h-16 text-teal-500/40" />
                <div className="text-xl font-bold text-slate-300">No active calls right now</div>
                <div className="text-sm">Please remain seated in the waiting lobby.</div>
              </div>
            ) : (
              nowServing.slice(0, 4).map((ticket, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl p-6 bg-gradient-to-br from-hospital-navy to-slate-800 border-2 border-teal-500/60 shadow-2xl flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                      Ticket Number
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-400 text-slate-900 animate-pulse">
                      NOW CALLING
                    </span>
                  </div>

                  <div className="py-4 text-center">
                    <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow">
                      {ticket.queueNumber}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700/80 flex justify-between items-center text-xs">
                    <div>
                      <div className="text-slate-400">Department</div>
                      <div className="font-bold text-teal-300 text-sm">{ticket.department}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400">Room Assignment</div>
                      <div className="font-bold text-white text-sm">
                        {ticket.assignedDoctor?.name ? `Dr. ${ticket.assignedDoctor.name.split(' ')[0]}` : 'Consultation Room 2'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: UPCOMING WAITING QUEUES */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <h2 className="text-lg font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            Upcoming Queue
          </h2>

          <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-6 flex-1 space-y-4">
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
                Waiting at Triage & Vitals:
              </div>
              <div className="flex flex-wrap gap-2">
                {waitingTriage.length === 0 ? (
                  <span className="text-xs text-slate-400">No triage queue</span>
                ) : (
                  waitingTriage.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 font-mono font-bold text-sm text-white border border-slate-600"
                    >
                      {t.queueNumber}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                In Diagnostics / Pharmacy / Cashier:
              </div>
              <div className="flex flex-wrap gap-2">
                {otherQueues.length === 0 ? (
                  <span className="text-xs text-slate-400">Queue moving smoothly</span>
                ) : (
                  otherQueues.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-700/80 font-mono text-xs text-slate-300 border border-slate-600"
                    >
                      {t.queueNumber}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
              <div className="font-bold mb-1">📢 Patient Notice:</div>
              Please keep your issued ticket card with you until final discharge. Free Wi-Fi is available in the main hospital lobby.
            </div>
          </div>
        </div>
      </main>

      {/* Bottom News Ticker */}
      <footer className="h-12 bg-black/60 border-t border-slate-800 px-8 flex items-center justify-between text-xs text-slate-400">
        <div className="truncate">
          🏥 Oda Roba General Hospital • Bale Robe, Oromia • Emergency Hotline: +251 22 665 0123 • Open 24 Hours
        </div>
        <div className="font-mono text-teal-400 font-semibold hidden sm:block">
          ORHIMS DIGITAL HEALTHCARE ENGINE
        </div>
      </footer>
    </div>
  );
}

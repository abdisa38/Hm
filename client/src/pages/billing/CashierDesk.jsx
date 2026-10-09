import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
  CreditCard,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  Coins,
  QrCode,
  Building,
  ArrowRight,
} from 'lucide-react';

export default function CashierDesk() {
  const [encounters, setEncounters] = useState([]);
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [billEstimate, setBillEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paidInvoice, setPaidInvoice] = useState(null);

  // Settlement Form State
  const [paymentMethod, setPaymentMethod] = useState('TELEBIRR');
  const [paymentRef, setPaymentRef] = useState('');
  const [discount, setDiscount] = useState(0);

  const fetchBillingQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/encounters?status=BILLING_PENDING');
      setEncounters(res.data);
      if (res.data.length > 0 && !selectedEncounter) {
        loadEstimate(res.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadEstimate = async (enc) => {
    setSelectedEncounter(enc);
    setFeedback(null);
    try {
      const res = await api.get(`/billing/estimate/${enc._id}`);
      setBillEstimate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBillingQueue();
    const interval = setInterval(fetchBillingQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!billEstimate || !selectedEncounter) return;

    try {
      // 1. Create official invoice
      const invRes = await api.post('/billing/invoice', {
        encounterId: selectedEncounter._id,
        patientId: selectedEncounter.patient?._id,
        items: billEstimate.items,
        discount: Number(discount) || 0,
      });

      // 2. Settle payment immediately
      const payRes = await api.post(`/billing/invoices/${invRes.data._id}/pay`, {
        paymentMethod,
        paymentReference: paymentRef || 'CASH-REC',
        paidAmount: invRes.data.totalAmount,
      });

      setPaidInvoice(payRes.data.invoice);
      setShowReceiptModal(true);
      setFeedback({
        type: 'success',
        text: `Payment of ${payRes.data.invoice.paidAmount} ETB received! Visit completed successfully.`,
      });

      setSelectedEncounter(null);
      setBillEstimate(null);
      setPaymentRef('');
      fetchBillingQueue();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Payment settlement failed.',
      });
    }
  };

  const calculatedTotal = billEstimate
    ? Math.max(0, billEstimate.subtotal - (Number(discount) || 0))
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-hospital-navy flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-rose-600" /> Revenue & Cashier Settlement Desk
          </h2>
          <p className="text-xs text-slate-500">
            Automated visit billing, electronic receipts, Telebirr & CBE Birr verification.
          </p>
        </div>
        <div>
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
            Pending Payment: {encounters.length}
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue for Billing */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Pending Invoices Queue
            </h3>
            <button onClick={fetchBillingQueue} className="text-[11px] text-hospital-teal font-semibold hover:underline">
              Refresh
            </button>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading billing queue...</div>
            ) : encounters.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No unpaid visits pending at the cashier.
              </div>
            ) : (
              encounters.map((enc) => {
                const isSelected = selectedEncounter?._id === enc._id;
                return (
                  <div
                    key={enc._id}
                    onClick={() => loadEstimate(enc)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-xs text-rose-700">
                        {enc.queueNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        PENDING PAYMENT
                      </span>
                    </div>

                    <div className="mt-1 font-bold text-xs text-slate-800">
                      {enc.patient?.firstName} {enc.patient?.fatherName}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                      <span>{enc.department}</span>
                      <span className="font-mono">{enc.patient?.patientId}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Itemized Bill Calculation & Payment */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {billEstimate && selectedEncounter ? (
            <form onSubmit={handleSettle} className="space-y-6">
              {/* Patient Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Billing Encounter</div>
                  <div className="text-base font-extrabold text-hospital-navy">
                    {selectedEncounter.patient?.firstName} {selectedEncounter.patient?.fatherName}
                  </div>
                  <div className="text-xs text-slate-500">
                    ID: <span className="font-mono font-semibold text-hospital-blue">{selectedEncounter.patient?.patientId}</span> •{' '}
                    Queue: <span className="font-mono font-bold">{selectedEncounter.queueNumber}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Bill Payable</div>
                  <div className="font-mono font-black text-2xl text-rose-600">
                    {calculatedTotal.toLocaleString()} ETB
                  </div>
                </div>
              </div>

              {/* Itemized Line Items */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-hospital-navy uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-hospital-teal" /> Consolidated Service & Medication Charges
                </h4>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                        <th className="py-2.5 px-3">Charge Description</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate</th>
                        <th className="py-2.5 px-3 text-right">Amount (ETB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billEstimate.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{item.description}</td>
                          <td className="py-2.5 px-3 text-slate-500">{item.category}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">{item.unitPrice}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                            {item.totalPrice} ETB
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan="4" className="py-2.5 px-3 text-right text-slate-700">
                          Subtotal Amount:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                          {billEstimate.subtotal} ETB
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Settlement Method */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="text-xs font-bold text-hospital-navy">Payment Method & Settlement</div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['TELEBIRR', 'CBE_BIRR', 'CASH', 'INSURANCE_CBHI'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        paymentMethod === m
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {m === 'TELEBIRR' && <QrCode className="w-3.5 h-3.5" />}
                      {m === 'CBE_BIRR' && <Building className="w-3.5 h-3.5" />}
                      {m === 'CASH' && <Coins className="w-3.5 h-3.5" />}
                      <span>{m.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Transaction Slip / Telebirr Reference #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TB-892147102 or CBE-4819"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Waiver / Discount / CBHI Subsidy (ETB)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Settlement Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-lg flex items-center gap-2 transition"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Settle {calculatedTotal.toLocaleString()} ETB & Complete Patient Visit</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <CreditCard className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">No Encounter Selected</div>
              <div className="text-xs">Select a patient encounter from the left list to review bill items.</div>
            </div>
          )}
        </div>
      </div>

      {/* Official Receipt Printable Modal */}
      {showReceiptModal && paidInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Receipt</span>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h3 className="font-extrabold text-sm text-hospital-navy uppercase">
                  Oda Roba General Hospital
                </h3>
                <p className="text-[10px] text-slate-500">Bale Robe, Oromia, Ethiopia • Revenue Section</p>
                <div className="mt-2 font-mono font-bold text-slate-800">
                  INVOICE #{paidInvoice.invoiceNumber}
                </div>
                <div className="text-[10px] text-slate-400">
                  Date: {new Date(paidInvoice.paidAt || Date.now()).toLocaleString()}
                </div>
              </div>

              <div className="space-y-1.5 divide-y divide-slate-100">
                {paidInvoice.items?.map((item, idx) => (
                  <div key={idx} className="pt-1.5 flex justify-between">
                    <span className="text-slate-700">{item.description}</span>
                    <span className="font-mono font-semibold">{item.totalPrice} ETB</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-300 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL PAID:</span>
                  <span className="font-mono text-emerald-700">{paidInvoice.paidAmount} ETB</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Payment Method:</span>
                  <span className="font-semibold">{paidInvoice.paymentMethod}</span>
                </div>
                {paidInvoice.paymentReference && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Reference / Slip:</span>
                    <span className="font-mono">{paidInvoice.paymentReference}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400 italic">
                Thank you for choosing Oda Roba General Hospital.
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-hospital-navy text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

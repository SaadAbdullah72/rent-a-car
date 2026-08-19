import React, { useState } from 'react';
import { X, DollarSign, FileText, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Investor, Car as CarType, InvestorPayout, CompanySettings } from '../../types';
import { PdfGenerator } from '../../services/pdfGenerator';

interface InvestorPayoutModalProps {
  isOpen: boolean;
  investor: Investor | null;
  cars: CarType[];
  settings: CompanySettings;
  onClose: () => void;
  onSavePayout: (payout: Partial<InvestorPayout>) => void;
}

export const InvestorPayoutModal: React.FC<InvestorPayoutModalProps> = ({
  isOpen,
  investor,
  cars,
  settings,
  onClose,
  onSavePayout
}) => {
  if (!isOpen || !investor) return null;

  const invCars = cars.filter(c => c.investorId === investor.id);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodMonth, setPeriodMonth] = useState(currentMonth);
  const [amount, setAmount] = useState<number>(investor.payoutAmount || 50000);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Online'>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState(`Monthly return for ${invCars.map(c => c.plateNumber).join(', ')}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payout: Partial<InvestorPayout> = {
      investorId: investor.id,
      payoutDate,
      periodMonth,
      amount: Number(amount),
      paymentMethod,
      referenceNumber: referenceNumber.trim(),
      notes: notes.trim()
    };

    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}

    onSavePayout(payout);
  };

  const handlePrintVoucher = () => {
    const tempPayout: InvestorPayout = {
      id: 'preview',
      investorId: investor.id,
      payoutDate,
      periodMonth,
      amount: Number(amount),
      paymentMethod,
      referenceNumber,
      notes,
      createdAt: new Date().toISOString()
    };

    PdfGenerator.generateInvestorPayoutVoucher(tempPayout, investor, invCars, settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg my-8 bg-slateDark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-950/60 to-slateDark-850 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Record Investor Payout Voucher</h2>
              <p className="text-xs text-slate-400">
                Issue payment to <strong className="text-white">{investor.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Investor Summary Card */}
        <div className="p-4 bg-slateDark-950/60 border-b border-slate-800 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">CNIC:</span>
            <span className="font-mono text-white">{investor.cnic}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Bank Details:</span>
            <span className="text-slate-200 font-mono">{investor.bankDetails.bankName} - {investor.bankDetails.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Linked Vehicles:</span>
            <span className="text-brand-300 font-semibold">{invCars.map(c => c.plateNumber).join(', ') || 'None'}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payout Month / Period *</label>
              <input
                type="text"
                required
                value={periodMonth}
                onChange={(e) => setPeriodMonth(e.target.value)}
                placeholder="e.g. August 2026"
                className="w-full custom-input"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={payoutDate}
                onChange={(e) => setPayoutDate(e.target.value)}
                className="w-full custom-input"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amount Paid (PKR) *</label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full custom-input font-bold text-emerald-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full custom-input"
              >
                <option value="Bank Transfer">Bank Transfer (Online Wire)</option>
                <option value="Cash">Cash Voucher</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Online">JazzCash / EasyPaisa / Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-slate-300 mb-1">Transaction Ref / Cheque # (Optional)</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. FT-2026-998811 or Cheque # 4521"
                className="w-full custom-input font-mono uppercase"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-300 mb-1">Notes / Narration</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Full settlement of monthly agreed return"
                className="w-full custom-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handlePrintVoucher}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition"
            >
              <FileText size={15} /> Print Voucher (PDF)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-slate-400 hover:text-white transition font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-950/40 flex items-center gap-1.5 transition"
              >
                <CheckCircle size={15} /> Save Payout
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

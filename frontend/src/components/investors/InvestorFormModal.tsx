import React, { useState, useEffect } from 'react';
import { X, Users, Save, AlertTriangle } from 'lucide-react';
import { Investor, PayoutType, BankDetails } from '../../types';

interface InvestorFormModalProps {
  isOpen: boolean;
  editingInvestor: Investor | null;
  existingInvestors: Investor[];
  onClose: () => void;
  onSave: (investor: Partial<Investor>) => void;
}

export const InvestorFormModal: React.FC<InvestorFormModalProps> = ({
  isOpen,
  editingInvestor,
  existingInvestors,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('Meezan Bank Ltd');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [agreementStartDate, setAgreementStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [agreementEndDate, setAgreementEndDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  );
  const [payoutType, setPayoutType] = useState<PayoutType>('FIXED_MONTHLY');
  const [payoutAmount, setPayoutAmount] = useState<number>(75000);
  const [payoutDueDay, setPayoutDueDay] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingInvestor) {
      setName(editingInvestor.name);
      setCnic(editingInvestor.cnic);
      setPhone(editingInvestor.phone);
      setAltPhone(editingInvestor.altPhone || '');
      setAddress(editingInvestor.address);
      setBankName(editingInvestor.bankDetails?.bankName || '');
      setAccountTitle(editingInvestor.bankDetails?.accountTitle || '');
      setAccountNumber(editingInvestor.bankDetails?.accountNumber || '');
      setIban(editingInvestor.bankDetails?.iban || '');
      setAgreementStartDate(editingInvestor.agreementStartDate);
      setAgreementEndDate(editingInvestor.agreementEndDate);
      setPayoutType(editingInvestor.payoutType);
      setPayoutAmount(editingInvestor.payoutAmount);
      setPayoutDueDay(editingInvestor.payoutDueDay);
      setNotes(editingInvestor.notes || '');
      setError('');
    } else {
      setName('');
      setCnic('');
      setPhone('');
      setAltPhone('');
      setAddress('');
      setBankName('Meezan Bank Ltd');
      setAccountTitle('');
      setAccountNumber('');
      setIban('');
      setAgreementStartDate(new Date().toISOString().split('T')[0]);
      setAgreementEndDate(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
      setPayoutType('FIXED_MONTHLY');
      setPayoutAmount(75000);
      setPayoutDueDay(5);
      setNotes('');
      setError('');
    }
  }, [editingInvestor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedCnic = cnic.trim();

    // Check duplicate CNIC
    const isDuplicate = existingInvestors.some(
      i => i.cnic.trim() === formattedCnic && (!editingInvestor || i.id !== editingInvestor.id)
    );

    if (isDuplicate) {
      setError(`An Investor with CNIC "${formattedCnic}" already exists! Every investor must have a unique CNIC.`);
      return;
    }

    const bankDetails: BankDetails = {
      bankName: bankName.trim(),
      accountTitle: accountTitle.trim() || name.trim(),
      accountNumber: accountNumber.trim(),
      iban: iban.trim()
    };

    onSave({
      id: editingInvestor ? editingInvestor.id : undefined,
      name: name.trim(),
      cnic: formattedCnic,
      phone: phone.trim(),
      altPhone: altPhone.trim(),
      address: address.trim(),
      bankDetails,
      agreementStartDate,
      agreementEndDate,
      payoutType,
      payoutAmount: Number(payoutAmount),
      payoutDueDay: Number(payoutDueDay),
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl my-8 bg-slateDark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slateDark-850 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingInvestor ? `Edit Investor: ${editingInvestor.name}` : 'Register New Vehicle Investor'}
              </h2>
              <p className="text-xs text-slate-400">
                Enter unique CNIC, personal details, agreement duration, and agreed monthly return terms.
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

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chaudhry Tariq Mahmood"
                className="w-full custom-input"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                National ID / CNIC (Unique) *
              </label>
              <input
                type="text"
                required
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="35202-1234567-1"
                className="w-full custom-input font-mono font-bold text-amber-300"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mobile Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full custom-input font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Alternate Phone (Optional)</label>
              <input
                type="text"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="0321-7654321"
                className="w-full custom-input font-mono"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #, Street, Sector, City"
                className="w-full custom-input"
              />
            </div>

          </div>

          {/* Agreement Terms */}
          <div className="p-4 bg-slateDark-850 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
              Agreement Duration & Return Structure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Agreement Start Date *</label>
                <input
                  type="date"
                  required
                  value={agreementStartDate}
                  onChange={(e) => setAgreementStartDate(e.target.value)}
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Agreement End Date (Duration) *</label>
                <input
                  type="date"
                  required
                  value={agreementEndDate}
                  onChange={(e) => setAgreementEndDate(e.target.value)}
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Payout Return Model *</label>
                <select
                  value={payoutType}
                  onChange={(e) => setPayoutType(e.target.value as PayoutType)}
                  className="w-full custom-input"
                >
                  <option value="FIXED_MONTHLY">Fixed Monthly Return (PKR / Month)</option>
                  <option value="PERCENTAGE">Profit Share Percentage (%)</option>
                  <option value="PER_DAY">Daily Fixed Return (PKR / Day)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Agreed Return Amount / Value *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  placeholder={payoutType === 'PERCENTAGE' ? 'e.g. 40 (for 40%)' : 'e.g. 85000'}
                  className="w-full custom-input font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Monthly Payout Due Day (1 - 31) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={payoutDueDay}
                  onChange={(e) => setPayoutDueDay(Number(e.target.value))}
                  className="w-full custom-input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Special Notes / Terms</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Oil change paid by investor, body maintenance by company"
                  className="w-full custom-input"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="p-4 bg-slateDark-850 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
              Bank Account Details (for Payout Transfers)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Meezan Bank, HBL, Bank Alfalah"
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Account Title</label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder={name || 'Account Holder Name'}
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="02010103456789"
                  className="w-full custom-input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">IBAN (Optional)</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="PK45MEZN0002010103456789"
                  className="w-full custom-input font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-950/40 flex items-center gap-2 transition"
            >
              <Save size={16} />
              {editingInvestor ? 'Update Investor' : 'Register Investor'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Car, 
  DollarSign, 
  Edit3, 
  Trash2, 
  Building
} from 'lucide-react';
import { Investor, Car as CarType, InvestorPayout, CompanySettings } from '../../types';

interface InvestorListViewProps {
  investors: Investor[];
  cars: CarType[];
  payouts: InvestorPayout[];
  settings: CompanySettings;
  onOpenAddInvestor: () => void;
  onOpenEditInvestor: (investor: Investor) => void;
  onOpenPayoutModal: (investor: Investor) => void;
  onDeleteInvestor: (investor: Investor) => void;
  onSelectCar: (car: CarType) => void;
}

export const InvestorListView: React.FC<InvestorListViewProps> = ({
  investors,
  cars,
  payouts,
  settings,
  onOpenAddInvestor,
  onOpenEditInvestor,
  onOpenPayoutModal,
  onDeleteInvestor,
  onSelectCar
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const filteredInvestors = useMemo(() => {
    return investors.filter(inv => {
      const q = searchTerm.toLowerCase().trim();
      return (
        inv.name.toLowerCase().includes(q) ||
        inv.cnic.toLowerCase().includes(q) ||
        inv.phone.toLowerCase().includes(q)
      );
    });
  }, [investors, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-serif">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-serif">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 font-serif">
            <Users className="text-slate-800" />
            Vehicle Investors & Partner Portfolios (انویسٹرز)
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-serif">
            Manage multi-car investors, agreement durations, agreed monthly returns, and payout ledgers.
          </p>
        </div>

        <button
          onClick={onOpenAddInvestor}
          className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-2 transition active:scale-95 self-start sm:self-auto font-serif"
        >
          <Plus size={16} /> + Register New Investor
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-3 text-xs shadow-sm font-serif">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Investor by Name, CNIC (e.g. 35202-xxxxxxx-x) or Phone..."
            className="w-full pl-10 custom-input font-serif"
          />
        </div>
      </div>

      {/* Investors Cards Grid */}
      {filteredInvestors.length === 0 ? (
        <div className="bg-white border border-slate-200 py-16 text-center text-slate-500 text-xs rounded-xl font-serif font-bold">
          No investors found. Click "+ Register New Investor" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-serif">
          {filteredInvestors.map(inv => {
            const invCars = cars.filter(c => c.investorId === inv.id);
            const invPayouts = payouts.filter(p => p.investorId === inv.id);
            const totalPaidOut = invPayouts.reduce((sum, p) => sum + p.amount, 0);
            
            const isPaidThisMonth = invPayouts.some(p => p.periodMonth.toLowerCase().includes(currentMonthName.toLowerCase()));

            return (
              <div 
                key={inv.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-400 transition flex flex-col justify-between shadow-sm font-serif"
              >
                
                {/* Investor Header */}
                <div className="p-5 bg-[#faf9f5] border-b border-slate-200 flex items-start justify-between gap-3 font-serif">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 font-serif">{inv.name}</h3>
                      {isPaidThisMonth ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold font-serif">
                          Paid for {currentMonthName}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold font-serif">
                          Payout Due: {inv.payoutDueDay}th
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-serif">
                      <span>CNIC: <strong className="text-slate-900 font-serif">{inv.cnic}</strong></span>
                      <span>&bull;</span>
                      <span className="text-slate-900 flex items-center gap-1 font-serif">
                        <Phone size={12} /> {inv.phone}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-serif">
                    <div className="text-[10px] text-slate-600 font-bold uppercase font-serif">Agreed Return</div>
                    <div className="text-sm font-bold text-amber-800 font-serif">
                      {inv.payoutType === 'FIXED_MONTHLY' 
                        ? `${settings.currency} ${inv.payoutAmount.toLocaleString()} / mo`
                        : `${inv.payoutAmount}% Profit Share`
                      }
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 text-xs font-serif">
                  
                  {/* Agreement Terms */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-[#faf9f5] rounded-lg border border-slate-200 font-serif">
                    <div>
                      <span className="text-slate-600 text-[11px] block font-serif">Agreement Period</span>
                      <span className="font-bold text-slate-900 font-serif">
                        {new Date(inv.agreementStartDate).toLocaleDateString()} &rarr; {new Date(inv.agreementEndDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 text-[11px] block font-serif">Total Lifetime Payouts</span>
                      <span className="font-bold text-emerald-800 font-serif">
                        {settings.currency} {totalPaidOut.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Bank Account */}
                  <div className="p-3 bg-[#faf9f5] rounded-lg border border-slate-200 flex items-center gap-3 font-serif">
                    <Building size={18} className="text-slate-500 shrink-0" />
                    <div className="text-[11px] font-serif">
                      <div className="text-slate-600 font-serif">Bank Account for Wire Transfers:</div>
                      <div className="font-bold text-slate-900 font-serif">
                        {inv.bankDetails.bankName} - {inv.bankDetails.accountNumber} ({inv.bankDetails.accountTitle})
                      </div>
                    </div>
                  </div>

                  {/* Associated Fleet Cars */}
                  <div className="font-serif">
                    <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between font-serif">
                      <span className="flex items-center gap-1.5 font-serif">
                        <Car size={14} className="text-slate-700" />
                        Allocated Vehicles ({invCars.length})
                      </span>
                    </div>

                    {invCars.length === 0 ? (
                      <div className="p-2.5 bg-[#faf9f5] text-slate-500 rounded-lg text-center text-[11px] font-serif">
                        No vehicles currently mapped to this investor.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 font-serif">
                        {invCars.map(car => (
                          <button
                            key={car.id}
                            onClick={() => onSelectCar(car)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-[11px] text-slate-900 flex items-center gap-1.5 transition font-serif font-bold"
                          >
                            <span className="font-bold text-slate-900 font-serif">{car.plateNumber}</span>
                            <span className="text-slate-600 font-serif">({car.model})</span>
                            <span className={`w-2 h-2 rounded-full ${
                              car.status === 'AVAILABLE' ? 'bg-emerald-600' : car.status === 'ON_RENT' ? 'bg-blue-600' : 'bg-amber-600'
                            }`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-[#faf9f5] border-t border-slate-200 flex items-center justify-between gap-2 text-xs font-serif">
                  <div className="flex items-center gap-1 font-serif">
                    <button
                      onClick={() => onOpenEditInvestor(inv)}
                      className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                      title="Edit Investor"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => onDeleteInvestor(inv)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-200 rounded-md transition"
                      title="Delete Investor"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenPayoutModal(inv)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1.5 transition font-serif"
                  >
                    <DollarSign size={14} /> Record Payout Voucher
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};


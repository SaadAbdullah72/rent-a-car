import React, { useState } from 'react';
import { 
  CalendarClock, 
  Car, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  Wrench, 
  Users, 
  ArrowRight
} from 'lucide-react';
import { Booking, Car as CarType, Client, CompanySettings, Investor, InvestorPayout, MaintenanceRecord } from '../../types';

interface TodaysAgendaViewProps {
  cars: CarType[];
  clients: Client[];
  bookings: Booking[];
  investors: Investor[];
  maintenance: MaintenanceRecord[];
  payouts: InvestorPayout[];
  settings: CompanySettings;
  onReceiveReturn: (booking: Booking) => void;
  onSelectCar: (car: CarType) => void;
  onOpenInvestorPayout: (investor: Investor) => void;
  onCollectClientDue: (booking: Booking) => void;
}

export const TodaysAgendaView: React.FC<TodaysAgendaViewProps> = ({
  cars,
  clients,
  bookings,
  investors,
  maintenance,
  payouts,
  settings,
  onReceiveReturn,
  onSelectCar,
  onOpenInvestorPayout,
  onCollectClientDue
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'returns' | 'receivables' | 'payables' | 'maintenance'>('all');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentDayOfMonth = now.getDate();
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  // 1. Returns Due Today / Overdue
  const activeBookings = bookings.filter(b => b.status === 'ACTIVE');
  const returnsDue = activeBookings.filter(b => {
    const returnDateStr = b.expectedReturnDate.split('T')[0];
    return returnDateStr <= todayStr;
  });

  // 2. Receivables Due
  const clientDues = bookings.filter(b => {
    const total = b.finalTotalAmount || b.totalEstimatedRent;
    const paid = (b.advancePaid || 0) + (b.finalBalancePaid || 0);
    return total > paid && b.status !== 'CANCELLED';
  });

  // 3. Investor Payables Due
  const investorPayables = investors.filter(inv => {
    const paidThisMonth = payouts.some(p => p.investorId === inv.id && p.periodMonth.toLowerCase().includes(currentMonthName.toLowerCase()));
    return !paidThisMonth;
  });

  // 4. Maintenance Due
  const maintenanceDueCars = cars.filter(car => {
    const carMaint = maintenance.filter(m => m.carId === car.id);
    const lastMaint = carMaint[0];
    if (lastMaint && lastMaint.nextServiceOdometer && car.currentOdometer >= (lastMaint.nextServiceOdometer - 500)) {
      return true;
    }
    return false;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-serif">
      
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm font-serif">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-serif">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 font-serif">
              <CalendarClock size={14} /> Daily Action Center
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">
              Today's Schedule & Action Checklist
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-serif">
              Consolidated view of vehicle returns, client receivable collections, investor payouts, and maintenance alerts for {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
            </p>
          </div>

          <div className="flex items-center gap-2 font-serif">
            <span className="px-3 py-1.5 rounded-lg bg-[#faf9f5] border border-slate-300 text-xs text-slate-900 font-serif font-bold">
              Day {currentDayOfMonth} of {currentMonthName}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-200 text-xs font-serif">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition font-serif ${
              activeSubTab === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-[#faf9f5] text-slate-700 hover:text-slate-900 border border-slate-300'
            }`}
          >
            All Action Items ({returnsDue.length + clientDues.length + investorPayables.length + maintenanceDueCars.length})
          </button>
          
          <button
            onClick={() => setActiveSubTab('returns')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition font-serif ${
              activeSubTab === 'returns' ? 'bg-rose-700 text-white shadow-sm' : 'bg-[#faf9f5] text-slate-700 hover:text-slate-900 border border-slate-300'
            }`}
          >
            <Car size={13} />
            Vehicle Returns Due ({returnsDue.length})
          </button>

          <button
            onClick={() => setActiveSubTab('receivables')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition font-serif ${
              activeSubTab === 'receivables' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-[#faf9f5] text-slate-700 hover:text-slate-900 border border-slate-300'
            }`}
          >
            <DollarSign size={13} />
            Client Receivables ({clientDues.length})
          </button>

          <button
            onClick={() => setActiveSubTab('payables')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition font-serif ${
              activeSubTab === 'payables' ? 'bg-amber-700 text-white shadow-sm' : 'bg-[#faf9f5] text-slate-700 hover:text-slate-900 border border-slate-300'
            }`}
          >
            <Users size={13} />
            Investor Payouts Due ({investorPayables.length})
          </button>

          <button
            onClick={() => setActiveSubTab('maintenance')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition font-serif ${
              activeSubTab === 'maintenance' ? 'bg-blue-700 text-white shadow-sm' : 'bg-[#faf9f5] text-slate-700 hover:text-slate-900 border border-slate-300'
            }`}
          >
            <Wrench size={13} />
            Maintenance Alerts ({maintenanceDueCars.length})
          </button>
        </div>
      </div>

      {/* 1. Vehicle Returns Due Section */}
      {(activeSubTab === 'all' || activeSubTab === 'returns') && (
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm font-serif">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-serif">
            <div className="flex items-center gap-2.5 font-serif">
              <div className="p-2 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
                <Car size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
                  1. Vehicle Returns Due Today or Overdue (گاڑی واپسی ریکارڈ)
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold font-serif">
                    {returnsDue.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-serif">Cars scheduled to be returned today or past return deadline.</p>
              </div>
            </div>
          </div>

          {returnsDue.length === 0 ? (
            <div className="p-6 text-center text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center gap-2 font-serif font-bold">
              <CheckCircle size={16} /> All active rentals are on schedule. No overdue returns today!
            </div>
          ) : (
            <div className="space-y-3 font-serif">
              {returnsDue.map(b => {
                const car = cars.find(c => c.id === b.carId);
                const client = clients.find(c => c.id === b.clientId);
                if (!car || !client) return null;

                const isOverdue = new Date(b.expectedReturnDate) < now;
                const balanceDue = Math.max(0, b.totalEstimatedRent - b.advancePaid);

                return (
                  <div 
                    key={b.id}
                    className="p-4 bg-[#faf9f5] rounded-lg border border-slate-200 hover:border-slate-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-serif"
                  >
                    <div className="flex items-start gap-3.5 font-serif">
                      <div className={`p-3 rounded-lg shrink-0 ${isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-serif">
                          <span className="font-bold text-slate-900 text-base font-serif">{car.plateNumber}</span>
                          <span className="text-slate-700 font-bold font-serif">{car.make} {car.model}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-serif ${
                            isOverdue ? 'bg-rose-200 text-rose-900 font-serif' : 'bg-amber-200 text-amber-900 font-serif'
                          }`}>
                            {isOverdue ? 'OVERDUE' : 'DUE TODAY'}
                          </span>
                        </div>
                        
                        <div className="text-slate-700 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-serif">
                          <span>Client: <strong className="text-slate-900 font-serif">{client.name}</strong> ({client.cnic})</span>
                          <span>Phone: <strong className="text-slate-900 font-serif">{client.phone}</strong></span>
                          <span>Return Expected: <strong className="text-slate-900 font-serif">{new Date(b.expectedReturnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                        </div>

                        <div className="text-slate-600 mt-1 text-[11px] font-serif">
                          Advance Paid: {settings.currency} {b.advancePaid.toLocaleString()} &bull; Balance Due: <strong className="text-slate-900 font-serif">{settings.currency} {balanceDue.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-center shrink-0 font-serif">
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=Assalam-o-Alaikum%20${encodeURIComponent(client.name)},%20this%20is%20a%20reminder%20from%20${encodeURIComponent(settings.businessName)}%20regarding%20the%20scheduled%20return%20of%20vehicle%20${encodeURIComponent(car.plateNumber)}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition font-serif"
                      >
                        <MessageSquare size={14} /> WhatsApp
                      </a>

                      <button
                        onClick={() => onReceiveReturn(b)}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95 font-serif"
                      >
                        <CheckCircle size={15} /> Receive Return
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Client Receivables Dues Section */}
      {(activeSubTab === 'all' || activeSubTab === 'receivables') && (
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm font-serif">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-serif">
            <div className="flex items-center gap-2.5 font-serif">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                <DollarSign size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
                  2. Client Receivables & Outstanding Dues (کسٹمر سے لینے والے پیسے)
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-serif">
                    {clientDues.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-serif">Clients with pending rental balances.</p>
              </div>
            </div>
          </div>

          {clientDues.length === 0 ? (
            <div className="p-6 text-center text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center gap-2 font-serif font-bold">
              <CheckCircle size={16} /> All client payments are fully settled!
            </div>
          ) : (
            <div className="space-y-2.5 font-serif">
              {clientDues.map(b => {
                const car = cars.find(c => c.id === b.carId);
                const client = clients.find(c => c.id === b.clientId);
                if (!car || !client) return null;

                const total = b.finalTotalAmount || b.totalEstimatedRent;
                const paid = (b.advancePaid || 0) + (b.finalBalancePaid || 0);
                const remainingDue = Math.max(0, total - paid);

                return (
                  <div 
                    key={b.id}
                    className="p-3.5 bg-[#faf9f5] rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-serif"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-serif">
                        <span className="font-bold text-slate-900 font-serif">{client.name}</span>
                        <span className="text-slate-600 font-bold font-serif">({client.cnic})</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-bold text-[10px] font-serif">
                          {car.plateNumber}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1 font-serif">
                        Phone: {client.phone} &bull; Booking: {b.bookingNumber}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center font-serif">
                      <div className="text-right font-serif">
                        <div className="text-xs text-slate-600 font-serif">Remaining Balance Due:</div>
                        <div className="text-base font-bold text-rose-800 font-serif">{settings.currency} {remainingDue.toLocaleString()}</div>
                      </div>

                      <button
                        onClick={() => onCollectClientDue(b)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-900 hover:text-white bg-slate-100 hover:bg-slate-900 border border-slate-300 rounded-md transition font-serif"
                      >
                        Collect Payment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Investor Payables Dues Section */}
      {(activeSubTab === 'all' || activeSubTab === 'payables') && (
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm font-serif">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-serif">
            <div className="flex items-center gap-2.5 font-serif">
              <div className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
                  3. Investor Monthly Returns & Payouts Due (انویسٹرز کو دینے والے پیسے)
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-serif">
                    {investorPayables.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-serif">Monthly agreed profit/rental returns due to vehicle investors for {currentMonthName}.</p>
              </div>
            </div>
          </div>

          {investorPayables.length === 0 ? (
            <div className="p-6 text-center text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center gap-2 font-serif font-bold">
              <CheckCircle size={16} /> All investor returns for {currentMonthName} have been paid and settled!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-serif">
              {investorPayables.map(inv => {
                const invCars = cars.filter(c => c.investorId === inv.id);

                return (
                  <div 
                    key={inv.id}
                    className="p-4 bg-[#faf9f5] rounded-lg border border-slate-200 hover:border-slate-400 transition flex flex-col justify-between gap-3 text-xs font-serif"
                  >
                    <div>
                      <div className="flex items-center justify-between font-serif">
                        <span className="font-bold text-slate-900 text-sm font-serif">{inv.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold font-serif">
                          Due Day: {inv.payoutDueDay}th
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1 font-serif text-[11px]">
                        CNIC: {inv.cnic} &bull; {inv.phone}
                      </div>
                      <div className="text-slate-700 mt-1 text-[11px] font-serif">
                        Bank: <span className="font-bold text-slate-900 font-serif">{inv.bankDetails.bankName}</span> ({inv.bankDetails.accountNumber})
                      </div>
                      <div className="text-slate-600 mt-1 text-[11px] font-serif">
                        Vehicles: {invCars.map(c => c.plateNumber).join(', ') || 'No active cars'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-serif">
                      <div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase font-serif">Monthly Return</div>
                        <div className="text-sm font-bold text-amber-900 font-serif">
                          {inv.payoutType === 'FIXED_MONTHLY' 
                            ? `${settings.currency} ${inv.payoutAmount.toLocaleString()}`
                            : `${inv.payoutAmount}% Profit Share`
                          }
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenInvestorPayout(inv)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition font-serif"
                      >
                        Record Payout Voucher
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Upcoming Maintenance Due */}
      {(activeSubTab === 'all' || activeSubTab === 'maintenance') && (
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm font-serif">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-serif">
            <div className="flex items-center gap-2.5 font-serif">
              <div className="p-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                <Wrench size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
                  4. Vehicle Maintenance & Oil Change Alerts (سروس الرٹس)
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-serif">
                    {maintenanceDueCars.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-serif">Cars nearing or past periodic service odometer thresholds.</p>
              </div>
            </div>
          </div>

          {maintenanceDueCars.length === 0 ? (
            <div className="p-6 text-center text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center gap-2 font-serif font-bold">
              <CheckCircle size={16} /> All vehicle maintenance intervals are up to date!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-serif">
              {maintenanceDueCars.map(car => (
                <div 
                  key={car.id}
                  className="p-4 bg-[#faf9f5] rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs cursor-pointer hover:border-slate-400 transition font-serif"
                  onClick={() => onSelectCar(car)}
                >
                  <div className="flex items-center gap-3 font-serif">
                    <div className="p-2.5 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                      <Car size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm font-serif">{car.plateNumber}</div>
                      <div className="text-slate-700 font-bold font-serif">{car.make} {car.model}</div>
                      <div className="text-amber-800 font-bold mt-1 text-[11px] font-serif">
                        Current Odometer: {car.currentOdometer.toLocaleString()} KM
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1 font-serif">
                    Inspect <ArrowRight size={13} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};


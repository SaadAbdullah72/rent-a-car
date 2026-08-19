import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Wrench, 
  FileSpreadsheet, 
  CheckCircle,
  Download,
  Calendar,
  CreditCard,
  Phone
} from 'lucide-react';
import { Booking, Investor, InvestorPayout, MaintenanceRecord, Car as CarType, Client, CompanySettings } from '../../types';

interface AccountsViewProps {
  bookings: Booking[];
  investors: Investor[];
  payouts: InvestorPayout[];
  maintenance: MaintenanceRecord[];
  cars: CarType[];
  clients: Client[];
  settings: CompanySettings;
  onOpenInvestorPayout: (investor: Investor) => void;
  onCollectClientDue: (booking: Booking) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  bookings,
  investors,
  payouts,
  maintenance,
  cars,
  clients,
  settings,
  onOpenInvestorPayout,
  onCollectClientDue
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'receivables' | 'payables' | 'maintenance'>('overview');

  // Revenue calculations
  const totalRentalRevenue = bookings.reduce((sum, b) => {
    if (b.status === 'COMPLETED') return sum + (b.finalTotalAmount || b.totalEstimatedRent || 0);
    return sum + (b.advancePaid || 0);
  }, 0);

  const totalInvestorPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
  const netProfit = totalRentalRevenue - totalInvestorPayouts - totalMaintenanceCost;

  // Receivables
  const pendingReceivables = bookings.filter(b => {
    const total = b.finalTotalAmount || b.totalEstimatedRent;
    const paid = (b.advancePaid || 0) + (b.finalBalancePaid || 0);
    return total > paid && b.status !== 'CANCELLED';
  });

  const totalPendingReceivablesAmount = pendingReceivables.reduce((sum, b) => {
    const total = b.finalTotalAmount || b.totalEstimatedRent;
    const paid = (b.advancePaid || 0) + (b.finalBalancePaid || 0);
    return sum + (total - paid);
  }, 0);

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'FINANCIAL LEDGER REPORT - ' + settings.businessName + '\n';
    csvContent += 'Generated On,' + new Date().toLocaleDateString() + '\n\n';

    csvContent += 'CATEGORY,AMOUNT (PKR)\n';
    csvContent += `Total Rental Income,${totalRentalRevenue}\n`;
    csvContent += `Total Investor Payouts,${totalInvestorPayouts}\n`;
    csvContent += `Total Maintenance Cost,${totalMaintenanceCost}\n`;
    csvContent += `NET BUSINESS PROFIT,${netProfit}\n`;
    csvContent += `Pending Client Receivables,${totalPendingReceivablesAmount}\n\n`;

    csvContent += 'BOOKING TRANSACTIONS\n';
    csvContent += 'Booking No,Client,Car Plate,Status,Total Rent,Advance,Balance Due\n';
    bookings.forEach(b => {
      const client = clients.find(c => c.id === b.clientId);
      const car = cars.find(c => c.id === b.carId);
      const total = b.finalTotalAmount || b.totalEstimatedRent;
      const due = Math.max(0, total - (b.advancePaid || 0) - (b.finalBalancePaid || 0));
      csvContent += `${b.bookingNumber},"${client?.name || 'N/A'}",${car?.plateNumber || 'N/A'},${b.status},${total},${b.advancePaid},${due}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Accounts_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Wallet className="text-emerald-400" />
            Financial Accounts & Profit/Loss Ledger (کھاتے و حساب کتاب)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Profit & Loss accounting, client receivables, investor payout settlements, and export tools.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-2 transition self-start sm:self-auto"
        >
          <FileSpreadsheet size={15} /> Export Ledger (CSV)
        </button>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Revenue */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Gross Rental Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{settings.currency} {totalRentalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">All booking collections</div>
        </div>

        {/* Investor Payouts */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Investor Payouts</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{settings.currency} {totalInvestorPayouts.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total returns paid to partners</div>
        </div>

        {/* Maintenance Cost */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Maintenance / Repairs</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <Wrench size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{settings.currency} {totalMaintenanceCost.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Parts, oil and workshop bills</div>
        </div>

        {/* Net Business Profit */}
        <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-slateDark-850 to-emerald-950/30 border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-emerald-300">Net Business Profit</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{settings.currency} {netProfit.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Revenue - Payouts - Maintenance</div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            activeTab === 'overview' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white bg-slateDark-850'
          }`}
        >
          P&L Summary
        </button>
        <button
          onClick={() => setActiveTab('receivables')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            activeTab === 'receivables' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white bg-slateDark-850'
          }`}
        >
          Client Receivables ({pendingReceivables.length})
        </button>
        <button
          onClick={() => setActiveTab('payables')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            activeTab === 'payables' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white bg-slateDark-850'
          }`}
        >
          Investor Payout History ({payouts.length})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            activeTab === 'maintenance' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white bg-slateDark-850'
          }`}
        >
          Maintenance Expense Ledger ({maintenance.length})
        </button>
      </div>

      {/* Tab: P&L Summary */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Detailed Statement */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Profit & Loss Statement (آمدن و اخراجات)
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-300">Total Rental Gross Billing:</span>
                <span className="font-bold text-white font-mono">{settings.currency} {totalRentalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-300">Less: Investor Payouts & Returns:</span>
                <span className="font-bold text-amber-400 font-mono">-{settings.currency} {totalInvestorPayouts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-300">Less: Fleet Maintenance & Repairs:</span>
                <span className="font-bold text-rose-400 font-mono">-{settings.currency} {totalMaintenanceCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-slate-700 text-sm">
                <span className="font-black text-white">Net Business Earnings:</span>
                <span className="font-black text-emerald-400 font-mono text-base">{settings.currency} {netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Vehicle-Wise Profitability Overview */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Vehicle-Wise Profitability Ranking
            </h2>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {cars.map(car => {
                const carBookings = bookings.filter(b => b.carId === car.id);
                const carMaint = maintenance.filter(m => m.carId === car.id);

                const rev = carBookings.reduce((sum, b) => sum + (b.finalTotalAmount || b.totalEstimatedRent || 0), 0);
                const exp = carMaint.reduce((sum, m) => sum + m.cost, 0);
                const net = rev - exp;

                return (
                  <div key={car.id} className="p-3 bg-slateDark-850 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono font-bold text-white">{car.plateNumber}</div>
                      <div className="text-[11px] text-slate-400">{car.make} {car.model}</div>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold font-mono ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {settings.currency} {net.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Rev: {settings.currency} {rev.toLocaleString()} | Exp: {settings.currency} {exp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Tab: Receivables */}
      {activeTab === 'receivables' && (
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Outstanding Client Receivables (کسٹمر سے بقایا جات)
            </h2>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              Total Due: {settings.currency} {totalPendingReceivablesAmount.toLocaleString()}
            </span>
          </div>

          {pendingReceivables.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-400">All customer dues have been received!</div>
          ) : (
            <div className="space-y-2.5">
              {pendingReceivables.map(b => {
                const client = clients.find(c => c.id === b.clientId);
                const car = cars.find(c => c.id === b.carId);
                const total = b.finalTotalAmount || b.totalEstimatedRent;
                const paid = (b.advancePaid || 0) + (b.finalBalancePaid || 0);
                const due = Math.max(0, total - paid);

                return (
                  <div key={b.id} className="p-3.5 bg-slateDark-850 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{client?.name || 'Customer'}</span>
                        <span className="text-slate-400 font-mono">({client?.phone})</span>
                        <span className="font-mono text-brand-300 font-semibold px-2 py-0.5 bg-slateDark-950 rounded">
                          {car?.plateNumber}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-1 text-[11px]">
                        Booking No: {b.bookingNumber} &bull; Total: {settings.currency} {total.toLocaleString()} &bull; Paid: {settings.currency} {paid.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-black text-rose-400 font-mono text-sm">
                        {settings.currency} {due.toLocaleString()}
                      </div>
                      <button
                        onClick={() => onCollectClientDue(b)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition text-xs"
                      >
                        Collect Balance
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Investor Payouts */}
      {activeTab === 'payables' && (
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Historical Investor Payouts & Wire Transfers
            </h2>
            <span className="font-bold text-amber-400 font-mono text-sm">
              Total Paid Out: {settings.currency} {totalInvestorPayouts.toLocaleString()}
            </span>
          </div>

          {payouts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No investor payouts recorded yet.</div>
          ) : (
            <div className="space-y-2.5">
              {payouts.map(p => {
                const investor = investors.find(i => i.id === p.investorId);

                return (
                  <div key={p.id} className="p-3.5 bg-slateDark-850 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-white">{investor?.name || 'Investor'}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Month: <strong className="text-amber-300">{p.periodMonth}</strong> &bull; Date: {new Date(p.payoutDate).toLocaleDateString()} &bull; Mode: {p.paymentMethod} {p.referenceNumber ? `(Ref #${p.referenceNumber})` : ''}
                      </div>
                    </div>

                    <div className="font-bold font-mono text-amber-400 text-sm">
                      {settings.currency} {p.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Maintenance Expense Ledger */}
      {activeTab === 'maintenance' && (
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Fleet Maintenance Expense Ledger
            </h2>
            <span className="font-bold text-rose-400 font-mono text-sm">
              Total Spent: {settings.currency} {totalMaintenanceCost.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {maintenance.map(m => {
              const car = cars.find(c => c.id === m.carId);
              return (
                <div key={m.id} className="p-3 bg-slateDark-850 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{car?.plateNumber}</span>
                      <span className="text-slate-400">({m.serviceType.replace('_', ' ')})</span>
                      <span className="text-slate-500">&bull; {new Date(m.serviceDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1">{m.description}</p>
                  </div>

                  <div className="font-bold text-rose-400 font-mono whitespace-nowrap">
                    {settings.currency} {m.cost.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

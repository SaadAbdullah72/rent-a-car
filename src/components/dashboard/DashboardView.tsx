import React from 'react';
import { 
  Car, 
  Users, 
  CalendarClock, 
  ArrowUpRight, 
  Key, 
  AlertCircle, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Car as CarType, Investor, Client, Booking, MaintenanceRecord, InvestorPayout, CompanySettings, ActiveTab } from '../../types';

interface DashboardViewProps {
  cars: CarType[];
  investors: Investor[];
  clients: Client[];
  bookings: Booking[];
  maintenance: MaintenanceRecord[];
  payouts: InvestorPayout[];
  settings: CompanySettings;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectCar: (car: CarType) => void;
  onReceiveReturn: (booking: Booking) => void;
  onOpenNewBooking: () => void;
  onOpenNewCar: () => void;
  onOpenNewInvestor: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cars,
  investors,
  clients,
  bookings,
  maintenance,
  payouts,
  settings,
  onNavigateTab,
  onSelectCar,
  onReceiveReturn,
  onOpenNewBooking,
  onOpenNewCar,
  onOpenNewInvestor
}) => {
  // Fleet status calculations
  const totalCars = cars.length;
  const availableCars = cars.filter(c => c.status === 'AVAILABLE').length;
  const onRentCars = cars.filter(c => c.status === 'ON_RENT').length;
  const inMaintenanceCars = cars.filter(c => c.status === 'MAINTENANCE').length;

  // Active bookings & Overdue
  const activeBookings = bookings.filter(b => b.status === 'ACTIVE');
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const dueTodayOrOverdueBookings = activeBookings.filter(b => {
    const returnDateStr = b.expectedReturnDate.split('T')[0];
    return returnDateStr <= todayStr;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-serif">
      
      {/* Top Banner / Greeting */}
      <div className="p-6 bg-[#ffffff] rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest mb-1 font-serif">
            <Sparkles size={14} className="text-slate-800" /> Operational Control Center
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Welcome to {settings.businessName}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 font-serif">
            Car fleet management, active rentals, return schedule, and customer directory.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 font-serif">
          <button
            onClick={onOpenNewBooking}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95 font-serif"
          >
            <Key size={14} /> + New Rent Out
          </button>
          <button
            onClick={onOpenNewCar}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 bg-[#faf9f5] border border-slate-300 rounded-lg transition font-serif"
          >
            + Add Car
          </button>
        </div>
      </div>

      {/* Overdue / Due Today Alert Banner (If Any) */}
      {dueTodayOrOverdueBookings.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4 shadow-sm font-serif">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-lg">
              <AlertCircle size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2 font-serif">
                <span>{dueTodayOrOverdueBookings.length} Car(s) Scheduled for Return Today or Overdue!</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-bold font-serif">Action Required</span>
              </div>
              <p className="text-xs text-slate-600 font-serif">
                Click to inspect vehicles, log ending kilometers, collect balance, and update fleet status.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('agenda')}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm transition shrink-0 font-serif"
          >
            View Return List
          </button>
        </div>
      )}

      {/* Primary KPI Summary Cards - Clean Operational Focus */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-serif">
        
        {/* Total Active Fleet */}
        <div 
          onClick={() => onNavigateTab('cars')}
          className="bg-white border border-slate-200 hover:border-slate-400 p-5 rounded-xl cursor-pointer shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-serif">Total Fleet</span>
            <div className="p-2 bg-[#faf9f5] text-slate-800 rounded-lg border border-slate-200">
              <Car size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-serif">{totalCars}</div>
          <div className="mt-2 flex items-center gap-2 text-xs font-serif">
            <span className="text-emerald-700 font-bold">{availableCars} Available</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-blue-700 font-bold">{onRentCars} On Rent</span>
          </div>
        </div>

        {/* Available Cars */}
        <div 
          onClick={() => onNavigateTab('cars')}
          className="bg-white border border-slate-200 hover:border-slate-400 p-5 rounded-xl cursor-pointer shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-serif">Available Cars</span>
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-800 font-serif">{availableCars}</div>
          <div className="mt-2 text-xs text-slate-600 font-serif">
            Ready for immediate rental dispatch
          </div>
        </div>

        {/* Active Rentals */}
        <div 
          onClick={() => onNavigateTab('bookings')}
          className="bg-white border border-slate-200 hover:border-slate-400 p-5 rounded-xl cursor-pointer shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-serif">Active Rentals</span>
            <div className="p-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
              <Key size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-serif">{activeBookings.length}</div>
          <div className="mt-2 text-xs text-blue-800 font-bold font-serif">
            Vehicles currently on road
          </div>
        </div>

        {/* Returns Due / Agenda */}
        <div 
          onClick={() => onNavigateTab('agenda')}
          className="bg-white border border-slate-200 hover:border-slate-400 p-5 rounded-xl cursor-pointer shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-serif">Returns Due Today</span>
            <div className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
              <CalendarClock size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-800 font-serif">{dueTodayOrOverdueBookings.length}</div>
          <div className="mt-2 text-xs text-slate-600 font-serif">
            Scheduled for check-in today
          </div>
        </div>

      </div>

      {/* Fleet Breakdown & Active Dispatches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-serif">
        
        {/* Fleet Breakdown */}
        <div className="lg:col-span-1 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 font-serif">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-serif">
              <Car size={16} className="text-slate-700" />
              Fleet Status Distribution
            </h2>
            <button 
              onClick={() => onNavigateTab('cars')} 
              className="text-xs text-slate-800 hover:text-black font-bold flex items-center gap-1 font-serif"
            >
              All Cars <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-3 font-serif">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-emerald-800 font-bold flex items-center gap-1.5 font-serif">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Available in Yard
                </span>
                <span className="text-slate-900 font-bold">{availableCars} ({totalCars > 0 ? Math.round((availableCars / totalCars) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalCars > 0 ? (availableCars / totalCars) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-blue-800 font-bold flex items-center gap-1.5 font-serif">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> On Active Rent
                </span>
                <span className="text-slate-900 font-bold">{onRentCars} ({totalCars > 0 ? Math.round((onRentCars / totalCars) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalCars > 0 ? (onRentCars / totalCars) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-amber-800 font-bold flex items-center gap-1.5 font-serif">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span> In Maintenance / Workshop
                </span>
                <span className="text-slate-900 font-bold">{inMaintenanceCars} ({totalCars > 0 ? Math.round((inMaintenanceCars / totalCars) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalCars > 0 ? (inMaintenanceCars / totalCars) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs font-serif">
            <div className="p-2.5 bg-[#faf9f5] border border-slate-200 rounded-lg text-center">
              <div className="text-slate-600 text-[10px] font-bold uppercase font-serif">Investor Cars</div>
              <div className="text-base font-bold text-slate-900 font-serif">{cars.filter(c => c.ownership === 'INVESTOR').length}</div>
            </div>
            <div className="p-2.5 bg-[#faf9f5] border border-slate-200 rounded-lg text-center">
              <div className="text-slate-600 text-[10px] font-bold uppercase font-serif">Company Owned</div>
              <div className="text-base font-bold text-slate-900 font-serif">{cars.filter(c => c.ownership === 'COMPANY').length}</div>
            </div>
          </div>
        </div>

        {/* Live Active Bookings List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 font-serif">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-serif">
                <CalendarClock size={16} className="text-slate-700" />
                Active Rentals & On-Road Status
              </h2>
              <span className="text-[11px] text-slate-600 font-serif">Who currently has which car and return schedule</span>
            </div>
            <button 
              onClick={() => onNavigateTab('bookings')} 
              className="text-xs text-slate-800 hover:text-black font-bold flex items-center gap-1 font-serif"
            >
              All Bookings <ArrowUpRight size={14} />
            </button>
          </div>

          {activeBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-serif font-bold">
              No cars currently on rent. All vehicles are available in yard!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto font-serif">
              {activeBookings.map((b) => {
                const car = cars.find(c => c.id === b.carId);
                const client = clients.find(c => c.id === b.clientId);
                if (!car || !client) return null;

                const isOverdue = new Date(b.expectedReturnDate) < now;

                return (
                  <div 
                    key={b.id}
                    className="p-3.5 bg-[#faf9f5] hover:bg-slate-100 rounded-lg border border-slate-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-serif"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 border ${isOverdue ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                        <Car size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm font-serif">{car.plateNumber}</span>
                          <span className="text-slate-700 font-medium font-serif">({car.make} {car.model})</span>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-bold text-[10px] font-serif">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-serif">
                          <span>Client: <strong className="text-slate-900 font-serif">{client.name}</strong> ({client.phone})</span>
                          <span>&bull;</span>
                          <span>Return: <strong className="text-slate-900 font-serif">{new Date(b.expectedReturnDate).toLocaleDateString()}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center font-serif">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-600 font-serif">{b.destination || 'Local City'}</div>
                      </div>

                      <button
                        onClick={() => onReceiveReturn(b)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition shrink-0 font-serif"
                      >
                        Receive Return
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};


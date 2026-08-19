import React, { useState, useMemo } from 'react';
import { Search, X, Car as CarIcon, User, Phone, MapPin, Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Car, Client, Booking, Investor, CompanySettings } from '../../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  cars: Car[];
  clients: Client[];
  bookings: Booking[];
  investors: Investor[];
  settings: CompanySettings;
  onClose: () => void;
  onSelectCar?: (car: Car) => void;
  onSelectBooking?: (booking: Booking) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  cars,
  clients,
  bookings,
  investors,
  settings,
  onClose,
  onSelectCar,
  onSelectBooking
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return cars.map(car => {
      const activeBooking = bookings.find(b => b.carId === car.id && b.status === 'ACTIVE');
      const activeClient = activeBooking ? clients.find(c => c.id === activeBooking.clientId) : null;
      const investor = car.investorId ? investors.find(i => i.id === car.investorId) : null;

      const matchesCar = 
        car.plateNumber.toLowerCase().includes(q) ||
        car.make.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        (car.chassisNumber && car.chassisNumber.toLowerCase().includes(q));

      const matchesClient = activeClient && (
        activeClient.name.toLowerCase().includes(q) ||
        activeClient.cnic.toLowerCase().includes(q) ||
        activeClient.phone.toLowerCase().includes(q)
      );

      const matchesInvestor = investor && (
        investor.name.toLowerCase().includes(q) ||
        investor.cnic.toLowerCase().includes(q)
      );

      if (matchesCar || matchesClient || matchesInvestor) {
        return {
          car,
          activeBooking,
          activeClient,
          investor,
          matchType: matchesClient ? 'Client' : matchesInvestor ? 'Investor' : 'Vehicle'
        };
      }
      return null;
    }).filter(Boolean);
  }, [query, cars, clients, bookings, investors]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slateDark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Search Input Bar */}
        <div className="relative p-4 border-b border-slate-800 bg-slateDark-850 flex items-center gap-3">
          <Search size={22} className="text-brand-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any Car Number (e.g. LEA-2024), Client CNIC, or Investor Name..."
            className="w-full bg-transparent border-none text-white text-base focus:outline-none placeholder-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[65vh] overflow-y-auto space-y-3">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search size={36} className="mx-auto text-slate-600 mb-2" />
              <div className="text-sm font-semibold text-slate-400">Live Quick Vehicle & Holder Lookup</div>
              <div className="text-xs max-w-md mx-auto">
                Enter a registration plate or CNIC to instantly see where any car is right now, who is driving it, and when it is scheduled to return.
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No matching cars, clients, or investors found for "<span className="text-white">{query}</span>".
            </div>
          ) : (
            searchResults.map((res: any) => {
              const { car, activeBooking, activeClient, investor } = res;
              return (
                <div 
                  key={car.id}
                  className="p-4 bg-slateDark-850 hover:bg-slate-800/80 rounded-xl border border-slate-800 hover:border-brand-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => {
                    if (onSelectCar) {
                      onClose();
                      onSelectCar(car);
                    }
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-xl shrink-0 mt-0.5">
                      <CarIcon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white font-mono text-base">{car.plateNumber}</span>
                        <span className="text-sm font-medium text-slate-300">{car.make} {car.model} ({car.year})</span>
                        
                        {car.status === 'AVAILABLE' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            Available in Yard
                          </span>
                        )}
                        {car.status === 'ON_RENT' && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-bold animate-pulse">
                            On Active Rent
                          </span>
                        )}
                        {car.status === 'MAINTENANCE' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            In Maintenance
                          </span>
                        )}
                      </div>

                      {/* If Car is on Rent, display Live Holder details prominently */}
                      {car.status === 'ON_RENT' && activeClient && activeBooking ? (
                        <div className="mt-2.5 p-2.5 bg-slateDark-950/70 rounded-lg border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <User size={13} className="text-brand-400" />
                            Client: {activeClient.name}
                            <span className="text-slate-400 font-mono font-normal">({activeClient.cnic})</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                            <span className="flex items-center gap-1">
                              <Phone size={11} className="text-emerald-400" /> {activeClient.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-amber-400" /> {activeBooking.destination || 'Local City'}
                            </span>
                            <span className="flex items-center gap-1 text-amber-300 font-medium">
                              <Clock size={11} /> Return Due: {new Date(activeBooking.expectedReturnDate).toLocaleDateString()} ({new Date(activeBooking.expectedReturnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span>Odometer: <strong className="text-white font-mono">{car.currentOdometer.toLocaleString()} KM</strong></span>
                          <span>Daily: <strong className="text-brand-400">{settings.currency} {car.dailyRate.toLocaleString()}</strong></span>
                          {investor && <span>Investor: <strong className="text-slate-300">{investor.name}</strong></span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <span className="text-xs font-semibold text-brand-400 flex items-center gap-1">
                      View Details <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Car, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign, 
  Gauge, 
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';
import { Car as CarType, Client, Booking, Investor, CompanySettings } from '../../types';

interface LiveLocatorViewProps {
  cars: CarType[];
  clients: Client[];
  bookings: Booking[];
  investors: Investor[];
  settings: CompanySettings;
  onSelectCar: (car: CarType) => void;
  onReceiveReturn: (booking: Booking) => void;
}

export const LiveLocatorView: React.FC<LiveLocatorViewProps> = ({
  cars,
  clients,
  bookings,
  investors,
  settings,
  onSelectCar,
  onReceiveReturn
}) => {
  const [searchPlate, setSearchPlate] = useState('');

  const onRentCars = cars.filter(c => c.status === 'ON_RENT');
  const availableCars = cars.filter(c => c.status === 'AVAILABLE');
  const maintenanceCars = cars.filter(c => c.status === 'MAINTENANCE');

  const filteredCars = cars.filter(c => {
    if (!searchPlate.trim()) return true;
    const q = searchPlate.toLowerCase().trim();
    const activeBooking = bookings.find(b => b.carId === c.id && b.status === 'ACTIVE');
    const activeClient = activeBooking ? clients.find(cl => cl.id === activeBooking.clientId) : null;
    const investor = c.investorId ? investors.find(i => i.id === c.investorId) : null;

    return (
      c.plateNumber.toLowerCase().includes(q) ||
      c.make.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q) ||
      (activeClient && (activeClient.name.toLowerCase().includes(q) || activeClient.phone.includes(q) || activeClient.cnic.includes(q))) ||
      (investor && investor.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slateDark-850 via-slateDark-900 to-brand-950/40 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">
          <Compass size={14} /> Live Fleet Status & Vehicle Locator (گاڑی کہاں ہے؟)
        </div>
        <h1 className="text-2xl font-black text-white">
          Real-Time Vehicle & Customer Dispatch Tracker
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Instantly look up any vehicle plate to see whether it is parked in yard or currently on road with a customer.
        </p>

        {/* Live Search Input */}
        <div className="mt-5 relative max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" />
          <input
            type="text"
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
            placeholder="Type any Registration Plate (e.g. LEA-2024), Client Name or CNIC..."
            className="w-full pl-12 pr-4 py-3 bg-slateDark-950/90 border border-slate-700/80 focus:border-brand-500 rounded-xl text-white font-mono text-sm shadow-inner placeholder-slate-500"
          />
        </div>
      </div>

      {/* Fleet Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-brand-500">
          <div>
            <div className="text-slate-400">Vehicles on Road (With Clients)</div>
            <div className="text-2xl font-black text-white font-mono">{onRentCars.length}</div>
          </div>
          <Car size={24} className="text-brand-400" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <div className="text-slate-400">Available in Company Yard</div>
            <div className="text-2xl font-black text-white font-mono">{availableCars.length}</div>
          </div>
          <Shield size={24} className="text-emerald-400" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <div className="text-slate-400">In Workshop / Maintenance</div>
            <div className="text-2xl font-black text-white font-mono">{maintenanceCars.length}</div>
          </div>
          <Gauge size={24} className="text-amber-400" />
        </div>
      </div>

      {/* Vehicles Locator Stream */}
      <div className="space-y-4">
        {filteredCars.map(car => {
          const activeBooking = bookings.find(b => b.carId === car.id && b.status === 'ACTIVE');
          const activeClient = activeBooking ? clients.find(c => c.id === activeBooking.clientId) : null;
          const investor = car.investorId ? investors.find(i => i.id === car.investorId) : null;

          return (
            <div 
              key={car.id}
              className={`glass-panel rounded-2xl p-5 border transition flex flex-col lg:flex-row lg:items-center justify-between gap-5 text-xs ${
                car.status === 'ON_RENT' 
                  ? 'border-brand-500/40 bg-gradient-to-r from-brand-950/20 to-slateDark-900' 
                  : car.status === 'AVAILABLE'
                  ? 'border-emerald-500/30'
                  : 'border-amber-500/30'
              }`}
            >
              {/* Left Plate & Vehicle */}
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl shrink-0 ${
                  car.status === 'ON_RENT' ? 'bg-brand-500/10 text-brand-400' : car.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  <Car size={28} />
                </div>

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-black text-xl text-white tracking-wider">{car.plateNumber}</span>
                    <span className="text-sm font-semibold text-slate-300">{car.make} {car.model} ({car.year})</span>
                    <span className="text-xs text-slate-400">Color: {car.color}</span>

                    {car.status === 'ON_RENT' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold text-[10px] animate-pulse">
                        ON ACTIVE RENT
                      </span>
                    )}
                    {car.status === 'AVAILABLE' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        PARKED IN YARD
                      </span>
                    )}
                    {car.status === 'MAINTENANCE' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        IN WORKSHOP
                      </span>
                    )}
                  </div>

                  <div className="text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                    <span>Odometer: <strong className="text-white font-mono">{car.currentOdometer.toLocaleString()} KM</strong></span>
                    <span>&bull;</span>
                    <span>Daily Rate: <strong className="text-brand-300">{settings.currency} {car.dailyRate.toLocaleString()}</strong></span>
                    {investor && (
                      <>
                        <span>&bull;</span>
                        <span>Investor: <strong className="text-amber-300">{investor.name}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle: Active Holder Information */}
              {car.status === 'ON_RENT' && activeClient && activeBooking ? (
                <div className="p-3.5 bg-slateDark-950/80 rounded-xl border border-brand-500/20 text-xs space-y-1.5 min-w-[280px]">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <User size={14} className="text-brand-400" />
                    <span>Holder: {activeClient.name}</span>
                    <span className="text-slate-400 font-mono font-normal">({activeClient.cnic})</span>
                  </div>
                  
                  <div className="text-slate-300 flex items-center gap-3">
                    <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                      <Phone size={12} /> {activeClient.phone}
                    </span>
                    <span className="text-amber-300 flex items-center gap-1">
                      <Clock size={12} /> Return: {new Date(activeBooking.expectedReturnDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px] flex items-center gap-1">
                    <MapPin size={11} className="text-slate-500 shrink-0" />
                    <span className="truncate">{activeBooking.destination || activeClient.address}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  {car.status === 'AVAILABLE' ? 'Vehicle is ready for immediate dispatch in parking lot.' : 'Vehicle is currently undergoing periodic service.'}
                </div>
              )}

              {/* Right Action */}
              <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                <button
                  onClick={() => onSelectCar(car)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
                >
                  View 360 Profile
                </button>

                {car.status === 'ON_RENT' && activeBooking && (
                  <button
                    onClick={() => onReceiveReturn(activeBooking)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition"
                  >
                    Receive Return
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

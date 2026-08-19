import React from 'react';
import { X, Car as CarIcon, User, Wrench, Shield, Calendar, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Car, Investor, Client, Booking, MaintenanceRecord, CompanySettings } from '../../types';

interface CarDetailModalProps {
  isOpen: boolean;
  car: Car | null;
  investor?: Investor;
  activeBooking?: Booking;
  activeClient?: Client;
  allBookings: Booking[];
  allMaintenance: MaintenanceRecord[];
  settings: CompanySettings;
  onClose: () => void;
  onRentOut?: (car: Car) => void;
  onReceiveReturn?: (booking: Booking) => void;
  onLogMaintenance?: (car: Car) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  isOpen,
  car,
  investor,
  activeBooking,
  activeClient,
  allBookings,
  allMaintenance,
  settings,
  onClose,
  onRentOut,
  onReceiveReturn,
  onLogMaintenance
}) => {
  if (!isOpen || !car) return null;

  const carBookings = allBookings.filter(b => b.carId === car.id);
  const carMaintenance = allMaintenance.filter(m => m.carId === car.id);

  const totalRevenueGenerated = carBookings.reduce((sum, b) => {
    return sum + (b.finalTotalAmount || b.totalEstimatedRent || 0);
  }, 0);

  const totalMaintenanceCost = carMaintenance.reduce((sum, m) => sum + m.cost, 0);
  const netCarEarnings = totalRevenueGenerated - totalMaintenanceCost;

  const getStatusBadge = (status: Car['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">Available in Yard</span>;
      case 'ON_RENT':
        return <span className="px-3 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/30 rounded-full text-xs font-semibold animate-pulse">On Active Rent</span>;
      case 'MAINTENANCE':
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold">In Workshop / Maintenance</span>;
      case 'RETURNED_TO_INVESTOR':
        return <span className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/30 rounded-full text-xs font-semibold">Returned to Investor</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl my-8 bg-slateDark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 bg-slateDark-850 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-2xl">
              <CarIcon size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white font-mono tracking-tight">{car.plateNumber}</h2>
                {getStatusBadge(car.status)}
              </div>
              <p className="text-sm text-slate-400 font-medium">
                {car.make} {car.model} ({car.year}) &bull; {car.color} &bull; {car.category}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Active Status Banner (If On Rent) */}
          {car.status === 'ON_RENT' && activeBooking && activeClient && (
            <div className="p-4 bg-gradient-to-r from-brand-950/70 via-slateDark-850 to-slateDark-900 border border-brand-500/30 rounded-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                    <User size={14} /> Currently Dispatched To:
                  </div>
                  <div className="text-base font-bold text-white">
                    {activeClient.name} <span className="text-xs text-slate-400 font-mono">({activeClient.phone})</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Expected Return: <span className="font-semibold text-amber-300">{new Date(activeBooking.expectedReturnDate).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Destination: {activeBooking.destination || 'City use'} &bull; Balance Due: <span className="text-emerald-400 font-semibold">{settings.currency} {(activeBooking.totalEstimatedRent - activeBooking.advancePaid).toLocaleString()}</span>
                  </div>
                </div>

                {onReceiveReturn && (
                  <button
                    onClick={() => {
                      onClose();
                      onReceiveReturn(activeBooking);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition shrink-0"
                  >
                    Receive Return
                    <ArrowUpRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slateDark-850 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Current Odometer</div>
              <div className="text-lg font-bold text-white font-mono">{car.currentOdometer.toLocaleString()} KM</div>
            </div>
            <div className="p-3.5 bg-slateDark-850 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Daily / Monthly Rate</div>
              <div className="text-lg font-bold text-brand-400">{settings.currency} {car.dailyRate.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-slateDark-850 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Lifetime Revenue</div>
              <div className="text-lg font-bold text-emerald-400">{settings.currency} {totalRevenueGenerated.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-slateDark-850 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Maintenance Cost</div>
              <div className="text-lg font-bold text-rose-400">{settings.currency} {totalMaintenanceCost.toLocaleString()}</div>
            </div>
          </div>

          {/* Specifications & Investor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Technical Specs */}
            <div className="p-4 bg-slateDark-850/70 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Shield size={14} className="text-brand-400" />
                Technical Specifications
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">Engine Number:</div>
                <div className="font-mono text-white text-right">{car.engineNumber || 'N/A'}</div>
                
                <div className="text-slate-400">Chassis Number:</div>
                <div className="font-mono text-white text-right">{car.chassisNumber || 'N/A'}</div>
                
                <div className="text-slate-400">Fuel Type:</div>
                <div className="text-white text-right">{car.fuelType}</div>
                
                <div className="text-slate-400">Transmission:</div>
                <div className="text-white text-right">{car.transmission}</div>
                
                <div className="text-slate-400">Monthly Contract Rate:</div>
                <div className="text-brand-300 font-semibold text-right">{settings.currency} {car.monthlyRate.toLocaleString()}</div>
              </div>
            </div>

            {/* Ownership / Investor */}
            <div className="p-4 bg-slateDark-850/70 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User size={14} className="text-amber-400" />
                Ownership & Investor Terms
              </h3>

              {car.ownership === 'INVESTOR' && investor ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Investor Name:</span>
                    <span className="font-bold text-white">{investor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Investor CNIC:</span>
                    <span className="font-mono text-slate-200">{investor.cnic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-slate-200">{investor.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Agreed Return Model:</span>
                    <span className="font-semibold text-amber-400">
                      {investor.payoutType === 'FIXED_MONTHLY' 
                        ? `${settings.currency} ${investor.payoutAmount.toLocaleString()} / Month`
                        : `${investor.payoutAmount}% Share`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Agreement Expiry:</span>
                    <span className="text-slate-300">{new Date(investor.agreementEndDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slateDark-900 rounded-lg">
                  <Shield size={24} className="mx-auto mb-1 text-emerald-400" />
                  This vehicle is 100% owned by <strong className="text-white">{settings.businessName}</strong> (Company Fleet).
                </div>
              )}
            </div>

          </div>

          {/* Maintenance History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench size={16} className="text-amber-400" />
                Maintenance & Repair History ({carMaintenance.length})
              </h3>
              {onLogMaintenance && (
                <button
                  onClick={() => {
                    onClose();
                    onLogMaintenance(car);
                  }}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  + Log Repair / Oil Change
                </button>
              )}
            </div>

            {carMaintenance.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slateDark-850 rounded-xl">
                No maintenance records logged yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {carMaintenance.map((m) => (
                  <div key={m.id} className="p-3 bg-slateDark-850 rounded-xl border border-slate-800 text-xs flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold text-[10px]">
                          {m.serviceType.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">{new Date(m.serviceDate).toLocaleDateString()}</span>
                        <span className="text-slate-500">&bull; {m.odometer.toLocaleString()} KM</span>
                      </div>
                      <p className="text-slate-300 text-xs">{m.description}</p>
                      <div className="text-[11px] text-slate-400 mt-1">Vendor: {m.vendorName} {m.invoiceNumber ? `(#${m.invoiceNumber})` : ''}</div>
                    </div>
                    <div className="text-right font-bold text-rose-400 whitespace-nowrap">
                      {settings.currency} {m.cost.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rental History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar size={16} className="text-brand-400" />
              Past Rental Bookings ({carBookings.length})
            </h3>

            {carBookings.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slateDark-850 rounded-xl">
                No rental bookings recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {carBookings.map((b) => (
                  <div key={b.id} className="p-3 bg-slateDark-850 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-white">{b.bookingNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-slate-400">{b.totalDays} Days ({new Date(b.startDate).toLocaleDateString()})</span>
                      </div>
                      <div className="text-slate-400">{b.destination || 'City Trip'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">{settings.currency} {(b.finalTotalAmount || b.totalEstimatedRent).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{b.paymentStatus}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-slateDark-850 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            Net Vehicle Profit: <span className="font-bold text-emerald-400">{settings.currency} {netCarEarnings.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-3">
            {car.status === 'AVAILABLE' && onRentOut && (
              <button
                onClick={() => {
                  onClose();
                  onRentOut(car);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-900/30 transition"
              >
                Rent Out this Car
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

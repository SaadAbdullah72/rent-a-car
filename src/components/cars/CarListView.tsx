import React, { useState, useMemo } from 'react';
import { 
  Car as CarIcon, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Key, 
  Wrench, 
  CheckCircle, 
  User, 
  Fuel, 
  Gauge
} from 'lucide-react';
import { Car, Investor, Booking, Client, CompanySettings } from '../../types';

interface CarListViewProps {
  cars: Car[];
  investors: Investor[];
  bookings: Booking[];
  clients: Client[];
  settings: CompanySettings;
  onOpenAddCar: () => void;
  onOpenEditCar: (car: Car) => void;
  onSelectCar: (car: Car) => void;
  onRentOutCar: (car: Car) => void;
  onReceiveReturn: (booking: Booking) => void;
  onLogMaintenance: (car: Car) => void;
  onDeleteCar: (car: Car) => void;
}

export const CarListView: React.FC<CarListViewProps> = ({
  cars,
  investors,
  bookings,
  clients,
  settings,
  onOpenAddCar,
  onOpenEditCar,
  onSelectCar,
  onRentOutCar,
  onReceiveReturn,
  onLogMaintenance,
  onDeleteCar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'ON_RENT' | 'MAINTENANCE'>('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'INVESTOR' | 'COMPANY'>('ALL');

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        car.plateNumber.toLowerCase().includes(q) ||
        car.make.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.color.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || car.status === statusFilter;
      const matchesOwnership = ownershipFilter === 'ALL' || car.ownership === ownershipFilter;

      return matchesSearch && matchesStatus && matchesOwnership;
    });
  }, [cars, searchTerm, statusFilter, ownershipFilter]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-serif">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-serif">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 font-serif">
            <CarIcon className="text-slate-800" />
            Vehicle Fleet Management (گاڑیوں کا ریکارڈ)
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-serif">
            Total {cars.length} vehicles registered &bull; {cars.filter(c => c.status === 'AVAILABLE').length} Available &bull; {cars.filter(c => c.status === 'ON_RENT').length} On Rent
          </p>
        </div>

        <button
          onClick={onOpenAddCar}
          className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-2 transition active:scale-95 self-start sm:self-auto font-serif"
        >
          <Plus size={16} /> Add New Vehicle
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-sm font-serif">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Plate (e.g. ICT-123), Make, Model..."
            className="w-full pl-10 custom-input font-serif"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end font-serif">
          
          <div className="flex items-center gap-1 bg-[#faf9f5] p-1 rounded-lg border border-slate-300">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-md font-bold transition font-serif ${
                statusFilter === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              All ({cars.length})
            </button>
            <button
              onClick={() => setStatusFilter('AVAILABLE')}
              className={`px-3 py-1 rounded-md font-bold transition font-serif ${
                statusFilter === 'AVAILABLE' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Available ({cars.filter(c => c.status === 'AVAILABLE').length})
            </button>
            <button
              onClick={() => setStatusFilter('ON_RENT')}
              className={`px-3 py-1 rounded-md font-bold transition font-serif ${
                statusFilter === 'ON_RENT' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              On Rent ({cars.filter(c => c.status === 'ON_RENT').length})
            </button>
            <button
              onClick={() => setStatusFilter('MAINTENANCE')}
              className={`px-3 py-1 rounded-md font-bold transition font-serif ${
                statusFilter === 'MAINTENANCE' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Workshop ({cars.filter(c => c.status === 'MAINTENANCE').length})
            </button>
          </div>

          <select
            value={ownershipFilter}
            onChange={(e) => setOwnershipFilter(e.target.value as any)}
            className="custom-input py-1.5 font-serif font-bold"
          >
            <option value="ALL">All Ownership</option>
            <option value="INVESTOR">Investor Cars</option>
            <option value="COMPANY">Company Owned</option>
          </select>

        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredCars.length === 0 ? (
        <div className="bg-white border border-slate-200 py-16 text-center text-slate-500 text-xs rounded-xl font-serif font-bold">
          No vehicles match the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-serif">
          {filteredCars.map((car) => {
            const investor = car.investorId ? investors.find(i => i.id === car.investorId) : null;
            const activeBooking = bookings.find(b => b.carId === car.id && b.status === 'ACTIVE');
            const activeClient = activeBooking ? clients.find(c => c.id === activeBooking.clientId) : null;

            return (
              <div 
                key={car.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-400 shadow-sm flex flex-col justify-between transition-all"
              >
                {/* Card Top Banner */}
                <div className="p-4 bg-[#faf9f5] border-b border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-slate-900 tracking-wider font-serif">{car.plateNumber}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-bold font-serif">
                        {car.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-bold mt-0.5 font-serif">
                      {car.make} {car.model} ({car.year})
                    </div>
                  </div>

                  <div>
                    {car.status === 'AVAILABLE' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold font-serif">
                        Available
                      </span>
                    )}
                    {car.status === 'ON_RENT' && (
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-bold font-serif">
                        On Rent
                      </span>
                    )}
                    {car.status === 'MAINTENANCE' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold font-serif">
                        Workshop
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-4 space-y-3 text-xs font-serif">
                  
                  {/* If On Rent -> Active Dispatch Badge */}
                  {car.status === 'ON_RENT' && activeClient && activeBooking && (
                    <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-[11px] space-y-1 font-serif">
                      <div className="text-blue-900 font-bold flex items-center gap-1.5 font-serif">
                        <User size={12} /> Rented To: {activeClient.name}
                      </div>
                      <div className="text-slate-600 flex items-center justify-between font-serif">
                        <span>Return Due:</span>
                        <span className="text-slate-900 font-bold font-serif">{new Date(activeBooking.expectedReturnDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Specs & Rate */}
                  <div className="grid grid-cols-2 gap-2 text-slate-700 bg-[#faf9f5] p-2.5 rounded-lg border border-slate-200 font-serif">
                    <div className="flex items-center gap-1.5 font-serif font-bold">
                      <Gauge size={13} className="text-slate-500" />
                      <span>{car.currentOdometer.toLocaleString()} KM</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-serif font-bold">
                      <Fuel size={13} className="text-slate-500" />
                      <span>{car.fuelType} ({car.transmission})</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200 flex justify-between font-bold text-slate-900 font-serif">
                      <span className="text-slate-600">Daily Rent Rate:</span>
                      <span className="text-slate-900 font-serif">{settings.currency} {car.dailyRate.toLocaleString()} / day</span>
                    </div>
                  </div>

                  {/* Ownership Info */}
                  <div className="text-[11px] text-slate-600 flex items-center justify-between font-serif">
                    <span>Ownership:</span>
                    {car.ownership === 'INVESTOR' && investor ? (
                      <span className="text-amber-800 font-bold truncate max-w-[140px] font-serif" title={investor.name}>
                        Investor: {investor.name}
                      </span>
                    ) : (
                      <span className="text-emerald-800 font-bold font-serif">Company Fleet</span>
                    )}
                  </div>

                </div>

                {/* Card Action Buttons */}
                <div className="p-3 bg-[#faf9f5] border-t border-slate-200 flex items-center justify-between gap-1 text-xs font-serif">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectCar(car)}
                      className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                      title="View 360 Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onLogMaintenance(car)}
                      className="p-1.5 text-slate-700 hover:text-amber-700 hover:bg-slate-200 rounded-md transition"
                      title="Log Service / Oil Change"
                    >
                      <Wrench size={16} />
                    </button>
                    <button
                      onClick={() => onOpenEditCar(car)}
                      className="p-1.5 text-slate-700 hover:text-blue-700 hover:bg-slate-200 rounded-md transition"
                      title="Edit Vehicle Specs"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteCar(car)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-200 rounded-md transition"
                      title="Delete Vehicle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {car.status === 'AVAILABLE' && (
                    <button
                      onClick={() => onRentOutCar(car)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1 transition font-serif"
                    >
                      <Key size={13} /> Rent Out
                    </button>
                  )}

                  {car.status === 'ON_RENT' && activeBooking && (
                    <button
                      onClick={() => onReceiveReturn(activeBooking)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm flex items-center gap-1 transition font-serif"
                    >
                      <CheckCircle size={13} /> Receive
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};


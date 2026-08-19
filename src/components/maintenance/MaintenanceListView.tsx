import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  DollarSign, 
  Trash2
} from 'lucide-react';
import { MaintenanceRecord, Car as CarType, CompanySettings, ServiceType } from '../../types';

interface MaintenanceListViewProps {
  maintenanceRecords: MaintenanceRecord[];
  cars: CarType[];
  settings: CompanySettings;
  onOpenAddMaintenance: (preSelectedCar?: CarType) => void;
  onDeleteMaintenance: (record: MaintenanceRecord) => void;
  onSelectCar: (car: CarType) => void;
}

export const MaintenanceListView: React.FC<MaintenanceListViewProps> = ({
  maintenanceRecords,
  cars,
  settings,
  onOpenAddMaintenance,
  onDeleteMaintenance,
  onSelectCar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ServiceType>('ALL');

  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter(m => {
      const car = cars.find(c => c.id === m.carId);
      const q = searchTerm.toLowerCase().trim();

      const matchesSearch = 
        m.description.toLowerCase().includes(q) ||
        m.vendorName.toLowerCase().includes(q) ||
        (m.invoiceNumber && m.invoiceNumber.toLowerCase().includes(q)) ||
        (car && (car.plateNumber.toLowerCase().includes(q) || car.model.toLowerCase().includes(q)));

      const matchesType = typeFilter === 'ALL' || m.serviceType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [maintenanceRecords, cars, searchTerm, typeFilter]);

  const totalCost = filteredRecords.reduce((sum, m) => sum + m.cost, 0);

  const getServiceTypeBadge = (type: ServiceType) => {
    const map: Record<ServiceType, { label: string; bg: string; text: string }> = {
      OIL_CHANGE: { label: 'Oil & Filters Change', bg: 'bg-amber-100', text: 'text-amber-800' },
      TYRES: { label: 'Tyres & Alignment', bg: 'bg-blue-100', text: 'text-blue-800' },
      BRAKES: { label: 'Brakes & Rotors', bg: 'bg-rose-100', text: 'text-rose-800' },
      AC_SERVICE: { label: 'AC Service & Gas', bg: 'bg-blue-100', text: 'text-blue-800' },
      ENGINE_WORK: { label: 'Engine Repair', bg: 'bg-purple-100', text: 'text-purple-800' },
      BODY_PAINT: { label: 'Body & Paint / Denting', bg: 'bg-pink-100', text: 'text-pink-800' },
      GENERAL_TUNING: { label: 'General Tuning / Inspection', bg: 'bg-emerald-100', text: 'text-emerald-800' },
      SUSPENSION: { label: 'Suspension & Shocks', bg: 'bg-orange-100', text: 'text-orange-800' },
      BATTERY: { label: 'Battery Replacement', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      OTHER: { label: 'Other Repair', bg: 'bg-slate-100', text: 'text-slate-800' }
    };
    const conf = map[type] || map.OTHER;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-serif ${conf.bg} ${conf.text}`}>
        {conf.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-serif">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-serif">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 font-serif">
            <Wrench className="text-slate-800" />
            Maintenance, Repairs & Oil Change Logs (گاڑیوں کی مرمت)
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-serif">
            Complete vehicle-wise service logs, parts replacements, mechanic invoices, and maintenance cost accounting.
          </p>
        </div>

        <button
          onClick={() => onOpenAddMaintenance()}
          className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-2 transition active:scale-95 self-start sm:self-auto font-serif"
        >
          <Plus size={16} /> + Log Maintenance / Repair
        </button>
      </div>

      {/* Filter & Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 font-serif">
        
        <div className="lg:col-span-3 bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-sm font-serif">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Car Plate, Vendor, Description..."
              className="w-full pl-10 custom-input font-serif"
            />
          </div>

          <div className="w-full md:w-auto font-serif">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full md:w-auto custom-input py-1.5 font-serif font-bold"
            >
              <option value="ALL">All Service Types</option>
              <option value="OIL_CHANGE">Oil & Filters Change</option>
              <option value="BRAKES">Brakes & Rotors</option>
              <option value="TYRES">Tyres & Alignment</option>
              <option value="AC_SERVICE">AC Service</option>
              <option value="ENGINE_WORK">Engine Repair</option>
              <option value="BODY_PAINT">Body & Paint</option>
              <option value="GENERAL_TUNING">General Tuning</option>
              <option value="SUSPENSION">Suspension</option>
              <option value="BATTERY">Battery</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Total Cost Widget */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm font-serif">
          <div>
            <span className="text-slate-600 text-xs font-bold uppercase font-serif">Total Maintenance Cost</span>
            <div className="text-xl font-bold text-rose-800 font-serif mt-1">
              {settings.currency} {totalCost.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
            <DollarSign size={20} />
          </div>
        </div>

      </div>

      {/* Maintenance Logs List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 py-16 text-center text-slate-500 text-xs rounded-xl font-serif font-bold">
          No maintenance records logged. Click "+ Log Maintenance / Repair" to add one.
        </div>
      ) : (
        <div className="space-y-3 font-serif">
          {filteredRecords.map(m => {
            const car = cars.find(c => c.id === m.carId);

            return (
              <div 
                key={m.id}
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-sm font-serif"
              >
                <div className="flex items-start gap-3.5 font-serif">
                  <div className="p-3 bg-[#faf9f5] border border-slate-300 text-slate-800 rounded-lg shrink-0 mt-0.5 font-serif">
                    <Wrench size={22} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap font-serif">
                      {car ? (
                        <button
                          onClick={() => onSelectCar(car)}
                          className="font-bold text-slate-900 text-sm hover:underline font-serif"
                        >
                          {car.plateNumber}
                        </button>
                      ) : (
                        <span className="text-slate-500 font-serif">Vehicle Removed</span>
                      )}
                      
                      {car && <span className="text-slate-700 font-bold font-serif">({car.make} {car.model})</span>}
                      {getServiceTypeBadge(m.serviceType)}
                    </div>

                    <p className="text-slate-800 mt-2 text-xs leading-relaxed max-w-2xl font-serif">
                      {m.description}
                    </p>

                    <div className="text-slate-600 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-serif">
                      <span>Service Date: <strong className="text-slate-900 font-serif">{new Date(m.serviceDate).toLocaleDateString()}</strong></span>
                      <span>&bull;</span>
                      <span>Odometer at Service: <strong className="text-slate-900 font-serif">{m.odometer.toLocaleString()} KM</strong></span>
                      {m.nextServiceOdometer && (
                        <>
                          <span>&bull;</span>
                          <span>Next Service Due: <strong className="text-amber-800 font-bold font-serif">{m.nextServiceOdometer.toLocaleString()} KM</strong></span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span>Workshop: <strong className="text-slate-900 font-serif">{m.vendorName}</strong> {m.invoiceNumber ? `(Inv #${m.invoiceNumber})` : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center shrink-0 font-serif">
                  <div className="text-right font-serif">
                    <div className="text-[10px] text-slate-600 font-bold uppercase font-serif">Cost / Kharcha</div>
                    <div className="text-lg font-bold text-rose-800 font-serif">
                      {settings.currency} {m.cost.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMaintenance(m)}
                    className="p-2 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded-md transition"
                    title="Delete Maintenance Record"
                  >
                    <Trash2 size={16} />
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


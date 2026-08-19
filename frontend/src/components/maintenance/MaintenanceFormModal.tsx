import React, { useState, useEffect } from 'react';
import { X, Wrench, Save, DollarSign } from 'lucide-react';
import { MaintenanceRecord, Car as CarType, ServiceType } from '../../types';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  cars: CarType[];
  preSelectedCar?: CarType | null;
  onClose: () => void;
  onSave: (record: Partial<MaintenanceRecord>) => void;
}

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  cars,
  preSelectedCar,
  onClose,
  onSave
}) => {
  const [carId, setCarId] = useState<string>('');
  const [serviceDate, setServiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState<ServiceType>('OIL_CHANGE');
  const [description, setDescription] = useState<string>('');
  const [cost, setCost] = useState<number>(12000);
  const [odometer, setOdometer] = useState<number>(0);
  const [nextServiceOdometer, setNextServiceOdometer] = useState<number>(0);
  const [nextServiceDate, setNextServiceDate] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('Toyota 3S Motors');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');

  useEffect(() => {
    if (preSelectedCar) {
      setCarId(preSelectedCar.id);
      setOdometer(preSelectedCar.currentOdometer);
      setNextServiceOdometer(preSelectedCar.currentOdometer + 5000);
    } else if (cars.length > 0 && !carId) {
      setCarId(cars[0].id);
      setOdometer(cars[0].currentOdometer);
      setNextServiceOdometer(cars[0].currentOdometer + 5000);
    }
  }, [isOpen, preSelectedCar, cars]);

  const handleCarChange = (id: string) => {
    setCarId(id);
    const car = cars.find(c => c.id === id);
    if (car) {
      setOdometer(car.currentOdometer);
      setNextServiceOdometer(car.currentOdometer + 5000);
    }
  };

  const handleServiceTypeChange = (type: ServiceType) => {
    setServiceType(type);
    if (type === 'OIL_CHANGE') {
      setDescription('Engine Oil Replacement (Synthetic 5W-30), Oil Filter, Air Filter, AC Filter replacement & General Tuning.');
      setNextServiceOdometer(Number(odometer) + 5000);
    } else if (type === 'BRAKES') {
      setDescription('Front & rear brake pads replacement, brake disc resurfacing, brake fluid top-up.');
    } else if (type === 'TYRES') {
      setDescription('Installed new tyres + computerized wheel alignment and high-speed balancing.');
    } else if (type === 'AC_SERVICE') {
      setDescription('AC gas refill, compressor oil check, condenser cleaning, cabin filter replacement.');
    } else if (type === 'ENGINE_WORK') {
      setDescription('Spark plugs replacement, throttle body service, catalytic converter cleaning.');
    } else if (type === 'BODY_PAINT') {
      setDescription('Bumper denting and paint touch-up, polish and ceramic spray.');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      carId,
      serviceDate,
      serviceType,
      description: description.trim(),
      cost: Number(cost),
      odometer: Number(odometer),
      nextServiceOdometer: nextServiceOdometer ? Number(nextServiceOdometer) : undefined,
      nextServiceDate: nextServiceDate || undefined,
      vendorName: vendorName.trim(),
      invoiceNumber: invoiceNumber.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl my-8 bg-slateDark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-cyan-950/80 to-slateDark-850 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl">
              <Wrench size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Log Vehicle Maintenance & Repair</h2>
              <p className="text-xs text-slate-400">
                Record oil change, mechanical repair, parts replacement, and workshop invoice.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Car */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Select Vehicle *</label>
              <select
                value={carId}
                onChange={(e) => handleCarChange(e.target.value)}
                required
                className="w-full custom-input font-bold text-white"
              >
                {cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.plateNumber} &bull; {car.make} {car.model} ({car.year}) &bull; Current Odo: {car.currentOdometer.toLocaleString()} KM
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Service / Repair Category *</label>
              <select
                value={serviceType}
                onChange={(e) => handleServiceTypeChange(e.target.value as ServiceType)}
                className="w-full custom-input"
              >
                <option value="OIL_CHANGE">Oil & Filters Change</option>
                <option value="BRAKES">Brakes & Rotors Service</option>
                <option value="TYRES">Tyres & Wheel Alignment</option>
                <option value="AC_SERVICE">AC Service & Gas</option>
                <option value="ENGINE_WORK">Engine Mechanical Work</option>
                <option value="BODY_PAINT">Body Denting & Paint</option>
                <option value="GENERAL_TUNING">General Tuning / Inspection</option>
                <option value="SUSPENSION">Suspension & Shocks</option>
                <option value="BATTERY">Battery Replacement</option>
                <option value="OTHER">Other Repair / Maintenance</option>
              </select>
            </div>

            {/* Service Date */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Service Date *</label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full custom-input"
              />
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Detailed Work Description / Parts Replaced *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what was repaired, brand of parts used, oil grade, mechanic notes..."
                className="w-full custom-input"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Maintenance Cost (PKR) *</label>
              <input
                type="number"
                min="0"
                required
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full custom-input font-bold text-rose-400 text-sm"
              />
            </div>

            {/* Odometer */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Odometer at Service (KM) *</label>
              <input
                type="number"
                min="0"
                required
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                className="w-full custom-input font-mono"
              />
            </div>

            {/* Next Service Due */}
            <div>
              <label className="block text-slate-400 mb-1">Next Service Due Odometer (KM)</label>
              <input
                type="number"
                value={nextServiceOdometer}
                onChange={(e) => setNextServiceOdometer(Number(e.target.value))}
                placeholder="e.g. 50000"
                className="w-full custom-input font-mono text-amber-300"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Next Service Due Date (Optional)</label>
              <input
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
                className="w-full custom-input"
              />
            </div>

            {/* Vendor / Workshop */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Workshop / Vendor Name *</label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Toyota Ravi Motors, AutoTech Workshop"
                className="w-full custom-input"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Workshop Invoice / Bill Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. TRM-9912"
                className="w-full custom-input font-mono uppercase"
              />
            </div>

          </div>

          {/* Footer */}
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition"
            >
              <Save size={16} /> Save Maintenance Entry
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

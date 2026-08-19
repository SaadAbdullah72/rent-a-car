import React, { useState, useEffect } from 'react';
import { X, Car as CarIcon, Save, AlertTriangle } from 'lucide-react';
import { Car, Investor, CarCategory, FuelType, TransmissionType, OwnershipType } from '../../types';

interface CarFormModalProps {
  isOpen: boolean;
  editingCar: Car | null;
  investors: Investor[];
  existingCars: Car[];
  onClose: () => void;
  onSave: (car: Partial<Car>) => void;
}

export const CarFormModal: React.FC<CarFormModalProps> = ({
  isOpen,
  editingCar,
  investors,
  existingCars,
  onClose,
  onSave
}) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [color, setColor] = useState('White');
  const [category, setCategory] = useState<CarCategory>('Sedan');
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState<number>(0);
  const [dailyRate, setDailyRate] = useState<number>(7000);
  const [monthlyRate, setMonthlyRate] = useState<number>(140000);
  const [ownership, setOwnership] = useState<OwnershipType>('INVESTOR');
  const [investorId, setInvestorId] = useState<string>(investors[0]?.id || '');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [transmission, setTransmission] = useState<TransmissionType>('Automatic');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingCar) {
      setPlateNumber(editingCar.plateNumber);
      setMake(editingCar.make);
      setModel(editingCar.model);
      setYear(editingCar.year);
      setColor(editingCar.color);
      setCategory(editingCar.category);
      setEngineNumber(editingCar.engineNumber || '');
      setChassisNumber(editingCar.chassisNumber || '');
      setCurrentOdometer(editingCar.currentOdometer);
      setDailyRate(editingCar.dailyRate);
      setMonthlyRate(editingCar.monthlyRate);
      setOwnership(editingCar.ownership);
      setInvestorId(editingCar.investorId || (investors[0]?.id || ''));
      setFuelType(editingCar.fuelType);
      setTransmission(editingCar.transmission);
      setError('');
    } else {
      setPlateNumber('');
      setMake('Toyota');
      setModel('');
      setYear(2024);
      setColor('White');
      setCategory('Sedan');
      setEngineNumber('');
      setChassisNumber('');
      setCurrentOdometer(15000);
      setDailyRate(7000);
      setMonthlyRate(140000);
      setOwnership(investors.length > 0 ? 'INVESTOR' : 'COMPANY');
      setInvestorId(investors[0]?.id || '');
      setFuelType('Petrol');
      setTransmission('Automatic');
      setError('');
    }
  }, [editingCar, isOpen, investors]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedPlate = plateNumber.trim().toUpperCase();

    // Check duplicate plate
    const isDuplicate = existingCars.some(
      c => c.plateNumber.toUpperCase() === formattedPlate && (!editingCar || c.id !== editingCar.id)
    );

    if (isDuplicate) {
      setError(`A vehicle with Registration Plate "${formattedPlate}" already exists! Vehicle plates must be unique.`);
      return;
    }

    onSave({
      id: editingCar ? editingCar.id : undefined,
      plateNumber: formattedPlate,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      color: color.trim(),
      category,
      engineNumber: engineNumber.trim(),
      chassisNumber: chassisNumber.trim(),
      currentOdometer: Number(currentOdometer),
      dailyRate: Number(dailyRate),
      monthlyRate: Number(monthlyRate),
      ownership,
      investorId: ownership === 'INVESTOR' ? investorId : undefined,
      fuelType,
      transmission,
      status: editingCar ? editingCar.status : 'AVAILABLE'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl my-8 bg-slateDark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slateDark-850 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-xl">
              <CarIcon size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingCar ? `Edit Vehicle: ${editingCar.plateNumber}` : 'Add New Vehicle to Fleet'}
              </h2>
              <p className="text-xs text-slate-400">
                Enter vehicle registration, make, model, rates, and investor linkage.
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

        {/* Error alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Number Plate */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Registration Plate Number (Unique) *
              </label>
              <input
                type="text"
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="e.g. LEA-2024-88 or ICT-991"
                className="w-full custom-input uppercase font-mono font-bold text-brand-300"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CarCategory)}
                className="w-full custom-input"
              >
                <option value="Sedan">Sedan (Corolla, Civic, Yaris)</option>
                <option value="SUV">SUV / 4x4 (Sportage, Fortuner, Revo)</option>
                <option value="Hatchback">Hatchback (Alto, Cultus, Swift)</option>
                <option value="Luxury">Luxury / Executive (Sonata, Prado, Audi)</option>
                <option value="Van">Van / Hiace / Grand Cabin</option>
                <option value="Crossover">Crossover</option>
              </select>
            </div>

            {/* Make */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Make / Brand *</label>
              <input
                type="text"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Toyota, Honda, Hyundai, Kia, Suzuki"
                className="w-full custom-input"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Model & Variant *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Corolla Grande 1.8 CVT"
                className="w-full custom-input"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Manufacturing Year *</label>
              <input
                type="number"
                min="1990"
                max="2035"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full custom-input"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Color *</label>
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Super White, Metallic Grey, Black"
                className="w-full custom-input"
              />
            </div>

            {/* Fuel & Transmission */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full custom-input"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Transmission</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                className="w-full custom-input"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Rates & Odometer */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Daily Rental Rate (PKR) *</label>
              <input
                type="number"
                min="0"
                required
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full custom-input text-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Monthly Contract Rate (PKR)</label>
              <input
                type="number"
                min="0"
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(Number(e.target.value))}
                className="w-full custom-input text-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Odometer (KM) *</label>
              <input
                type="number"
                min="0"
                required
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(Number(e.target.value))}
                className="w-full custom-input font-mono"
              />
            </div>

            {/* Ownership Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ownership *</label>
              <select
                value={ownership}
                onChange={(e) => setOwnership(e.target.value as OwnershipType)}
                className="w-full custom-input"
              >
                <option value="INVESTOR">Investor Provided Vehicle</option>
                <option value="COMPANY">Company Owned</option>
              </select>
            </div>

            {/* Investor Selector */}
            {ownership === 'INVESTOR' && (
              <div className="col-span-1 md:col-span-2 p-3 bg-slateDark-850 rounded-xl border border-slate-800">
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Associated Investor (Owner) *
                </label>
                {investors.length === 0 ? (
                  <div className="text-amber-400 text-xs py-1">
                    No investors found in system. Please add an investor first or choose Company Owned.
                  </div>
                ) : (
                  <select
                    value={investorId}
                    onChange={(e) => setInvestorId(e.target.value)}
                    required={ownership === 'INVESTOR'}
                    className="w-full custom-input"
                  >
                    {investors.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} (CNIC: {inv.cnic}) &bull; {inv.payoutType === 'FIXED_MONTHLY' ? `Rs. ${inv.payoutAmount.toLocaleString()}/mo` : `${inv.payoutAmount}% share`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Engine & Chassis */}
            <div>
              <label className="block text-slate-400 mb-1">Engine Number (Optional)</label>
              <input
                type="text"
                value={engineNumber}
                onChange={(e) => setEngineNumber(e.target.value)}
                placeholder="e.g. 2ZR-889912"
                className="w-full custom-input font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Chassis Number (Optional)</label>
              <input
                type="text"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                placeholder="e.g. NZE170-445566"
                className="w-full custom-input font-mono uppercase"
              />
            </div>

          </div>

          {/* Footer Actions */}
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-950/40 flex items-center gap-2 transition"
            >
              <Save size={16} />
              {editingCar ? 'Update Vehicle' : 'Register Vehicle'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

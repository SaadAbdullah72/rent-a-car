import React, { useState, useEffect } from 'react';
import { X, Key, Car as CarIcon, User, Calendar, DollarSign, Gauge, Fuel, Printer, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Car, Client, Booking, CompanySettings, FuelLevel } from '../../types';
import { PdfGenerator } from '../../services/pdfGenerator';

interface NewBookingModalProps {
  isOpen: boolean;
  cars: Car[];
  clients: Client[];
  settings: CompanySettings;
  preSelectedCar?: Car | null;
  preSelectedClient?: Client | null;
  existingBookings: Booking[];
  onClose: () => void;
  onSaveBooking: (booking: Partial<Booking>, client?: Partial<Client>, printPdf?: boolean) => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  cars,
  clients,
  settings,
  preSelectedCar,
  preSelectedClient,
  existingBookings,
  onClose,
  onSaveBooking
}) => {
  const availableCars = cars.filter(c => c.status === 'AVAILABLE' || (preSelectedCar && c.id === preSelectedCar.id));

  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [clientMode, setClientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // New Client quick fields
  const [newClientName, setNewClientName] = useState('');
  const [newClientCnic, setNewClientCnic] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientLicense, setNewClientLicense] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  // Booking fields
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>(
    new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16)
  );
  const [rateType, setRateType] = useState<'DAILY' | 'MONTHLY' | 'CUSTOM'>('DAILY');
  const [ratePerUnit, setRatePerUnit] = useState<number>(7000);
  const [advancePaid, setAdvancePaid] = useState<number>(5000);
  const [securityDeposit, setSecurityDeposit] = useState<number>(30000);
  const [startOdometer, setStartOdometer] = useState<number>(0);
  const [startFuelLevel, setStartFuelLevel] = useState<FuelLevel>('Full');
  const [destination, setDestination] = useState<string>('Local Lahore Trip');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (preSelectedCar) {
      setSelectedCarId(preSelectedCar.id);
      setRatePerUnit(preSelectedCar.dailyRate);
      setStartOdometer(preSelectedCar.currentOdometer);
    } else if (availableCars.length > 0 && !selectedCarId) {
      setSelectedCarId(availableCars[0].id);
      setRatePerUnit(availableCars[0].dailyRate);
      setStartOdometer(availableCars[0].currentOdometer);
    }

    if (preSelectedClient) {
      setClientMode('EXISTING');
      setSelectedClientId(preSelectedClient.id);
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }

    setStartDate(new Date().toISOString().slice(0, 16));
    setExpectedReturnDate(new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16));
    setError('');
  }, [isOpen, preSelectedCar, preSelectedClient, cars, clients]);

  // When car changes, auto-update rate & odometer
  const handleCarChange = (carId: string) => {
    setSelectedCarId(carId);
    const car = cars.find(c => c.id === carId);
    if (car) {
      setRatePerUnit(car.dailyRate);
      setStartOdometer(car.currentOdometer);
    }
  };

  if (!isOpen) return null;

  // Calculate rental duration in days
  const startMs = new Date(startDate).getTime();
  const returnMs = new Date(expectedReturnDate).getTime();
  const diffHours = Math.max(1, (returnMs - startMs) / (1000 * 60 * 60));
  const calculatedDays = Math.max(1, Math.ceil(diffHours / 24));
  const totalEstimatedRent = rateType === 'MONTHLY' 
    ? Math.round((ratePerUnit / 30) * calculatedDays)
    : ratePerUnit * calculatedDays;
  const balanceDue = Math.max(0, totalEstimatedRent - advancePaid);

  const handleSubmit = (e: React.FormEvent, printPdf: boolean = false) => {
    e.preventDefault();
    setError('');

    const car = cars.find(c => c.id === selectedCarId);
    if (!car) {
      setError('Please select a valid vehicle to rent out.');
      return;
    }

    let clientId = selectedClientId;
    let newClientData: Partial<Client> | undefined = undefined;

    if (clientMode === 'NEW') {
      const cnicFormatted = newClientCnic.trim();
      if (!newClientName.trim() || !cnicFormatted || !newClientPhone.trim()) {
        setError('Please complete the new client information (Name, CNIC, Phone).');
        return;
      }

      // Check duplicate CNIC
      const exists = clients.some(c => c.cnic.trim() === cnicFormatted);
      if (exists) {
        setError(`A client with CNIC "${cnicFormatted}" is already registered. Please select them under "Existing Client".`);
        return;
      }

      clientId = `cl-${Date.now()}`;
      newClientData = {
        id: clientId,
        name: newClientName.trim(),
        cnic: cnicFormatted,
        phone: newClientPhone.trim(),
        licenseNumber: newClientLicense.trim() || 'Pending',
        address: newClientAddress.trim() || 'N/A',
        securityDepositHeld: Number(securityDeposit),
        totalRentalsCount: 1,
        createdAt: new Date().toISOString()
      };
    }

    const bookingNumber = `BK-${new Date().getFullYear()}-${String(existingBookings.length + 101).padStart(3, '0')}`;

    const newBooking: Partial<Booking> = {
      bookingNumber,
      carId: selectedCarId,
      clientId,
      startDate: new Date(startDate).toISOString(),
      expectedReturnDate: new Date(expectedReturnDate).toISOString(),
      rateType,
      ratePerUnit: Number(ratePerUnit),
      totalDays: calculatedDays,
      totalEstimatedRent,
      advancePaid: Number(advancePaid),
      securityDeposit: Number(securityDeposit),
      startOdometer: Number(startOdometer),
      startFuelLevel,
      destination: destination.trim(),
      status: 'ACTIVE',
      extraCharges: {
        lateFee: 0,
        damageFee: 0,
        fuelFee: 0,
        extraKmFee: 0
      },
      discount: 0,
      paymentStatus: advancePaid >= totalEstimatedRent ? 'PAID' : (advancePaid > 0 ? 'PARTIAL' : 'DUE'),
      notes: notes.trim()
    };

    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}

    onSaveBooking(newBooking, newClientData, printPdf);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-8 bg-slateDark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-brand-950/80 to-slateDark-850 border-b border-brand-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 text-brand-400 border border-brand-500/30 rounded-xl">
              <Key size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Rent Out Vehicle (New Rental Dispatch)</h2>
              <p className="text-xs text-slate-400">
                Select an available car, assign customer, set rental rates, and generate agreement contract.
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

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-5 text-xs">
          
          {/* 1. Vehicle Selection */}
          <div className="p-4 bg-slateDark-850 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-brand-400 flex items-center gap-2">
              <CarIcon size={16} /> 1. Select Available Vehicle (گاڑی کا انتخاب)
            </h3>

            {availableCars.length === 0 ? (
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg text-xs">
                No vehicles are currently Available in the yard. All cars are on rent or in workshop.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Available Fleet Vehicle *</label>
                  <select
                    value={selectedCarId}
                    onChange={(e) => handleCarChange(e.target.value)}
                    required
                    className="w-full custom-input font-bold text-white"
                  >
                    {availableCars.map(car => (
                      <option key={car.id} value={car.id}>
                        {car.plateNumber} &bull; {car.make} {car.model} ({car.year}) &bull; {car.color} &bull; {settings.currency} {car.dailyRate.toLocaleString()}/day
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Starting Odometer Reading (KM) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={startOdometer}
                    onChange={(e) => setStartOdometer(Number(e.target.value))}
                    className="w-full custom-input font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Starting Fuel Level *</label>
                  <select
                    value={startFuelLevel}
                    onChange={(e) => setStartFuelLevel(e.target.value as FuelLevel)}
                    className="w-full custom-input"
                  >
                    <option value="Full">Full Tank</option>
                    <option value="3/4">3/4 Tank</option>
                    <option value="1/2">1/2 Tank</option>
                    <option value="1/4">1/4 Tank</option>
                    <option value="Reserve">Reserve</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 2. Customer Selection */}
          <div className="p-4 bg-slateDark-850 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <User size={16} /> 2. Customer / Client Information (کسٹمر)
              </h3>

              <div className="flex items-center gap-1 bg-slateDark-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setClientMode('EXISTING')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                    clientMode === 'EXISTING' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Existing Customer
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('NEW')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                    clientMode === 'NEW' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + New Customer
                </button>
              </div>
            </div>

            {clientMode === 'EXISTING' ? (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Registered Client *</label>
                {clients.length === 0 ? (
                  <div className="text-amber-400 text-xs py-1">No registered clients found. Please select "+ New Customer".</div>
                ) : (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full custom-input font-medium text-white"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} &bull; CNIC: {c.cnic} &bull; Mobile: {c.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required={clientMode === 'NEW'}
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Asad Mehmood"
                    className="w-full custom-input"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CNIC (Unique) *</label>
                  <input
                    type="text"
                    required={clientMode === 'NEW'}
                    value={newClientCnic}
                    onChange={(e) => setNewClientCnic(e.target.value)}
                    placeholder="35201-1234567-9"
                    className="w-full custom-input font-mono font-bold text-emerald-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required={clientMode === 'NEW'}
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="0300-9876543"
                    className="w-full custom-input font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Driving License Number</label>
                  <input
                    type="text"
                    value={newClientLicense}
                    onChange={(e) => setNewClientLicense(e.target.value)}
                    placeholder="LHR-DL-2022-8811"
                    className="w-full custom-input font-mono uppercase"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-slate-300 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    placeholder="Address in city"
                    className="w-full custom-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Rental Duration & Financial Rates */}
          <div className="p-4 bg-slateDark-850 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <DollarSign size={16} /> 3. Rental Period, Rates & Advance Payments
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dispatch Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expected Return Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rate Application</label>
                <select
                  value={rateType}
                  onChange={(e) => setRateType(e.target.value as any)}
                  className="w-full custom-input"
                >
                  <option value="DAILY">Daily Rental Rate</option>
                  <option value="MONTHLY">Monthly Contract Rate</option>
                  <option value="CUSTOM">Custom Package Rate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rate per Unit (PKR) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(Number(e.target.value))}
                  className="w-full custom-input font-bold text-brand-300"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Advance Payment Received (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(Number(e.target.value))}
                  className="w-full custom-input text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Security Deposit Held (Refundable)</label>
                <input
                  type="number"
                  min="0"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                  className="w-full custom-input text-cyan-400 font-bold"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-slate-300 mb-1">Destination / Allowed Area & Notes</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Islamabad to Murree trip, Local Lahore commute"
                  className="w-full custom-input"
                />
              </div>
            </div>

            {/* Calculations Banner */}
            <div className="mt-3 p-3.5 bg-slateDark-950/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400">Duration: </span>
                <strong className="text-white font-mono">{calculatedDays} Day(s)</strong>
              </div>
              <div>
                <span className="text-slate-400">Total Estimated Rent: </span>
                <strong className="text-brand-300 font-mono font-bold text-sm">{settings.currency} {totalEstimatedRent.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400">Advance: </span>
                <strong className="text-emerald-400 font-mono">{settings.currency} {advancePaid.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400">Estimated Balance at Return: </span>
                <strong className="text-amber-300 font-mono font-bold">{settings.currency} {balanceDue.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2 text-xs font-semibold text-brand-300 hover:text-white bg-brand-500/10 hover:bg-brand-600 border border-brand-500/30 rounded-xl flex items-center gap-2 transition"
            >
              <Printer size={16} /> Save & Print Rental Agreement (PDF)
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white transition font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={availableCars.length === 0}
                className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-950/40 flex items-center gap-2 transition disabled:opacity-50"
              >
                <Key size={16} /> Confirm & Dispatch Vehicle
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

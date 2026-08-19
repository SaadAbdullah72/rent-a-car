import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Car, User, Gauge, Fuel, DollarSign, FileText, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, Car as CarType, Client, CompanySettings, FuelLevel } from '../../types';
import { PdfGenerator } from '../../services/pdfGenerator';

interface ReceiveReturnModalProps {
  isOpen: boolean;
  booking: Booking | null;
  car: CarType | null;
  client: Client | null;
  settings: CompanySettings;
  onClose: () => void;
  onCompleteReturn: (updatedBooking: Booking, endingOdometer: number) => void;
}

export const ReceiveReturnModal: React.FC<ReceiveReturnModalProps> = ({
  isOpen,
  booking,
  car,
  client,
  settings,
  onClose,
  onCompleteReturn
}) => {
  if (!isOpen || !booking || !car || !client) return null;

  const [actualReturnDate, setActualReturnDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [endOdometer, setEndOdometer] = useState<number>(car.currentOdometer || booking.startOdometer);
  const [endFuelLevel, setEndFuelLevel] = useState<FuelLevel>('Full');
  const [lateFee, setLateFee] = useState<number>(0);
  const [damageFee, setDamageFee] = useState<number>(0);
  const [fuelFee, setFuelFee] = useState<number>(0);
  const [extraKmFee, setExtraKmFee] = useState<number>(0);
  const [damageNotes, setDamageNotes] = useState<string>('');
  const [discount, setDiscount] = useState<number>(booking.discount || 0);
  const [paymentSettled, setPaymentSettled] = useState<boolean>(true);

  // Auto-fill defaults
  useEffect(() => {
    if (booking) {
      setEndOdometer(Math.max(car.currentOdometer, booking.startOdometer));
      setDiscount(booking.discount || 0);
      setActualReturnDate(new Date().toISOString().slice(0, 16));
    }
  }, [booking, car]);

  const kmDriven = Math.max(0, endOdometer - booking.startOdometer);
  const totalExtraCharges = Number(lateFee) + Number(damageFee) + Number(fuelFee) + Number(extraKmFee);
  const finalTotalAmount = Math.max(0, booking.totalEstimatedRent + totalExtraCharges - Number(discount));
  const remainingBalanceDue = Math.max(0, finalTotalAmount - booking.advancePaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedBooking: Booking = {
      ...booking,
      actualReturnDate: new Date(actualReturnDate).toISOString(),
      endOdometer: Number(endOdometer),
      endFuelLevel,
      extraCharges: {
        lateFee: Number(lateFee),
        damageFee: Number(damageFee),
        fuelFee: Number(fuelFee),
        extraKmFee: Number(extraKmFee),
        description: damageNotes
      },
      discount: Number(discount),
      finalTotalAmount,
      finalBalancePaid: paymentSettled ? remainingBalanceDue : 0,
      paymentStatus: paymentSettled ? 'PAID' : (booking.advancePaid > 0 ? 'PARTIAL' : 'DUE'),
      status: 'COMPLETED'
    };

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    onCompleteReturn(updatedBooking, Number(endOdometer));
  };

  const handleDownloadInvoice = () => {
    const tempBooking: Booking = {
      ...booking,
      actualReturnDate: new Date(actualReturnDate).toISOString(),
      endOdometer: Number(endOdometer),
      endFuelLevel,
      extraCharges: {
        lateFee: Number(lateFee),
        damageFee: Number(damageFee),
        fuelFee: Number(fuelFee),
        extraKmFee: Number(extraKmFee),
        description: damageNotes
      },
      discount: Number(discount),
      finalTotalAmount,
      status: 'COMPLETED'
    };

    PdfGenerator.generateReturnReceipt(tempBooking, car, client, settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-8 bg-slateDark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-950/60 to-slateDark-850 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Receive Vehicle Return (گاڑی واپسی)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {booking.bookingNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect vehicle, log final kilometers, calculate settlements, and return vehicle to Available fleet.
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

        {/* Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slateDark-950/60 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Car size={16} className="text-brand-400" />
            <div>
              <div className="text-slate-400">Car Plate & Model</div>
              <div className="font-semibold text-white">{car.plateNumber} ({car.model})</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-emerald-400" />
            <div>
              <div className="text-slate-400">Client / CNIC</div>
              <div className="font-semibold text-white">{client.name}</div>
              <div className="text-[10px] text-slate-400">{client.cnic}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-amber-400" />
            <div>
              <div className="text-slate-400">Start Odometer</div>
              <div className="font-semibold text-white">{booking.startOdometer.toLocaleString()} KM</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-cyan-400" />
            <div>
              <div className="text-slate-400">Advance / Deposit</div>
              <div className="font-semibold text-white">{settings.currency} {booking.advancePaid.toLocaleString()} / {settings.currency} {booking.securityDeposit.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Inspection Section */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gauge size={16} className="text-brand-400" />
              1. Physical Vehicle Inspection & Readings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Actual Return Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={actualReturnDate}
                  onChange={(e) => setActualReturnDate(e.target.value)}
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ending Odometer Reading (KM) *
                </label>
                <input
                  type="number"
                  min={booking.startOdometer}
                  required
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(Number(e.target.value))}
                  className="w-full custom-input font-mono font-bold text-brand-300"
                />
                <div className="text-[11px] text-emerald-400 mt-1">
                  Driven: +{kmDriven.toLocaleString()} KM
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fuel Level at Return *
                </label>
                <select
                  value={endFuelLevel}
                  onChange={(e) => setEndFuelLevel(e.target.value as FuelLevel)}
                  className="w-full custom-input"
                >
                  <option value="Full">Full Tank</option>
                  <option value="3/4">3/4 Tank</option>
                  <option value="1/2">1/2 Tank</option>
                  <option value="1/4">1/4 Tank</option>
                  <option value="Reserve">Reserve</option>
                </select>
                <div className="text-[11px] text-slate-400 mt-1">
                  Dispatched at: {booking.startFuelLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Extra Charges & Adjustments */}
          <div className="p-4 bg-slateDark-850 rounded-xl border border-slate-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-amber-400" />
              2. Additional Charges & Adjustments
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Late Hours / Overtime Fee</label>
                <input
                  type="number"
                  min="0"
                  value={lateFee}
                  onChange={(e) => setLateFee(Number(e.target.value))}
                  placeholder="0"
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Damages / Denting Cost</label>
                <input
                  type="number"
                  min="0"
                  value={damageFee}
                  onChange={(e) => setDamageFee(Number(e.target.value))}
                  placeholder="0"
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Fuel Deficit Charge</label>
                <input
                  type="number"
                  min="0"
                  value={fuelFee}
                  onChange={(e) => setFuelFee(Number(e.target.value))}
                  placeholder="0"
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Discount Given</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full custom-input text-amber-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Damages / Inspection Remarks (if any)</label>
              <input
                type="text"
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="e.g. Scratched front bumper, left headlight clip repaired, clean interior"
                className="w-full custom-input text-xs"
              />
            </div>
          </div>

          {/* Final Settlement Calculation Card */}
          <div className="p-4 bg-gradient-to-br from-slateDark-850 to-slate-900 rounded-xl border border-slate-700/70">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Estimated Rent:</span>
                  <span className="font-semibold text-white">{settings.currency} {booking.totalEstimatedRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Additional Charges:</span>
                  <span className="font-semibold text-amber-400">+{settings.currency} {totalExtraCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Discount Applied:</span>
                  <span className="font-semibold text-emerald-400">-{settings.currency} {Number(discount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Advance Payment Made:</span>
                  <span className="font-semibold text-cyan-400">-{settings.currency} {booking.advancePaid.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-sm">
                  <span className="text-white">Net Balance Due from Client:</span>
                  <span className="text-emerald-400 text-base">{settings.currency} {remainingBalanceDue.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-slateDark-950/80 rounded-lg border border-slate-800 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettled}
                    onChange={(e) => setPaymentSettled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-400"
                  />
                  <span className="text-white font-medium">Mark Remaining Balance as Received in Cash/Bank</span>
                </label>
                
                <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-brand-400 shrink-0" />
                  Security Deposit ({settings.currency} {booking.securityDeposit.toLocaleString()}) to be refunded in full if no deductions.
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-2 transition"
            >
              <FileText size={16} />
              Print Return Invoice (PDF)
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition"
              >
                <CheckCircle size={18} />
                Receive Return & Make Available
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

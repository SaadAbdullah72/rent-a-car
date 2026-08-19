import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Printer, 
  CheckCircle, 
  XCircle, 
  Car, 
  Key
} from 'lucide-react';
import { Booking, Car as CarType, Client, CompanySettings, BookingStatus } from '../../types';
import { PdfGenerator } from '../../services/pdfGenerator';

interface BookingListViewProps {
  bookings: Booking[];
  cars: CarType[];
  clients: Client[];
  settings: CompanySettings;
  onOpenNewBooking: () => void;
  onReceiveReturn: (booking: Booking) => void;
  onCancelBooking: (booking: Booking) => void;
}

export const BookingListView: React.FC<BookingListViewProps> = ({
  bookings,
  cars,
  clients,
  settings,
  onOpenNewBooking,
  onReceiveReturn,
  onCancelBooking
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const car = cars.find(c => c.id === b.carId);
      const client = clients.find(c => c.id === b.clientId);
      const q = searchTerm.toLowerCase().trim();

      const matchesSearch = 
        b.bookingNumber.toLowerCase().includes(q) ||
        (car && (car.plateNumber.toLowerCase().includes(q) || car.model.toLowerCase().includes(q))) ||
        (client && (client.name.toLowerCase().includes(q) || client.cnic.toLowerCase().includes(q) || client.phone.toLowerCase().includes(q))) ||
        (b.destination && b.destination.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, cars, clients, searchTerm, statusFilter]);

  const handlePrintContract = (booking: Booking) => {
    const car = cars.find(c => c.id === booking.carId);
    const client = clients.find(c => c.id === booking.clientId);
    if (car && client) {
      PdfGenerator.generateRentalContract(booking, car, client, settings);
    }
  };

  const handlePrintReturnReceipt = (booking: Booking) => {
    const car = cars.find(c => c.id === booking.carId);
    const client = clients.find(c => c.id === booking.clientId);
    if (car && client) {
      PdfGenerator.generateReturnReceipt(booking, car, client, settings);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-serif">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-serif">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 font-serif">
            <FileText className="text-slate-800" />
            Rentals & Dispatch Bookings (بکنگ ریکارڈ)
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-serif">
            Rental agreements, security deposits, odometer dispatch readings, and return settlements.
          </p>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-2 transition active:scale-95 self-start sm:self-auto font-serif"
        >
          <Key size={16} /> + Rent Out Vehicle (New Booking)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-sm font-serif">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Booking #, Plate, Client CNIC or Name..."
            className="w-full pl-10 custom-input font-serif"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#faf9f5] p-1 rounded-lg border border-slate-300 self-end md:self-auto font-serif">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-md font-bold transition font-serif ${
              statusFilter === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1 rounded-md font-bold transition font-serif ${
              statusFilter === 'ACTIVE' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Active ({bookings.filter(b => b.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1 rounded-md font-bold transition font-serif ${
              statusFilter === 'COMPLETED' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Completed ({bookings.filter(b => b.status === 'COMPLETED').length})
          </button>
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3 py-1 rounded-md font-bold transition font-serif ${
              statusFilter === 'CANCELLED' ? 'bg-rose-700 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 py-16 text-center text-slate-500 text-xs rounded-xl font-serif font-bold">
          No bookings found matching your search.
        </div>
      ) : (
        <div className="space-y-3 font-serif">
          {filteredBookings.map(b => {
            const car = cars.find(c => c.id === b.carId);
            const client = clients.find(c => c.id === b.clientId);
            if (!car || !client) return null;

            const isOverdue = b.status === 'ACTIVE' && new Date(b.expectedReturnDate) < new Date();
            const totalRent = b.finalTotalAmount || b.totalEstimatedRent;
            const balanceDue = Math.max(0, totalRent - (b.advancePaid || 0) - (b.finalBalancePaid || 0));

            return (
              <div 
                key={b.id}
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-400 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs shadow-sm font-serif"
              >
                {/* Left Booking Overview */}
                <div className="flex items-start gap-4 font-serif">
                  <div className={`p-3 rounded-lg shrink-0 mt-0.5 border ${
                    b.status === 'ACTIVE' 
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : b.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    <Car size={24} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap font-serif">
                      <span className="font-bold text-slate-900 text-sm font-serif">{b.bookingNumber}</span>
                      <span className="font-bold text-slate-900 text-sm px-2 py-0.5 bg-[#faf9f5] rounded border border-slate-300 font-serif">
                        {car.plateNumber}
                      </span>
                      <span className="text-slate-700 font-bold font-serif">({car.make} {car.model})</span>

                      {b.status === 'ACTIVE' && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-serif ${
                          isOverdue ? 'bg-rose-200 text-rose-900 font-bold font-serif' : 'bg-blue-100 text-blue-800 font-bold font-serif'
                        }`}>
                          {isOverdue ? 'OVERDUE RETURN' : 'ACTIVE ON ROAD'}
                        </span>
                      )}
                      {b.status === 'COMPLETED' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] font-serif">
                          RETURNED & SETTLED
                        </span>
                      )}
                      {b.status === 'CANCELLED' && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] font-serif">
                          CANCELLED
                        </span>
                      )}
                    </div>

                    {/* Client & Date details */}
                    <div className="text-slate-700 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-serif">
                      <span>Customer: <strong className="text-slate-900 font-serif">{client.name}</strong> (<span className="text-slate-600 font-bold font-serif">{client.cnic}</span>)</span>
                      <span>Phone: <strong className="text-slate-900 font-serif">{client.phone}</strong></span>
                      <span>Duration: <strong className="text-slate-900 font-serif">{b.totalDays} Day(s)</strong></span>
                    </div>

                    <div className="text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-serif">
                      <span>Dispatch: {new Date(b.startDate).toLocaleString()}</span>
                      <span>&bull;</span>
                      <span>Expected Return: {new Date(b.expectedReturnDate).toLocaleString()}</span>
                      {b.destination && (
                        <>
                          <span>&bull;</span>
                          <span>Destination: <strong className="text-slate-800 font-serif">{b.destination}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 font-serif">
                  <div className="text-right space-y-0.5 font-serif">
                    <div className="text-xs text-slate-600 font-serif">
                      Total: <span className="font-bold text-slate-900 font-serif">{settings.currency} {totalRent.toLocaleString()}</span>
                      <span className="text-slate-400 mx-1">|</span>
                      Advance: <span className="text-emerald-800 font-bold font-serif">{settings.currency} {b.advancePaid.toLocaleString()}</span>
                    </div>
                    
                    {b.status === 'ACTIVE' && balanceDue > 0 ? (
                      <div className="text-xs font-bold text-rose-800 font-serif">
                        Balance Due: {settings.currency} {balanceDue.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-800 font-bold font-serif">
                        Deposit Held: {settings.currency} {b.securityDeposit.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap font-serif">
                    {/* Print Agreement Contract */}
                    <button
                      onClick={() => handlePrintContract(b)}
                      className="px-2.5 py-1.5 bg-[#faf9f5] hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-md flex items-center gap-1 transition text-[11px] font-serif font-bold"
                      title="Print Rental Contract (PDF)"
                    >
                      <Printer size={13} /> Contract
                    </button>

                    {/* If Completed -> Print Return Invoice */}
                    {b.status === 'COMPLETED' && (
                      <button
                        onClick={() => handlePrintReturnReceipt(b)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-md flex items-center gap-1 transition text-[11px] font-serif font-bold"
                        title="Print Return Invoice (PDF)"
                      >
                        <FileText size={13} /> Invoice
                      </button>
                    )}

                    {/* If Active -> Receive Return */}
                    {b.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => onReceiveReturn(b)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md shadow-sm transition flex items-center gap-1 text-[11px] font-serif"
                        >
                          <CheckCircle size={13} /> Receive Return
                        </button>
                        <button
                          onClick={() => onCancelBooking(b)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded-md transition"
                          title="Cancel Booking"
                        >
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};


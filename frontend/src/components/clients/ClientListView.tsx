import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Phone, 
  Edit3, 
  Trash2, 
  Key
} from 'lucide-react';
import { Client, Booking, Car as CarType, CompanySettings } from '../../types';

interface ClientListViewProps {
  clients: Client[];
  bookings: Booking[];
  cars: CarType[];
  settings: CompanySettings;
  onOpenAddClient: () => void;
  onOpenEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onOpenNewBookingForClient?: (client: Client) => void;
}

export const ClientListView: React.FC<ClientListViewProps> = ({
  clients,
  bookings,
  cars,
  settings,
  onOpenAddClient,
  onOpenEditClient,
  onDeleteClient,
  onOpenNewBookingForClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const q = searchTerm.toLowerCase().trim();
      return (
        c.name.toLowerCase().includes(q) ||
        c.cnic.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.licenseNumber.toLowerCase().includes(q)
      );
    });
  }, [clients, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-serif">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-serif">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 font-serif">
            <UserCheck className="text-slate-800" />
            Client Directory & Customer Profiles (کسٹمرز)
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-serif">
            CNIC-verified customer database, driving licenses, guarantor contacts, and rental histories.
          </p>
        </div>

        <button
          onClick={onOpenAddClient}
          className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-2 transition active:scale-95 self-start sm:self-auto font-serif"
        >
          <Plus size={16} /> + Register New Client
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-3 text-xs shadow-sm font-serif">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Client Name, CNIC (e.g. 35201-xxxxxxx-x) or Mobile..."
            className="w-full pl-10 custom-input font-serif"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white border border-slate-200 py-16 text-center text-slate-500 text-xs rounded-xl font-serif font-bold">
          No clients found. Click "+ Register New Client" to add a customer.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-serif">
          {filteredClients.map(client => {
            const clientBookings = bookings.filter(b => b.clientId === client.id);
            const activeBooking = clientBookings.find(b => b.status === 'ACTIVE');
            const rentedCar = activeBooking ? cars.find(c => c.id === activeBooking.carId) : null;

            return (
              <div 
                key={client.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-400 transition flex flex-col justify-between shadow-sm font-serif"
              >
                
                {/* Header */}
                <div className="p-5 bg-[#faf9f5] border-b border-slate-200 flex items-start justify-between gap-3 font-serif">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 font-serif">{client.name}</h3>
                      {activeBooking ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold font-serif">
                          Active Rental
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold font-serif">
                          Idle / Available
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-serif">
                      <span>CNIC: <strong className="text-slate-900 font-serif">{client.cnic}</strong></span>
                      <span>&bull;</span>
                      <span className="text-slate-800 flex items-center gap-1 font-serif">
                        <Phone size={12} className="text-slate-600" /> {client.phone}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs font-serif">
                    <span className="text-slate-600 text-[10px] block font-serif">Rentals Count</span>
                    <span className="font-bold text-slate-900 text-base font-serif">{clientBookings.length}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3 text-xs font-serif">
                  
                  {/* License & Address */}
                  <div className="grid grid-cols-2 gap-2 text-slate-700 bg-[#faf9f5] p-3 rounded-lg border border-slate-200 font-serif">
                    <div>
                      <span className="text-slate-600 text-[10px] block font-serif">Driving License #</span>
                      <span className="text-slate-900 font-bold font-serif">{client.licenseNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 text-[10px] block font-serif">License Expiry</span>
                      <span className="text-slate-900 font-bold font-serif">{client.licenseExpiry ? new Date(client.licenseExpiry).toLocaleDateString() : 'Valid'}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200 font-serif">
                      <span className="text-slate-600 text-[10px] block font-serif">Residential Address</span>
                      <span className="text-slate-900 font-bold truncate block font-serif">{client.address}</span>
                    </div>
                  </div>

                  {/* Guarantor Details */}
                  {client.guarantorName && (
                    <div className="p-2.5 bg-[#faf9f5] rounded-lg border border-slate-200 text-[11px] text-slate-700 font-serif">
                      Guarantor / Reference: <strong className="text-slate-900 font-serif">{client.guarantorName}</strong> ({client.guarantorPhone || 'N/A'})
                    </div>
                  )}

                  {/* Active Vehicle Info if on rent */}
                  {activeBooking && rentedCar && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs space-y-1 font-serif">
                      <div className="text-blue-900 font-bold flex items-center justify-between font-serif">
                        <span>Currently Driving: {rentedCar.plateNumber} ({rentedCar.make} {rentedCar.model})</span>
                        <span className="text-slate-900 font-bold font-serif">Return Due: {new Date(activeBooking.expectedReturnDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Actions */}
                <div className="p-4 bg-[#faf9f5] border-t border-slate-200 flex items-center justify-between gap-2 text-xs font-serif">
                  <div className="flex items-center gap-1 font-serif">
                    <button
                      onClick={() => onOpenEditClient(client)}
                      className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                      title="Edit Client Profile"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => onDeleteClient(client)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-200 rounded-md transition"
                      title="Delete Client"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {onOpenNewBookingForClient && !activeBooking && (
                    <button
                      onClick={() => onOpenNewBookingForClient(client)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition flex items-center gap-1 font-serif"
                    >
                      <Key size={13} /> Rent Out Car
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


import React, { useState, useEffect } from 'react';
import { X, UserCheck, Save, AlertTriangle } from 'lucide-react';
import { Client } from '../../types';

interface ClientFormModalProps {
  isOpen: boolean;
  editingClient: Client | null;
  existingClients: Client[];
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  editingClient,
  existingClients,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [address, setAddress] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorFatherName, setGuarantorFatherName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorCnic, setGuarantorCnic] = useState('');
  const [guarantorAddress, setGuarantorAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setCnic(editingClient.cnic);
      setPhone(editingClient.phone);
      setAltPhone(editingClient.altPhone || '');
      setLicenseNumber(editingClient.licenseNumber);
      setLicenseExpiry(editingClient.licenseExpiry || '');
      setAddress(editingClient.address);
      setGuarantorName(editingClient.guarantorName || '');
      setGuarantorFatherName(editingClient.guarantorFatherName || '');
      setGuarantorPhone(editingClient.guarantorPhone || '');
      setGuarantorCnic(editingClient.guarantorCnic || '');
      setGuarantorAddress(editingClient.guarantorAddress || '');
      setNotes(editingClient.notes || '');
      setError('');
    } else {
      setName('');
      setCnic('');
      setPhone('');
      setAltPhone('');
      setLicenseNumber('');
      setLicenseExpiry('');
      setAddress('');
      setGuarantorName('');
      setGuarantorFatherName('');
      setGuarantorPhone('');
      setGuarantorCnic('');
      setGuarantorAddress('');
      setNotes('');
      setError('');
    }
  }, [editingClient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedCnic = cnic.trim();

    // Check duplicate CNIC
    const isDuplicate = existingClients.some(
      c => c.cnic.trim() === formattedCnic && (!editingClient || c.id !== editingClient.id)
    );

    if (isDuplicate) {
      setError(`A Client with CNIC "${formattedCnic}" already exists! Client CNIC must be unique.`);
      return;
    }

    onSave({
      id: editingClient ? editingClient.id : undefined,
      name: name.trim(),
      cnic: formattedCnic,
      phone: phone.trim(),
      altPhone: altPhone.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseExpiry: licenseExpiry || undefined,
      address: address.trim(),
      guarantorName: guarantorName.trim() || undefined,
      guarantorFatherName: guarantorFatherName.trim() || undefined,
      guarantorPhone: guarantorPhone.trim() || undefined,
      guarantorCnic: guarantorCnic.trim() || undefined,
      guarantorAddress: guarantorAddress.trim() || undefined,
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl my-8 bg-slateDark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slateDark-850 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <UserCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingClient ? `Edit Client: ${editingClient.name}` : 'Register New Client Profile'}
              </h2>
              <p className="text-xs text-slate-400">
                Enter customer national ID, driving license, and guarantor verification.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hamza Bilal Butt"
                className="w-full custom-input"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                National CNIC Number (Unique) *
              </label>
              <input
                type="text"
                required
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="35201-9876543-1"
                className="w-full custom-input font-mono font-bold text-emerald-300"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mobile Contact *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0321-9988776"
                className="w-full custom-input font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Alternate Phone (WhatsApp)</label>
              <input
                type="text"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="0300-1122334"
                className="w-full custom-input font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Driving License Number *</label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. LHR-DL-2021-9081"
                className="w-full custom-input font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">License Expiry Date</label>
              <input
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="w-full custom-input"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Residential / Office Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address, house #, street, city"
                className="w-full custom-input"
              />
            </div>
          </div>

          {/* Guarantor / Reference Section */}
          <div className="p-4 bg-slateDark-850 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
              Guarantor / Reference Information (ضامن کی تفصیلات)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Guarantor Full Name</label>
                <input
                  type="text"
                  value={guarantorName}
                  onChange={(e) => setGuarantorName(e.target.value)}
                  placeholder="e.g. Tariq Mahmood Butt"
                  className="w-full custom-input"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Guarantor Father's Name</label>
                <input
                  type="text"
                  value={guarantorFatherName}
                  onChange={(e) => setGuarantorFatherName(e.target.value)}
                  placeholder="e.g. Muhammad Rafiq Butt"
                  className="w-full custom-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Guarantor CNIC</label>
                <input
                  type="text"
                  value={guarantorCnic}
                  onChange={(e) => setGuarantorCnic(e.target.value)}
                  placeholder="35201-1234567-9"
                  className="w-full custom-input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Guarantor Mobile</label>
                <input
                  type="text"
                  value={guarantorPhone}
                  onChange={(e) => setGuarantorPhone(e.target.value)}
                  placeholder="0300-9988776"
                  className="w-full custom-input font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Guarantor Permanent Address</label>
              <input
                type="text"
                value={guarantorAddress}
                onChange={(e) => setGuarantorAddress(e.target.value)}
                placeholder="e.g. House 14-B, Sector C, Bahria Town, Lahore"
                className="w-full custom-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Client Notes / Trust Score</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified corporate client, prompt payments"
              className="w-full custom-input"
            />
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition"
            >
              <Save size={16} />
              {editingClient ? 'Update Profile' : 'Save Client'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

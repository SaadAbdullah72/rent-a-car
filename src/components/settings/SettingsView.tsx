import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  FileText, 
  Save, 
  RotateCcw, 
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { CompanySettings } from '../../types';

interface SettingsViewProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  onResetDatabase: () => void;
  onRequestConfirm: (opts: { title: string; message: string; onConfirm: () => void }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDatabase,
  onRequestConfirm
}) => {
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [currency, setCurrency] = useState(settings.currency);
  const [terms, setTerms] = useState<string[]>(settings.termsAndConditions || []);
  const [newTerm, setNewTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CompanySettings = {
      ...settings,
      businessName: businessName.trim(),
      tagline: tagline.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      address: address.trim(),
      currency: currency.trim(),
      termsAndConditions: terms
    };

    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddTerm = () => {
    if (newTerm.trim()) {
      setTerms([...terms, newTerm.trim()]);
      setNewTerm('');
    }
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleResetClick = () => {
    onRequestConfirm({
      title: 'Reset Database to Default Demo Data?',
      message: 'Are you sure you want to reset all cars, investors, clients, and bookings to default sample records? Current custom records will be replaced.',
      onConfirm: () => {
        onResetDatabase();
      }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-serif">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-serif">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 font-serif">
            <SettingsIcon className="text-slate-800" />
            Company Profile & Contract Settings (سیٹنگز)
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-serif">
            Customize business information, official rental terms, and printing contract details.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs rounded-lg flex items-center gap-2 font-serif font-bold animate-fadeIn">
            <CheckCircle size={16} />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs font-serif">
        
        {/* Business Identity */}
        <div className="bg-white p-6 rounded-xl space-y-4 border border-slate-200 shadow-sm font-serif">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-serif">
            <Building size={16} className="text-slate-800" />
            1. Business Information & Branding
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
            <div>
              <label className="block text-slate-700 font-bold mb-1 font-serif">Company / Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full custom-input font-bold text-slate-900 font-serif"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-serif">Tagline / Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full custom-input font-serif"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-serif">Official Mobile Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full custom-input font-serif font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-serif">WhatsApp Business Number *</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full custom-input font-serif font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-serif">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full custom-input font-serif"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-serif">Currency Symbol *</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="Rs. or PKR"
                className="w-full custom-input font-bold font-serif"
              />
            </div>

            <div className="col-span-1 md:col-span-2 font-serif">
              <label className="block text-slate-700 font-bold mb-1 font-serif">Physical Office Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full custom-input font-serif"
              />
            </div>
          </div>
        </div>

        {/* Rental Contract Terms & Conditions */}
        <div className="bg-white p-6 rounded-xl space-y-4 border border-slate-200 shadow-sm font-serif">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-serif">
            <FileText size={16} className="text-slate-800" />
            2. Official Rental Contract Terms (اقرار نامہ شرائط)
          </h2>
          <p className="text-slate-600 text-[11px] font-serif">
            These terms will automatically be printed at the bottom of customer Rental Contracts and Agreements.
          </p>

          <div className="space-y-2 font-serif">
            {terms.map((term, index) => (
              <div key={index} className="flex items-center gap-2 p-2.5 bg-[#faf9f5] rounded-lg border border-slate-200 font-serif">
                <span className="text-slate-500 font-bold w-6 text-center font-serif">{index + 1}.</span>
                <span className="text-slate-900 flex-1 font-serif">{term}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(index)}
                  className="p-1 text-slate-500 hover:text-rose-700 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 font-serif">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Add another contract term or clause..."
              className="flex-1 custom-input font-serif"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTerm();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTerm}
              className="px-4 py-2 bg-[#faf9f5] hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-300 flex items-center gap-1 transition shrink-0 font-serif"
            >
              <Plus size={14} /> Add Term
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 font-serif">
          <button
            type="button"
            onClick={handleResetClick}
            className="px-4 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-100 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 transition font-serif"
          >
            <RotateCcw size={15} /> Reset Database to Sample Data
          </button>

          <button
            type="submit"
            className="px-8 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-2 transition font-serif"
          >
            <Save size={16} /> Save All Settings
          </button>
        </div>

      </form>

    </div>
  );
};


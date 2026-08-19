import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Key, 
  Clock
} from 'lucide-react';
import { CompanySettings } from '../../types';

interface NavbarProps {
  settings: CompanySettings;
  overdueBookingsCount: number;
  onOpenQuickSearch: () => void;
  onOpenNewBooking: () => void;
  onOpenNewCar: () => void;
  onOpenNewInvestor: () => void;
  onNavigateToAgenda: () => void;
  onNavigateToBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  overdueBookingsCount,
  onOpenQuickSearch,
  onOpenNewBooking,
  onNavigateToAgenda
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#ffffff] border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm font-serif">
      
      {/* Search Trigger Bar */}
      <div className="flex-1 max-w-md mr-4">
        <button
          onClick={onOpenQuickSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-[#faf9f5] border border-slate-300 hover:border-slate-400 rounded-lg text-slate-600 hover:text-slate-900 transition text-xs group font-serif"
        >
          <div className="flex items-center gap-2.5">
            <Search size={16} className="text-slate-500 group-hover:scale-105 transition-transform" />
            <span>Search Car Plate (e.g. LEA-2024), CNIC, or Holder...</span>
          </div>
          <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-500 font-serif font-bold">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Live Clock & Action Tools */}
      <div className="flex items-center gap-3 font-serif">
        
        {/* Live Date/Time Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#faf9f5] border border-slate-200 rounded-lg text-xs text-slate-700 font-serif">
          <Clock size={14} className="text-slate-600" />
          <span className="font-serif font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <span className="text-slate-400">&bull;</span>
          <span className="text-slate-600 font-serif">{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Today's Agenda / Overdue Notification Bell */}
        <button
          onClick={onNavigateToAgenda}
          className="relative p-2 text-slate-700 hover:text-slate-900 bg-[#faf9f5] hover:bg-slate-100 border border-slate-300 rounded-lg transition"
          title="Today's Return & Payment Alerts"
        >
          <Bell size={18} />
          {overdueBookingsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm animate-bounce">
              {overdueBookingsCount}
            </span>
          )}
        </button>

        {/* Primary Action: + Rent Out Booking */}
        <button
          onClick={onOpenNewBooking}
          className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95 font-serif"
        >
          <Key size={15} />
          <span>+ Rent Out (New Booking)</span>
        </button>

      </div>
    </header>
  );
};


import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Car, 
  Users, 
  UserCheck, 
  FileText, 
  Wrench, 
  Settings, 
  ChevronRight
} from 'lucide-react';
import { ActiveTab, CompanySettings } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  agendaCount: number;
  settings: CompanySettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  agendaCount,
  settings
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', urduLabel: 'ڈیش بورڈ', icon: LayoutDashboard },
    { 
      id: 'agenda', 
      label: "Today's Agenda", 
      urduLabel: 'آج کا کام', 
      icon: CalendarClock, 
      badge: agendaCount > 0 ? agendaCount : undefined,
      badgeColor: 'bg-rose-600 text-white'
    },
    { id: 'cars', label: 'Car Fleet', urduLabel: 'گاڑیاں', icon: Car },
    { id: 'bookings', label: 'Rentals & Bookings', urduLabel: 'بکنگ ریکارڈ', icon: FileText },
    { id: 'clients', label: 'Clients / Customers', urduLabel: 'کسٹمرز', icon: UserCheck },
    { id: 'investors', label: 'Investors', urduLabel: 'انویسٹرز', icon: Users },
    { id: 'maintenance', label: 'Maintenance', urduLabel: 'مرمت و آئل', icon: Wrench },
    { id: 'settings', label: 'Settings', urduLabel: 'سیٹنگز', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#ffffff] border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none shadow-sm">
      
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-200 flex items-center gap-3 bg-[#faf9f5]">
          <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-sm">
            <Car size={22} />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-slate-900 tracking-tight truncate leading-none font-serif">
              {settings.businessName}
            </h1>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1 block font-serif">
              Car Rental System
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5 max-h-[calc(100vh-140px)] overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 group font-serif ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={17} 
                    className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'} transition-colors`} 
                  />
                  <div className="text-left">
                    <div className="font-serif font-bold text-xs">{item.label}</div>
                    <div className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400 font-normal'}`}>
                      {item.urduLabel}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight size={14} className="text-white/70" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Info */}
      <div className="p-3 border-t border-slate-200 bg-[#faf9f5] text-center">
        <div className="text-[11px] text-slate-600 flex items-center justify-center gap-1.5 font-bold font-serif">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>System Active &bull; Milk White Formal</span>
        </div>
      </div>

    </aside>
  );
};


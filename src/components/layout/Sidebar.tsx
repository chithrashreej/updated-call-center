import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  CalendarDays,
  Radio,
  X,
  Sparkles,
  Users,
  UserCircle,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { DAILY_CALL_TARGET } from '@/data/dashboard';
import { todayISODate } from '@/utils/dates';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navSections = [
  {
    label: null as string | null,
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Plan',
    items: [
      { to: '/plan/calls', label: 'Calls to Make', icon: PhoneCall, end: false },
      { to: '/leads', label: 'Leads', icon: Users, end: false },
      { to: '/plan/incoming', label: 'Incoming', icon: PhoneIncoming, end: false },
      { to: '/plan/recent', label: 'Recent Calls', icon: PhoneOutgoing, end: false },
    ],
  },
  {
    label: null,
    items: [{ to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false }],
  },
  {
    label: null,
    items: [{ to: '/pulse', label: 'Pulse', icon: Radio, end: false }],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile', icon: UserCircle, end: false },
      { to: '/settings', label: 'Settings', icon: SettingsIcon, end: false },
    ],
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { calls } = useData();
  const callsToday = calls.filter((c) => c.date === todayISODate()).length;
  const targetPct = Math.min(100, Math.round((callsToday / DAILY_CALL_TARGET) * 100));
  const isActive = (to: string, end: boolean) => {
    if (end) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center w-8 h-8 rounded-lg bg-slate-900 text-white">
              <Sparkles size={17} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">OnGround.ai</div>
              <div className="text-[11px] text-slate-500">Call Centre</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-700"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, i) => (
            <div key={i} className="space-y-1">
              {section.label && (
                <div className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to, item.end);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={17} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-700">Daily target</div>
            <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${targetPct}%` }} />
            </div>
            <div className="mt-1.5 text-[11px] text-slate-500">{callsToday} of {DAILY_CALL_TARGET} calls made</div>
          </div>
        </div>
      </aside>
    </>
  );
}

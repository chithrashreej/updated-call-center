import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut, Users, PhoneCall, Building2, CalendarClock } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLeadsModal } from '@/context/LeadsModalContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { tasks } from '@/data/dashboard';
import { todayISODate } from '@/utils/dates';

interface TopbarProps {
  onMenuClick: () => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const MAX_RESULTS = 5;

export function Topbar({ onMenuClick, search, onSearchChange }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { leads, calls, incomingCalls } = useData();
  const { openLeads } = useLeadsModal();
  const { profile, signOut } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const matchedLeads = leads.filter(
      (l) => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.phone.includes(q)
    );
    const matchedCalls = calls.filter(
      (c) => c.contactName.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.phone.includes(q)
    );
    const companyMap = new Map<string, string>();
    for (const l of leads) {
      if (l.company.toLowerCase().includes(q) && !companyMap.has(l.company)) companyMap.set(l.company, l.id);
    }
    return {
      leads: matchedLeads.slice(0, MAX_RESULTS),
      calls: matchedCalls.slice(0, MAX_RESULTS),
      companies: [...companyMap.entries()].slice(0, MAX_RESULTS),
    };
  }, [search, leads, calls]);

  const today = todayISODate();
  const followUps = leads.filter((l) => l.followUpDate && l.followUpDate <= today);
  const pendingIncoming = incomingCalls.filter((c) => c.status === 'Missed' || c.status === 'Waiting');
  const openTasks = tasks.filter((t) => !t.done);
  const notificationCount = followUps.length + pendingIncoming.length + openTasks.length;

  const openSearchLead = (leadId: string) => {
    setSearchOpen(false);
    onSearchChange('');
    openLeads([leadId], 0);
  };

  const initials = (profile?.fullName || profile?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const confirmSignOut = () => {
    setSignOutOpen(false);
    setMenuOpen(false);
    signOut();
    toast.push('You have been signed out.', 'info');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-200 bg-white/90 backdrop-blur flex items-center gap-3 px-4 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden text-slate-600 hover:text-slate-900" aria-label="Open menu">
        <Menu size={22} />
      </button>

      <div ref={searchRef} className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSearchOpen(false);
          }}
          placeholder="Search leads, calls, companies..."
          className="input pl-9"
          aria-label="Search"
        />
        {searchOpen && results && (
          <div className="absolute left-0 right-0 mt-2 card p-2 shadow-lg animate-fade-in max-h-96 overflow-y-auto">
            {results.leads.length + results.calls.length + results.companies.length === 0 && (
              <div className="px-3 py-4 text-sm text-slate-500 text-center">No matches for "{search.trim()}"</div>
            )}
            {results.leads.length > 0 && (
              <ResultGroup label="Leads">
                {results.leads.map((l) => (
                  <ResultItem key={l.id} icon={<Users size={14} />} title={l.name} subtitle={`${l.company} · ${l.phone}`} onClick={() => openSearchLead(l.id)} />
                ))}
              </ResultGroup>
            )}
            {results.companies.length > 0 && (
              <ResultGroup label="Companies">
                {results.companies.map(([company, leadId]) => (
                  <ResultItem key={company} icon={<Building2 size={14} />} title={company} subtitle="Open a contact" onClick={() => openSearchLead(leadId)} />
                ))}
              </ResultGroup>
            )}
            {results.calls.length > 0 && (
              <ResultGroup label="Calls">
                {results.calls.map((c) => (
                  <ResultItem
                    key={c.id}
                    icon={<PhoneCall size={14} />}
                    title={c.contactName}
                    subtitle={`${c.type} · ${c.date}`}
                    onClick={() => {
                      setSearchOpen(false);
                      onSearchChange('');
                      navigate('/plan/recent');
                    }}
                  />
                ))}
              </ResultGroup>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell size={19} />
            {notificationCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 card p-2 shadow-lg animate-fade-in max-h-96 overflow-y-auto">
              <div className="px-3 py-2 text-sm font-semibold text-slate-800">
                Notifications <span className="text-xs font-normal text-slate-500">({notificationCount})</span>
              </div>
              {notificationCount === 0 && <div className="px-3 py-4 text-sm text-slate-500 text-center">You are all caught up.</div>}
              {followUps.length > 0 && (
                <ResultGroup label="Follow-ups due">
                  {followUps.map((l) => (
                    <ResultItem
                      key={l.id}
                      icon={<CalendarClock size={14} />}
                      title={l.name}
                      subtitle={`Follow-up ${l.followUpDate}`}
                      onClick={() => { setNotifOpen(false); openLeads([l.id], 0); }}
                    />
                  ))}
                </ResultGroup>
              )}
              {pendingIncoming.length > 0 && (
                <ResultGroup label="Incoming calls">
                  {pendingIncoming.map((c) => (
                    <ResultItem
                      key={c.id}
                      icon={<PhoneCall size={14} />}
                      title={c.callerName}
                      subtitle={`${c.status} · ${c.reason}`}
                      onClick={() => { setNotifOpen(false); navigate('/plan/incoming'); }}
                    />
                  ))}
                </ResultGroup>
              )}
              {openTasks.length > 0 && (
                <ResultGroup label="Open tasks">
                  {openTasks.map((t) => (
                    <ResultItem
                      key={t.id}
                      icon={<Settings size={14} />}
                      title={t.title}
                      subtitle={t.due}
                      onClick={() => { setNotifOpen(false); navigate('/dashboard'); }}
                    />
                  ))}
                </ResultGroup>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-slate-100"
            aria-label="Profile menu"
          >
            <div className="grid place-items-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold">{initials}</div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-sm font-semibold text-slate-800">{profile?.fullName || 'User'}</div>
              <div className="text-[11px] text-slate-500">{profile?.jobTitle || 'Sales Rep'}</div>
            </div>
            <ChevronDown size={15} className="text-slate-400 hidden sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 card p-1.5 shadow-lg animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="text-sm font-semibold text-slate-800">{profile?.fullName || 'User'}</div>
                <div className="text-xs text-slate-500">{profile?.email}</div>
              </div>
              <MenuButton icon={<User size={15} />} onClick={() => { setMenuOpen(false); navigate('/profile'); }}>Profile</MenuButton>
              <MenuButton icon={<Settings size={15} />} onClick={() => { setMenuOpen(false); navigate('/settings'); }}>Settings</MenuButton>
              <div className="my-1 border-t border-slate-100" />
              <MenuButton icon={<LogOut size={15} />} onClick={() => { setMenuOpen(false); setSignOutOpen(true); }} danger>Sign out</MenuButton>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        title="Sign out?"
        message="You will be returned to the landing page. Your data stays saved in this browser."
        confirmLabel="Sign out"
        danger
        onConfirm={confirmSignOut}
        onCancel={() => setSignOutOpen(false)}
      />
    </header>
  );
}

function ResultGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      {children}
    </div>
  );
}

function ResultItem({ icon, title, subtitle, onClick }: { icon: ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-left hover:bg-slate-100">
      <span className="text-slate-400">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-800 truncate">{title}</span>
        <span className="block text-xs text-slate-500 truncate">{subtitle}</span>
      </span>
    </button>
  );
}

function MenuButton({ icon, onClick, danger, children }: { icon: ReactNode; onClick: () => void; danger?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm ${
        danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon} {children}
    </button>
  );
}

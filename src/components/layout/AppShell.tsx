import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LeadsModal } from '@/components/leads/LeadsModal';
import { CallOverlay } from '@/components/call/CallOverlay';

interface AppShellProps {
  children: ReactNode;
  search: string;
  onSearchChange: (v: string) => void;
}

export function AppShell({ children, search, onSearchChange }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} search={search} onSearchChange={onSearchChange} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
      <LeadsModal />
      <CallOverlay />
    </div>
  );
}

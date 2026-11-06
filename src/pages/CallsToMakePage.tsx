import { Fragment, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  PhoneCall,
  Eye,
  Mail,
  Building2,
  MapPin,
  ArrowUpDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, scoreTone, statusTone } from '@/components/ui/Badge';
import { useLeadsModal } from '@/context/LeadsModalContext';
import { targetFromLead, useCall } from '@/context/CallContext';
import { useData } from '@/context/DataContext';
import { useSearch } from '@/context/SearchContext';
import { formatCurrency, formatDate } from '@/utils/format';
import type { LeadStatus } from '@/types';

const PAGE_SIZE = 6;
const STATUS_FILTERS: (LeadStatus | 'All')[] = ['All', 'New', 'Qualified', 'Callback', 'Contacted', 'Not Interested'];

type SortKey = 'score' | 'intent' | 'value' | 'name';

export function CallsToMakePage() {
  const { openLeads } = useLeadsModal();
  const { startCall } = useCall();
  const { leads } = useData();
  const { query } = useSearch();

  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = leads.filter((l) => l.status !== 'Closed');
    if (statusFilter !== 'All') list = list.filter((l) => l.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.title.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp: number;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else cmp = a[sortKey] - b[sortKey];
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [leads, statusFilter, sortKey, sortDir, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const allLeadIds = filtered.map((l) => l.id);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Calls to Make</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} leads ranked by score</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => openLeads(allLeadIds, 0)} className="btn-secondary" disabled={allLeadIds.length === 0}>
            <Eye size={15} /> Review all
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`badge cursor-pointer transition-colors ${
              statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <Card pad={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium w-8"></th>
                <th className="px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-700">
                    Lead <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  <button onClick={() => toggleSort('score')} className="flex items-center gap-1 hover:text-slate-700">
                    Score <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  <button onClick={() => toggleSort('intent')} className="flex items-center gap-1 hover:text-slate-700">
                    Intent <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">
                  <button onClick={() => toggleSort('value')} className="flex items-center gap-1 hover:text-slate-700">
                    Value <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map((l) => {
                const isOpen = expanded === l.id;
                return (
                  <Fragment key={l.id}>
                    <tr className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpanded(isOpen ? null : l.id)}
                          className="text-slate-400 hover:text-slate-700"
                          aria-label="Expand"
                        >
                          <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid place-items-center w-9 h-9 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
                            {l.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">{l.name}</div>
                            <div className="text-xs text-slate-500 truncate">{l.title} · {l.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge tone={scoreTone(l.score)}>{l.score}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge tone={scoreTone(l.intent)}>{l.intent}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell font-medium text-slate-700">
                        {formatCurrency(l.value)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openLeads(allLeadIds, allLeadIds.indexOf(l.id))}
                            className="btn-ghost p-1.5"
                            aria-label="View details"
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => startCall(targetFromLead(l))}
                            className="btn-primary py-1.5 px-2.5"
                            title="Call"
                          >
                            <PhoneCall size={14} /> Call
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <ExpandRow icon={<Phone size={13} />} label="Phone" value={l.phone} />
                            <ExpandRow icon={<Mail size={13} />} label="Email" value={l.email} />
                            <ExpandRow icon={<Building2 size={13} />} label="Company" value={l.company} />
                            <ExpandRow icon={<MapPin size={13} />} label="Location" value={l.city} />
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">Buying signals:</span>
                            {l.buyingSignals.map((s) => (
                              <span key={s.id} className="badge bg-amber-100 text-amber-700">
                                {s.label}
                              </span>
                            ))}
                            {l.buyingSignals.length === 0 && <span className="text-xs text-slate-400">None recorded</span>}
                          </div>
                          <div className="mt-3 text-xs text-slate-500">
                            Last touch: {formatDate(l.lastTouch)} · Follow-up: {l.followUpDate ? formatDate(l.followUpDate) : 'not set'} · Source: {l.source}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No leads match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <div className="text-xs text-slate-500">
            {filtered.length === 0
              ? 'Showing 0 of 0'
              : `Showing ${(current - 1) * PAGE_SIZE + 1}-${Math.min(current * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current <= 1}
              className="btn-secondary p-1.5 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-slate-600 px-2">
              Page {current} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current >= totalPages}
              className="btn-secondary p-1.5 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ExpandRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <span className="text-slate-400">{icon}</span>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
        <div className="text-slate-800">{value}</div>
      </div>
    </div>
  );
}

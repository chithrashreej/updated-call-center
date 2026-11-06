import { useMemo, useState, type ReactNode } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, scoreTone, statusTone } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LeadFormModal } from '@/components/leads/LeadFormModal';
import { useData } from '@/context/DataContext';
import { useLeadsModal } from '@/context/LeadsModalContext';
import { useToast } from '@/components/ui/Toast';
import type { Lead, LeadStatus } from '@/types';
import type { LeadInput } from '@/context/DataContext';
import { formatCurrency, formatDate } from '@/utils/format';

const PAGE_SIZE = 8;
const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Callback', 'Not Interested', 'Closed'];

type EditorState = { mode: 'create' } | { mode: 'edit'; lead: Lead } | null;

export function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead } = useData();
  const { openLeads } = useLeadsModal();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | LeadStatus>('All');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState>(null);
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (status !== 'All' && l.status !== status) return false;
      if (!q) return true;
      const digits = q.replace(/\D/g, '');
      return (
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        (digits.length > 0 && l.phone.replace(/\D/g, '').includes(digits))
      );
    });
  }, [leads, query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSave = (input: LeadInput) => {
    if (editor?.mode === 'edit') {
      updateLead(editor.lead.id, input);
      toast.push(`${input.name} was updated`, 'success');
    } else {
      addLead(input);
      toast.push(`${input.name} was added`, 'success');
    }
    setEditor(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteLead(pendingDelete.id);
    toast.push(`${pendingDelete.name} was deleted`, 'info');
    setPendingDelete(null);
  };

  const openIndexOf = (id: string) => {
    const idx = visible.findIndex((l) => l.id === id);
    openLeads(
      visible.map((l) => l.id),
      Math.max(0, idx)
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {leads.length} total · changes appear across the whole app
          </p>
        </div>
        <button onClick={() => setEditor({ mode: 'create' })} className="btn-primary self-start sm:self-auto">
          <Plus size={16} /> Add lead
        </button>
      </div>

      <Card pad={false}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-slate-100">
          <label className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, phone or company"
              className="input pl-9"
            />
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'All' | LeadStatus);
              setPage(1);
            }}
            className="input md:w-48"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {leads.length === 0 ? (
          <EmptyState title="No leads yet" text="Add your first lead to start calling." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No matching leads" text="Try a different search or status." />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className="px-4 py-3 font-medium">Lead</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">ICP / Intent</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Follow-up</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => openIndexOf(l.id)} className="text-left">
                          <div className="font-medium text-slate-800 hover:underline">{l.name}</div>
                          <div className="text-xs text-slate-500">{l.company}</div>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{l.phone}</td>
                      <td className="px-4 py-3"><Badge tone={statusTone(l.status)}>{l.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <Badge tone={scoreTone(l.score)}>{l.score}</Badge>
                          <Badge tone={scoreTone(l.intent)}>{l.intent}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(l.value)}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {l.followUpDate ? formatDate(l.followUpDate) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <IconButton label="View lead" onClick={() => openIndexOf(l.id)}><Eye size={15} /></IconButton>
                          <IconButton label="Edit lead" onClick={() => setEditor({ mode: 'edit', lead: l })}><Pencil size={15} /></IconButton>
                          <IconButton label="Delete lead" danger onClick={() => setPendingDelete(l)}><Trash2 size={15} /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden divide-y divide-slate-100">
              {visible.map((l) => (
                <li key={l.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => openIndexOf(l.id)} className="text-left min-w-0">
                      <div className="font-medium text-slate-800 truncate">{l.name}</div>
                      <div className="text-xs text-slate-500 truncate">{l.company} · {l.phone}</div>
                    </button>
                    <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{formatCurrency(l.value)}</span>
                    <div className="flex gap-1">
                      <IconButton label="Edit lead" onClick={() => setEditor({ mode: 'edit', lead: l })}><Pencil size={15} /></IconButton>
                      <IconButton label="Delete lead" danger onClick={() => setPendingDelete(l)}><Trash2 size={15} /></IconButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="btn-secondary !px-2 !py-1 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>
                <span>Page {currentPage} of {pageCount}</span>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= pageCount}
                  className="btn-secondary !px-2 !py-1 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {editor && (
        <LeadFormModal
          lead={editor.mode === 'edit' ? editor.lead : null}
          onClose={() => setEditor(null)}
          onSave={handleSave}
        />
      )}

      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete lead?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setPendingDelete(null)} className="btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete</button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          {pendingDelete?.name} will be removed. Past calls and events for this lead stay in the app but are no longer linked to them.
        </p>
      </Modal>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid place-items-center w-8 h-8 rounded-md text-slate-500 transition-colors ${
        danger ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="grid place-items-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-3">
        <Users size={20} />
      </div>
      <div className="font-medium text-slate-800">{title}</div>
      <div className="text-sm text-slate-500 mt-1">{text}</div>
    </div>
  );
}

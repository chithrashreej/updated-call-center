import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  PhoneCall,
  ChevronDown,
  TrendingUp,
  Target,
  Sparkles,
} from 'lucide-react';
import { useLeadsModal } from '@/context/LeadsModalContext';
import { targetFromLead, useCall } from '@/context/CallContext';
import { useData } from '@/context/DataContext';
import { Badge, scoreTone, statusTone } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/format';
import type { BuyingSignal } from '@/types';

function scoreBarClass(score: number): string {
  const tone = scoreTone(score);
  if (tone === 'green') return 'bg-emerald-500';
  if (tone === 'blue') return 'bg-sky-500';
  if (tone === 'amber') return 'bg-amber-500';
  return 'bg-rose-500';
}

export function LeadsModal() {
  const { openLeadIds, openIndex, close, next, prev } = useLeadsModal();
  const { leads } = useData();
  const { startCall } = useCall();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!openLeadIds || openLeadIds.length === 0) return null;
  const lead = leads.find((l) => l.id === openLeadIds[openIndex]);
  if (!lead) return null;

  const toggleSignal = (id: string) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={close} aria-hidden />
      <div className="relative z-10 w-full max-w-3xl animate-fade-in card max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-b-none sm:rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-full bg-slate-900 text-white text-sm font-semibold">
              {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{lead.name}</h3>
              <p className="text-xs text-slate-500">
                {lead.title} · {lead.company}
              </p>
            </div>
          </div>
          <button onClick={close} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Target size={13} /> ICP Fit Score
              </div>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-2xl font-semibold text-slate-900">{lead.score}</span>
                <span className="text-xs text-slate-400 mb-1">/100</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${scoreBarClass(lead.score)}`} style={{ width: `${lead.score}%` }} />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <TrendingUp size={13} /> Lead Intent Score
              </div>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-2xl font-semibold text-slate-900">{lead.intent}</span>
                <span className="text-xs text-slate-400 mb-1">/100</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${scoreBarClass(lead.intent)}`} style={{ width: `${lead.intent}%` }} />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Detail label="Phone" value={lead.phone} />
            <Detail label="Email" value={lead.email} />
            <Detail label="Location" value={lead.city} />
            <Detail label="Source" value={lead.source} />
            <Detail label="Last touch" value={formatDate(lead.lastTouch)} />
            <Detail label="Deal value" value={formatCurrency(lead.value)} />
            <Detail label="Follow-up" value={lead.followUpDate ? formatDate(lead.followUpDate) : 'Not set'} />
          </div>

          <div className="flex items-center gap-2">
            <Badge tone={statusTone(lead.status)}>{lead.status}</Badge>
            <Badge tone="neutral">{lead.source}</Badge>
          </div>

          {/* Buying signals */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-slate-800">
              <Sparkles size={14} className="text-amber-500" /> Buying Signals
              <span className="text-xs font-normal text-slate-400">({lead.buyingSignals.length})</span>
            </div>
            <div className="space-y-1.5">
              {lead.buyingSignals.map((s: BuyingSignal) => (
                <div key={s.id} className="rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleSignal(s.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${i < s.weight ? 'bg-amber-500' : 'bg-slate-200'}`}
                          />
                        ))}
                      </span>
                      <span className="text-sm text-slate-700">{s.label}</span>
                    </div>
                    <ChevronDown
                      size={15}
                      className={`text-slate-400 transition-transform ${expanded[s.id] ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expanded[s.id] && (
                    <div className="px-3 pb-3 pt-0 text-xs text-slate-500 border-t border-slate-100">
                      <p className="mt-2">{s.detail}</p>
                    </div>
                  )}
                </div>
              ))}
              {lead.buyingSignals.length === 0 && (
                <p className="text-xs text-slate-400">No buying signals recorded for this lead.</p>
              )}
            </div>
          </div>

          {lead.notes && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <div className="text-xs font-semibold text-slate-500 mb-1">Notes</div>
              {lead.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between bg-slate-50">
          <div className="text-xs text-slate-500">
            Record {openIndex + 1} of {openLeadIds.length}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="btn-secondary" disabled={openLeadIds.length <= 1}>
              <ChevronLeft size={15} /> Prev
            </button>
            <button onClick={next} className="btn-secondary" disabled={openLeadIds.length <= 1}>
              Next <ChevronRight size={15} />
            </button>
            <button onClick={() => startCall(targetFromLead(lead))} className="btn-primary">
              <PhoneCall size={15} /> Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}

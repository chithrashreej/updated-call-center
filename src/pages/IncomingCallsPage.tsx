import { useMemo, useState } from 'react';
import { PhoneIncoming, PhoneForwarded, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCall } from '@/context/CallContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/components/ui/Toast';
import { useSearch } from '@/context/SearchContext';
import { formatCurrency, formatTime } from '@/utils/format';
import type { IncomingCall } from '@/types';

type Filter = 'All' | IncomingCall['status'];

export function IncomingCallsPage() {
  const { startCall } = useCall();
  const { incomingCalls, leads, updateIncomingCall } = useData();
  const { push } = useToast();
  const { query } = useSearch();
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(() => {
    let list = incomingCalls;
    if (filter !== 'All') list = list.filter((c) => c.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) => c.callerName.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => b.time.localeCompare(a.time));
  }, [incomingCalls, filter, query]);

  const onCallback = (call: IncomingCall) => {
    const lead = call.leadId ? leads.find((l) => l.id === call.leadId) : undefined;
    startCall({
      name: call.callerName,
      company: call.company,
      title: lead?.title,
      phone: call.phone,
      email: lead?.email,
      city: lead?.city,
      leadId: lead?.id,
      callType: 'Callback',
    });
    updateIncomingCall(call.id, { status: 'Queued' });
    push(`Callback to ${call.callerName} queued`, 'success');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Incoming Calls</h1>
        <p className="text-sm text-slate-500 mt-0.5">Missed, waiting and queued calls</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['All', 'Missed', 'Waiting', 'Queued'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`badge cursor-pointer transition-colors ${
              filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((c) => (
          <Card key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`grid place-items-center w-10 h-10 rounded-lg shrink-0 ${
                  c.status === 'Missed' ? 'bg-rose-100 text-rose-700' : c.status === 'Waiting' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                }`}
              >
                <PhoneIncoming size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 truncate">{c.callerName}</span>
                  <Badge tone={c.status === 'Missed' ? 'red' : c.status === 'Waiting' ? 'amber' : 'blue'}>
                    {c.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 truncate">{c.company} · {c.reason}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Clock size={11} /> {formatTime(c.time)} · {c.phone}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Value at stake</div>
                <div className="font-semibold text-slate-800">
                  {c.valueAtStake > 0 ? formatCurrency(c.valueAtStake) : '—'}
                </div>
              </div>
              <button onClick={() => onCallback(c)} className="btn-primary">
                <PhoneForwarded size={15} /> Callback
              </button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="text-center py-12 text-slate-400 text-sm flex items-center justify-center gap-2">
            <AlertCircle size={16} /> No incoming calls in this filter.
          </Card>
        )}
      </div>
    </div>
  );
}

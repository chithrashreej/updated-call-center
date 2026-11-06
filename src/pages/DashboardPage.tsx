import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Phone,
  PhoneIncoming,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  Users,
  Target,
} from 'lucide-react';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLeadsModal } from '@/context/LeadsModalContext';
import { useData } from '@/context/DataContext';
import { DAILY_CALL_TARGET, tasks } from '@/data/dashboard';
import { formatCurrency, formatDuration } from '@/utils/format';
import { addDaysISO, parseISODate, todayISODate } from '@/utils/dates';
import type { Task } from '@/types';

const COMMISSION_RATE = 0.12;

export function DashboardPage() {
  const navigate = useNavigate();
  const { openLeads } = useLeadsModal();
  const { leads, calls, incomingCalls } = useData();
  const today = todayISODate();

  const stats = useMemo(() => {
    const todays = calls.filter((c) => c.date === today);
    const todaysReal = todays.filter((c) => !c.simulated);
    const connectedToday = todaysReal.filter((c) => c.status === 'Completed').length;
    const pipeline = leads
      .filter((l) => l.status !== 'Closed' && l.status !== 'Not Interested')
      .reduce((s, l) => s + l.value, 0);
    const qualifiedOrClosed = leads.filter((l) => l.status === 'Qualified' || l.status === 'Closed').length;
    const conversion = leads.length ? (qualifiedOrClosed / leads.length) * 100 : 0;
    const voicemails = todays.filter((c) => c.status === 'Voicemail').length;
    const missed = todays.filter((c) => c.status === 'Missed').length;
    const simulatedToday = todays.length - todaysReal.length;
    return { callsToday: todays.length, connectedToday, pipeline, conversion, voicemails, missed, simulatedToday };
  }, [calls, leads, today]);

  const weekly = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const iso = addDaysISO(today, i - 6);
        const dayCalls = calls.filter((c) => c.date === iso);
        const real = dayCalls.filter((c) => !c.simulated && c.status === 'Completed');
        const value = real.reduce((s, c) => s + (c.value ?? 0), 0);
        return {
          day: parseISODate(iso).toLocaleDateString('en-US', { weekday: 'short' }),
          calls: dayCalls.length,
          connected: real.length,
          converted: real.filter((c) => (c.value ?? 0) > 0).length,
          earnings: Math.round(value * COMMISSION_RATE),
        };
      }),
    [calls, today]
  );

  const weekEarnings = weekly.reduce((s, d) => s + d.earnings, 0);
  const weekDeals = weekly.reduce((s, d) => s + d.converted, 0);
  const progressPct = Math.min(100, Math.round((stats.callsToday / DAILY_CALL_TARGET) * 100));

  const waitingLeads = useMemo(
    () => leads.filter((l) => l.status === 'New' || l.status === 'Callback').slice(0, 5),
    [leads]
  );

  const pendingIncoming = incomingCalls.filter((c) => c.status !== 'Queued').length;
  const dueFollowUps = leads.filter((l) => l.followUpDate && l.followUpDate <= today).length;

  const openTaskLeads = (task: Task) => {
    if (task.leadIds?.length) openLeads(task.leadIds, 0);
    else if (task.type === 'review') navigate('/plan/recent');
    else navigate('/plan/calls');
  };

  const kpis = [
    { label: 'Calls Today', value: String(stats.callsToday), sub: `${stats.simulatedToday} simulated`, icon: Phone },
    { label: 'Connected', value: String(stats.connectedToday), sub: 'Real calls only', icon: PhoneIncoming },
    { label: 'Pipeline', value: formatCurrency(stats.pipeline), sub: 'Open lead value', icon: DollarSign },
    { label: 'Conversion', value: `${stats.conversion.toFixed(1)}%`, sub: 'Qualified or closed', icon: Target },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Good morning, Ava
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{k.label}</span>
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700">
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{k.value}</div>
              <div className="mt-1 text-xs text-slate-500">{k.sub}</div>
            </Card>
          );
        })}
      </div>

      {/* Calling progress + Waiting leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <SectionTitle title="Calling Progress" subtitle="Today's target" />
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-slate-900">{stats.callsToday}</span>
            <span className="text-sm text-slate-400 mb-1">/ {DAILY_CALL_TARGET} calls</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-slate-900 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="Connected" value={String(stats.connectedToday)} />
            <Stat label="Voicemails" value={String(stats.voicemails)} />
            <Stat label="Missed" value={String(stats.missed)} />
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {dueFollowUps} follow-up{dueFollowUps === 1 ? '' : 's'} due · {pendingIncoming} incoming waiting
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle
            title="Waiting Leads"
            subtitle="New or callback"
            action={
              <button onClick={() => navigate('/plan/calls')} className="btn-ghost text-xs">
                View all <ArrowRight size={13} />
              </button>
            }
          />
          {waitingLeads.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No leads are waiting.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {waitingLeads.map((l) => (
                <button
                  key={l.id}
                  onClick={() => openLeads([l.id], 0)}
                  className="w-full flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-left hover:bg-slate-50 -mx-2 px-2 rounded-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid place-items-center w-9 h-9 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
                      {l.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{l.name}</div>
                      <div className="text-xs text-slate-500 truncate">{l.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge tone={l.status === 'Callback' ? 'amber' : 'blue'}>{l.status}</Badge>
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">{formatCurrency(l.value)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="7-Day Performance" subtitle="Calls vs connected" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly} margin={{ left: -20, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="gCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gConn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="calls" name="Calls" stroke="#0f172a" strokeWidth={2} fill="url(#gCalls)" />
                <Area type="monotone" dataKey="connected" name="Connected" stroke="#10b981" strokeWidth={2} fill="url(#gConn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Conversions & Commission" subtitle="Last 7 days" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ left: -20, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="converted" name="Converted" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="right" dataKey="earnings" name="Commission ($)" fill="#0f172a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Earnings + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <SectionTitle title="Earnings" subtitle="Last 7 days" />
          <div className="text-3xl font-semibold text-slate-900">{formatCurrency(weekEarnings)}</div>
          <div className="mt-1 text-xs text-slate-500">Commission on booked value from real calls</div>
          <div className="mt-4 space-y-2">
            <Row label="Deals booked" value={String(weekDeals)} />
            <Row label="Avg call length" value={formatDuration(avgDuration(calls))} />
            <Row label="Commission rate" value={`${Math.round(COMMISSION_RATE * 100)}%`} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle title="Tasks" subtitle="Click a task to open its leads or calls" />
          <div className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <button
                key={t.id}
                onClick={() => openTaskLeads(t)}
                className="w-full flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 text-left hover:bg-slate-50 -mx-2 px-2 rounded-md transition-colors"
              >
                <div
                  className={`grid place-items-center w-8 h-8 rounded-lg shrink-0 ${
                    t.done
                      ? 'bg-emerald-100 text-emerald-700'
                      : t.priority === 'high'
                      ? 'bg-rose-100 text-rose-700'
                      : t.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t.done ? <CheckCircle2 size={16} /> : t.type === 'call' ? <Phone size={15} /> : t.type === 'leads' ? <Users size={15} /> : <Clock size={15} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${t.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.title}</div>
                  <div className="text-xs text-slate-500">{t.due}{t.meta ? ` · ${t.meta}` : ''}</div>
                </div>
                <ArrowRight size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Incoming calls preview */}
      <Card>
        <SectionTitle
          title="Recent Incoming"
          subtitle="Missed & queued calls"
          action={
            <button onClick={() => navigate('/plan/incoming')} className="btn-ghost text-xs">
              View all <ArrowRight size={13} />
            </button>
          }
        />
        <div className="divide-y divide-slate-100">
          {incomingCalls.slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <PhoneIncoming size={16} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{c.callerName}</div>
                  <div className="text-xs text-slate-500 truncate">{c.reason}</div>
                </div>
              </div>
              <Badge tone={c.status === 'Missed' ? 'red' : c.status === 'Waiting' ? 'amber' : 'blue'}>
                {c.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function avgDuration(calls: { durationSeconds: number; simulated?: boolean }[]): number {
  const real = calls.filter((c) => !c.simulated && c.durationSeconds > 0);
  if (real.length === 0) return 0;
  return Math.round(real.reduce((s, c) => s + c.durationSeconds, 0) / real.length);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <div className="text-sm font-semibold text-slate-800">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Phone, RefreshCw, Users, MonitorPlay, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EventFormModal } from '@/components/calendar/EventFormModal';
import { useData } from '@/context/DataContext';
import { useLeadsModal } from '@/context/LeadsModalContext';
import { useToast } from '@/components/ui/Toast';
import type { CalendarEvent, CalendarEventType } from '@/types';
import type { EventInput } from '@/context/DataContext';
import { parseISODate, toISODate, todayISODate } from '@/utils/dates';
import { formatTimeLabel, to24h } from '@/utils/time';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const eventIcon: Record<CalendarEventType, typeof Phone> = {
  call: Phone,
  'follow-up': RefreshCw,
  meeting: Users,
  demo: MonitorPlay,
};

const eventTone: Record<CalendarEventType, string> = {
  call: 'bg-sky-500',
  'follow-up': 'bg-amber-500',
  meeting: 'bg-emerald-500',
  demo: 'bg-violet-500',
};

type Editor = { mode: 'create' } | { mode: 'edit'; event: CalendarEvent } | null;

export function CalendarPage() {
  const { events, leads, addEvent, updateEvent, deleteEvent } = useData();
  const { openLeads } = useLeadsModal();
  const toast = useToast();
  const todayIso = todayISODate();

  const [view, setView] = useState(() => {
    const t = parseISODate(todayIso);
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string>(todayIso);
  const [editor, setEditor] = useState<Editor>(null);
  const [detail, setDetail] = useState<CalendarEvent | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CalendarEvent | null>(null);

  const year = view.getFullYear();
  const month = view.getMonth();

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      (map[e.date] ||= []).push(e);
    }
    for (const list of Object.values(map)) {
      list.sort((a, b) => to24h(a.time).localeCompare(to24h(b.time)));
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const start = new Date(year, month, 1 - firstDay);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return { date: d, iso: toISODate(d), current: d.getMonth() === month };
    });
  }, [year, month]);

  const selectedEvents = eventsByDate[selected] || [];
  const monthEventCount = events.filter((e) => e.date.slice(0, 7) === toISODate(view).slice(0, 7)).length;

  const handleSave = (input: EventInput) => {
    if (editor?.mode === 'edit') {
      updateEvent(editor.event.id, input);
      toast.push('Event updated', 'success');
    } else {
      addEvent(input);
      toast.push('Event added', 'success');
    }
    setSelected(input.date);
    setEditor(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteEvent(pendingDelete.id);
    toast.push(`"${pendingDelete.title}" was deleted`, 'info');
    setPendingDelete(null);
    setDetail(null);
  };

  const goToday = () => {
    const t = parseISODate(todayIso);
    setView(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelected(todayIso);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Scheduled calls, follow-ups and meetings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="btn-secondary">Today</button>
          <button onClick={() => setView(new Date(year, month - 1, 1))} className="btn-secondary p-2" aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setView(new Date(year, month + 1, 1))} className="btn-secondary p-2" aria-label="Next month">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setEditor({ mode: 'create' })} className="btn-primary">
            <Plus size={16} /> <span className="hidden sm:inline">New event</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card pad={false} className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-slate-500" />
              <h3 className="text-base font-semibold text-slate-900">{MONTHS[month]} {year}</h3>
            </div>
            <span className="text-xs text-slate-500">{monthEventCount} event{monthEventCount === 1 ? '' : 's'}</span>
          </div>
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-medium text-slate-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell) => {
                const events = eventsByDate[cell.iso] || [];
                const isToday = cell.iso === todayIso;
                const isSelected = cell.iso === selected;
                return (
                  <button
                    key={cell.iso}
                    onClick={() => setSelected(cell.iso)}
                    className={`aspect-square rounded-lg p-1 sm:p-1.5 text-left flex flex-col transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : isToday
                        ? 'bg-slate-100 text-slate-900'
                        : cell.current
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'text-slate-300 hover:bg-slate-50'
                    }`}
                    aria-label={`${cell.iso}, ${events.length} event${events.length === 1 ? '' : 's'}`}
                  >
                    <span className={`text-xs ${isToday ? 'font-bold' : ''}`}>{cell.date.getDate()}</span>
                    {events.length > 0 && (
                      <div className="mt-auto flex gap-0.5 flex-wrap">
                        {events.slice(0, 3).map((e) => (
                          <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : eventTone[e.type]}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <Legend color="bg-sky-500" label="Call" />
              <Legend color="bg-amber-500" label="Follow-up" />
              <Legend color="bg-emerald-500" label="Meeting" />
              <Legend color="bg-violet-500" label="Demo" />
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle
            title={parseISODate(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            subtitle={`${selectedEvents.length} event${selectedEvents.length === 1 ? '' : 's'}`}
            action={
              <button onClick={() => setEditor({ mode: 'create' })} className="btn-ghost text-xs">
                <Plus size={13} /> Add
              </button>
            }
          />
          <div className="space-y-2.5">
            {selectedEvents.map((e) => {
              const Icon = eventIcon[e.type];
              return (
                <button
                  key={e.id}
                  onClick={() => setDetail(e)}
                  className="w-full text-left rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`grid place-items-center w-9 h-9 rounded-lg ${eventTone[e.type]} text-white shrink-0`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 truncate">{e.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatTimeLabel(e.time)} · {e.durationMinutes} min{e.withName ? ` · ${e.withName}` : ''}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {selectedEvents.length === 0 && (
              <div className="text-center py-10 text-sm text-slate-400">No events scheduled for this day.</div>
            )}
          </div>
        </Card>
      </div>

      {editor && (
        <EventFormModal
          event={editor.mode === 'edit' ? editor.event : null}
          defaultDate={selected}
          leads={leads}
          onClose={() => setEditor(null)}
          onSave={handleSave}
        />
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Event details"
        size="sm"
        footer={
          detail ? (
            <div className="flex justify-between gap-2">
              <button onClick={() => setPendingDelete(detail)} className="btn-ghost text-rose-600 hover:bg-rose-50">
                <Trash2 size={15} /> Delete
              </button>
              <button onClick={() => { setEditor({ mode: 'edit', event: detail }); setDetail(null); }} className="btn-primary">
                <Pencil size={15} /> Edit
              </button>
            </div>
          ) : null
        }
      >
        {detail && (
          <div className="space-y-3">
            <div>
              <div className="text-base font-semibold text-slate-900">{detail.title}</div>
              <div className="mt-1"><Badge tone="neutral">{detail.type}</Badge></div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-slate-500">Date</dt><dd className="text-slate-800">{parseISODate(detail.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</dd></div>
              <div><dt className="text-xs text-slate-500">Time</dt><dd className="text-slate-800">{formatTimeLabel(detail.time)} · {detail.durationMinutes} min</dd></div>
              <div className="col-span-2"><dt className="text-xs text-slate-500">With</dt><dd className="text-slate-800">{detail.withName || 'No one linked'}</dd></div>
            </dl>
            {detail.leadId && (
              <button
                onClick={() => { setDetail(null); openLeads([detail.leadId as string], 0); }}
                className="btn-secondary w-full"
              >
                <ExternalLink size={14} /> Open linked lead
              </button>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete event?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setPendingDelete(null)} className="btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete</button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">"{pendingDelete?.title}" will be removed from the calendar.</p>
      </Modal>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} /> {label}
    </div>
  );
}

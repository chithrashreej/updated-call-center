import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { CalendarEvent, CalendarEventType, Lead } from '@/types';
import type { EventInput } from '@/context/DataContext';
import { to24h } from '@/utils/time';

const TYPES: { value: CalendarEventType; label: string }[] = [
  { value: 'call', label: 'Call' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'demo', label: 'Demo' },
];

interface FormState {
  title: string;
  type: CalendarEventType;
  date: string;
  time: string;
  durationMinutes: string;
  leadId: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function initialState(event: CalendarEvent | null, defaultDate: string): FormState {
  if (!event) {
    return { title: '', type: 'call', date: defaultDate, time: '09:00', durationMinutes: '30', leadId: '' };
  }
  return {
    title: event.title,
    type: event.type,
    date: event.date,
    time: to24h(event.time),
    durationMinutes: String(event.durationMinutes),
    leadId: event.leadId ?? '',
  };
}

function validate(f: FormState): FormErrors {
  const e: FormErrors = {};
  if (!f.title.trim()) e.title = 'Give the event a title';
  if (!DATE_RE.test(f.date)) e.date = 'Pick a date';
  if (!TIME_RE.test(f.time)) e.time = 'Pick a time';
  const duration = Number(f.durationMinutes);
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    e.durationMinutes = 'Duration must be 5 to 480 minutes';
  }
  return e;
}

interface EventFormModalProps {
  event: CalendarEvent | null;
  defaultDate: string;
  leads: Lead[];
  onClose: () => void;
  onSave: (input: EventInput) => void;
}

export function EventFormModal({ event, defaultDate, leads, onClose, onSave }: EventFormModalProps) {
  const [form, setForm] = useState<FormState>(() => initialState(event, defaultDate));
  const [errors, setErrors] = useState<FormErrors>({});

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const lead = leads.find((l) => l.id === form.leadId);
    onSave({
      title: form.title.trim(),
      type: form.type,
      date: form.date,
      time: form.time,
      durationMinutes: Number(form.durationMinutes),
      withName: lead ? lead.name : event?.withName ?? '',
      company: lead ? lead.company : event?.company ?? '',
      leadId: lead?.id,
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={event ? 'Edit Event' : 'New Event'}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" form="event-form" className="btn-primary">{event ? 'Save changes' : 'Add event'}</button>
        </div>
      }
    >
      <form id="event-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-slate-600">Title</span>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className="input mt-1" aria-invalid={!!errors.title} />
          {errors.title && <span className="mt-1 block text-xs text-rose-600">{errors.title}</span>}
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Type</span>
          <select value={form.type} onChange={(e) => set('type', e.target.value as CalendarEventType)} className="input mt-1">
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Linked lead</span>
          <select value={form.leadId} onChange={(e) => set('leadId', e.target.value)} className="input mt-1">
            <option value="">No lead</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>{l.name} · {l.company}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Date</span>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="input mt-1" aria-invalid={!!errors.date} />
          {errors.date && <span className="mt-1 block text-xs text-rose-600">{errors.date}</span>}
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Start time</span>
          <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} className="input mt-1" aria-invalid={!!errors.time} />
          {errors.time && <span className="mt-1 block text-xs text-rose-600">{errors.time}</span>}
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-slate-600">Duration (minutes)</span>
          <input type="number" min={5} max={480} value={form.durationMinutes} onChange={(e) => set('durationMinutes', e.target.value)} className="input mt-1" aria-invalid={!!errors.durationMinutes} />
          {errors.durationMinutes && <span className="mt-1 block text-xs text-rose-600">{errors.durationMinutes}</span>}
        </label>
      </form>
    </Modal>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Lead, LeadStatus } from '@/types';
import type { LeadInput } from '@/context/DataContext';

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Callback', 'Not Interested', 'Closed'];

interface FormState {
  name: string;
  company: string;
  title: string;
  phone: string;
  email: string;
  city: string;
  value: string;
  score: string;
  intent: string;
  status: LeadStatus;
  source: string;
  followUpDate: string;
  notes: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  name: '',
  company: '',
  title: '',
  phone: '',
  email: '',
  city: '',
  value: '0',
  score: '50',
  intent: '50',
  status: 'New',
  source: 'Manual',
  followUpDate: '',
  notes: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s().-]{7,}$/;

function toForm(lead: Lead | null): FormState {
  if (!lead) return EMPTY;
  return {
    name: lead.name,
    company: lead.company,
    title: lead.title,
    phone: lead.phone,
    email: lead.email,
    city: lead.city,
    value: String(lead.value),
    score: String(lead.score),
    intent: String(lead.intent),
    status: lead.status,
    source: lead.source,
    followUpDate: lead.followUpDate ?? '',
    notes: lead.notes ?? '',
  };
}

function validate(f: FormState): FormErrors {
  const e: FormErrors = {};
  if (!f.name.trim()) e.name = 'Name is required';
  if (!f.company.trim()) e.company = 'Company is required';
  if (!PHONE_RE.test(f.phone.trim())) e.phone = 'Enter a valid phone number';
  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
  const value = Number(f.value);
  if (f.value.trim() === '' || Number.isNaN(value) || value < 0) e.value = 'Value must be 0 or more';
  for (const key of ['score', 'intent'] as const) {
    const n = Number(f[key]);
    if (f[key].trim() === '' || Number.isNaN(n) || n < 0 || n > 100) e[key] = 'Enter a number from 0 to 100';
  }
  if (f.followUpDate && !/^\d{4}-\d{2}-\d{2}$/.test(f.followUpDate)) e.followUpDate = 'Enter a valid date';
  return e;
}

interface LeadFormModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSave: (input: LeadInput) => void;
}

export function LeadFormModal({ lead, onClose, onSave }: LeadFormModalProps) {
  const [form, setForm] = useState<FormState>(() => toForm(lead));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setForm(toForm(lead));
    setErrors({});
  }, [lead]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSave({
      name: form.name.trim(),
      company: form.company.trim(),
      title: form.title.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      value: Number(form.value),
      score: Number(form.score),
      intent: Number(form.intent),
      status: form.status,
      source: form.source.trim() || 'Manual',
      lastTouch: lead?.lastTouch ?? new Date().toISOString().slice(0, 10),
      followUpDate: form.followUpDate || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  const field = (key: keyof FormState, label: string, type = 'text') => (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value as FormState[typeof key])}
        className="input mt-1"
        aria-invalid={!!errors[key]}
      />
      {errors[key] && <span className="mt-1 block text-xs text-rose-600">{errors[key]}</span>}
    </label>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={lead ? 'Edit Lead' : 'Add Lead'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" form="lead-form" className="btn-primary">{lead ? 'Save changes' : 'Add lead'}</button>
        </div>
      }
    >
      <form id="lead-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('name', 'Full name')}
        {field('company', 'Company')}
        {field('title', 'Job title')}
        {field('phone', 'Phone', 'tel')}
        {field('email', 'Email', 'email')}
        {field('city', 'Location')}
        {field('value', 'Lead value ($)', 'number')}
        {field('source', 'Source')}
        {field('score', 'ICP fit score (0-100)', 'number')}
        {field('intent', 'Intent score (0-100)', 'number')}
        {field('followUpDate', 'Follow-up date', 'date')}
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Status</span>
          <select value={form.status} onChange={(e) => set('status', e.target.value as LeadStatus)} className="input mt-1">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-slate-600">Notes</span>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className="input mt-1" />
        </label>
      </form>
    </Modal>
  );
}

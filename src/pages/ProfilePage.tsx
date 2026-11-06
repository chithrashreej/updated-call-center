import { useState, type FormEvent } from 'react';
import { User as UserIcon, Mail, Phone, Briefcase, Building, Save, Pencil, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState<FormState>({
    fullName: profile?.fullName ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    jobTitle: profile?.jobTitle ?? '',
    department: profile?.department ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const initials = (form.fullName || form.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.jobTitle.trim()) e.jobTitle = 'Job title is required';
    if (!form.department.trim()) e.department = 'Department is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      updateProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        jobTitle: form.jobTitle.trim(),
        department: form.department.trim(),
      });
      toast.push('Profile updated successfully', 'success');
      setEditing(false);
    } catch {
      toast.push('Could not save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm({
      fullName: profile?.fullName ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      jobTitle: profile?.jobTitle ?? '',
      department: profile?.department ?? '',
    });
    setErrors({});
    setEditing(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your personal information and account details.</p>
      </div>

      {/* Avatar + summary */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="grid place-items-center w-16 h-16 rounded-full bg-slate-900 text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate">{profile?.fullName || 'Unnamed user'}</h2>
            <p className="text-sm text-slate-500 truncate">{profile?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">{profile?.jobTitle} · {profile?.department}</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary ml-auto shrink-0">
              <Pencil size={15} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Details / edit form */}
      <div className="card p-6">
        {!editing ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Detail icon={<UserIcon size={16} />} label="Full name" value={profile?.fullName} />
            <Detail icon={<Mail size={16} />} label="Email" value={profile?.email} />
            <Detail icon={<Phone size={16} />} label="Phone" value={profile?.phone} />
            <Detail icon={<Briefcase size={16} />} label="Job title" value={profile?.jobTitle} />
            <Detail icon={<Building size={16} />} label="Department" value={profile?.department} />
            <Detail icon={<Mail size={16} />} label="Account ID" value={user?.id} mono />
          </dl>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name" error={errors.fullName}>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={`input pl-9 ${errors.fullName ? 'border-rose-400' : ''}`} />
                </div>
              </Field>
              <Field label="Email" error={errors.email}>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={`input pl-9 ${errors.email ? 'border-rose-400' : ''}`} />
                </div>
              </Field>
              <Field label="Phone" error={errors.phone}>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={`input pl-9 ${errors.phone ? 'border-rose-400' : ''}`} />
                </div>
              </Field>
              <Field label="Job title" error={errors.jobTitle}>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} className={`input pl-9 ${errors.jobTitle ? 'border-rose-400' : ''}`} />
                </div>
              </Field>
              <Field label="Department" error={errors.department}>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.department} onChange={(e) => set('department', e.target.value)} className={`input pl-9 ${errors.department ? 'border-rose-400' : ''}`} />
                </div>
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</span> : <><Save size={15} /> Save changes</>}
              </button>
            </div>
          </form>
        )}
      </div>

      {editing && (
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Check size={13} /> Changes are saved to your browser's local storage.
        </p>
      )}
    </div>
  );
}

function Detail({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">{icon} {label}</dt>
      <dd className={`text-sm text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

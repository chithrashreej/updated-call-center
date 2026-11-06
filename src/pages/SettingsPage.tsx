import { useState, type FormEvent } from 'react';
import { Lock, Bell, Mail, Settings as SettingsIcon, Save, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export function SettingsPage() {
  const { settings, updateSettings } = useAuth();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const [prefs, setPrefs] = useState({
    emailNotifications: settings?.emailNotifications ?? true,
    pushNotifications: settings?.pushNotifications ?? true,
    weeklyDigest: settings?.weeklyDigest ?? false,
    compactMode: settings?.compactMode ?? false,
    autoArchiveCalls: settings?.autoArchiveCalls ?? true,
  });
  const [prefsSaving, setPrefsSaving] = useState(false);

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!currentPassword) { setPwError('Enter your current password.'); return; }
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('New passwords do not match.'); return; }
    setPwSaving(true);
    setTimeout(() => {
      setPwSaving(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast.push('Password updated. (Demo: no real change was made.)', 'success');
    }, 600);
  };

  const handleSavePrefs = () => {
    setPrefsSaving(true);
    setTimeout(() => {
      updateSettings(prefs);
      setPrefsSaving(false);
      toast.push('Preferences saved', 'success');
    }, 300);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account, password, and application preferences.</p>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-slate-500" />
          <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Current password</span>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input mt-1" autoComplete="current-password" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">New password</span>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input mt-1" autoComplete="new-password" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Confirm new password</span>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input mt-1" autoComplete="new-password" />
          </label>
          {pwError && <p className="text-xs text-rose-600">{pwError}</p>}
          <button type="submit" disabled={pwSaving} className="btn-primary">
            {pwSaving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating…</span> : <>Update password</>}
          </button>
        </form>
      </div>

      {/* Notification preferences */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-slate-500" />
          <h2 className="text-base font-semibold text-slate-900">Notification Preferences</h2>
        </div>
        <div className="space-y-1">
          <ToggleRow
            icon={<Mail size={16} />}
            label="Email notifications"
            desc="Receive follow-up reminders and call summaries by email."
            checked={prefs.emailNotifications}
            onChange={() => togglePref('emailNotifications')}
          />
          <ToggleRow
            icon={<Bell size={16} />}
            label="Push notifications"
            desc="Get in-app alerts for missed calls and pinned Pulse items."
            checked={prefs.pushNotifications}
            onChange={() => togglePref('pushNotifications')}
          />
          <ToggleRow
            icon={<Mail size={16} />}
            label="Weekly digest"
            desc="A summary of your calls, leads, and earnings every Monday."
            checked={prefs.weeklyDigest}
            onChange={() => togglePref('weeklyDigest')}
          />
        </div>
      </div>

      {/* General preferences */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon size={18} className="text-slate-500" />
          <h2 className="text-base font-semibold text-slate-900">General Preferences</h2>
        </div>
        <div className="space-y-1">
          <ToggleRow
            icon={<SettingsIcon size={16} />}
            label="Compact mode"
            desc="Reduce padding and spacing for a denser interface."
            checked={prefs.compactMode}
            onChange={() => togglePref('compactMode')}
          />
          <ToggleRow
            icon={<SettingsIcon size={16} />}
            label="Auto-archive completed calls"
            desc="Move calls older than 30 days to the archive automatically."
            checked={prefs.autoArchiveCalls}
            onChange={() => togglePref('autoArchiveCalls')}
          />
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
          <button onClick={handleSavePrefs} disabled={prefsSaving} className="btn-primary">
            {prefsSaving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</span> : <><Save size={15} /> Save preferences</>}
          </button>
        </div>
      </div>

      {/* Security note */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <Shield size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Demo authentication</p>
          <p className="text-xs text-amber-700 mt-0.5">
            This app uses a demo auth mechanism stored in your browser. It is not production-secure.
            Password changes here are simulated and do not alter stored credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, desc, checked, onChange }: { icon: React.ReactNode; label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? 'bg-slate-900' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

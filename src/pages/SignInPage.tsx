import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { DEMO_CREDENTIALS } from '@/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = 'signin' | 'register';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function SignInPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const from = (location.state as { from?: string } | null)?.from || '/dashboard';

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  const isRegister = mode === 'register';

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setFormError('');
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrors({});
    setFormError('');
  };

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (isRegister && !name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (isRegister && password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!isRegister && password.length < 4) e.password = 'Password must be at least 4 characters';
    if (isRegister && confirmPassword !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isRegister) {
        await signUp(email, password, name);
        toast.push('Account created. Welcome to OnGround.ai!', 'success');
      } else {
        await signIn(email, password, remember);
        toast.push('Welcome back!', 'success');
      }
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <div className="h-16 border-b border-slate-200 bg-white flex items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid place-items-center w-8 h-8 rounded-lg bg-slate-900 text-white">
            <Sparkles size={16} />
          </div>
          <span className="text-sm font-semibold text-slate-900">OnGround.ai</span>
        </Link>
        <Link to="/" className="ml-auto flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={15} /> Back home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-slate-900">
              {isRegister ? 'Create your account' : 'Sign in to your workspace'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {isRegister
                ? 'Register to start using the OnGround.ai Call Centre.'
                : 'Enter your credentials to access the call centre.'}
            </p>
          </div>

          {/* Demo banner — only on sign-in */}
          {!isRegister && (
            <div className="mb-5 rounded-lg border border-sky-200 bg-sky-50 p-3.5">
              <p className="text-xs font-semibold text-sky-800 mb-1">Demo account</p>
              <p className="text-sm text-sky-700">
                Email: <span className="font-medium">{DEMO_CREDENTIALS.email}</span><br />
                Password: <span className="font-medium">{DEMO_CREDENTIALS.password}</span>
              </p>
              <button onClick={fillDemo} className="mt-2 text-xs font-semibold text-sky-700 underline hover:text-sky-900">
                Fill demo credentials
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            {formError && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5">
                <AlertCircle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                <p className="text-sm text-rose-700">{formError}</p>
              </div>
            )}

            {isRegister && (
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Full name</span>
                <div className="relative mt-1">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className={`input pl-9 ${errors.name ? 'border-rose-400' : ''}`}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}
              </label>
            )}

            <label className="block">
              <span className="text-xs font-medium text-slate-600">Email address</span>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`input pl-9 ${errors.email ? 'border-rose-400' : ''}`}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-600">
                {isRegister ? 'Password (min 6 characters)' : 'Password'}
              </span>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'Create a password' : 'Enter your password'}
                  className={`input pl-9 pr-10 ${errors.password ? 'border-rose-400' : ''}`}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="mt-1 block text-xs text-rose-600">{errors.password}</span>}
            </label>

            {isRegister && (
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Confirm password</span>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`input pl-9 ${errors.confirm ? 'border-rose-400' : ''}`}
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirm}
                  />
                </div>
                {errors.confirm && <span className="mt-1 block text-xs text-rose-600">{errors.confirm}</span>}
              </label>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => toast.push('Password reset is not available in the demo build.', 'info')}
                  className="text-sm text-slate-500 hover:text-slate-800"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {isRegister ? 'Creating account…' : 'Signing in…'}
                </span>
              ) : (
                <>{isRegister ? 'Create account' : 'Sign In'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Toggle between sign-in and register */}
          <p className="mt-5 text-center text-sm text-slate-500">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button onClick={() => switchMode('signin')} className="font-semibold text-slate-800 hover:text-slate-900 underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to OnGround.ai?{' '}
                <button onClick={() => switchMode('register')} className="font-semibold text-slate-800 hover:text-slate-900 underline">
                  Create an account
                </button>
              </>
            )}
          </p>

          <p className="mt-4 text-center text-xs text-slate-400">
            Demo authentication — sessions stored in your browser. Not for production use.
          </p>
        </div>
      </div>
    </div>
  );
}

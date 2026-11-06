import { Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, PhoneCall, Users, CalendarDays, Radio, TrendingUp, ArrowRight, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    { icon: PhoneCall, title: 'Smart Call Queue', desc: 'Prioritised leads, simulated calling, and outcome logging — all in one console.' },
    { icon: Users, title: 'Lead Management', desc: 'Track ICP fit, intent scores, deal value, and buying signals for every contact.' },
    { icon: CalendarDays, title: 'Shared Calendar', desc: 'Schedule calls, follow-ups, and demos with full CRUD and lead linking.' },
    { icon: Radio, title: 'Pulse Team Chat', desc: 'Collaborate with agents, share kudos, and resolve items needing your input.' },
    { icon: TrendingUp, title: 'Live Dashboard', desc: 'Real-time KPIs, earnings charts, and a daily calling progress tracker.' },
    { icon: Shield, title: 'Secure Access', desc: 'Sign-in protected workspace with per-user profile and settings.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-slate-900 text-white">
              <Sparkles size={18} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">OnGround.ai</div>
              <div className="text-[11px] text-slate-500">Call Centre</div>
            </div>
          </div>
          <button onClick={() => navigate('/signin')} className="btn-primary">
            Sign In <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 mb-5">
              <Zap size={13} className="text-amber-500" />
              Built for field sales teams
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Close more deals.<br />
              <span className="text-slate-500">One call at a time.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl leading-relaxed">
              OnGround.ai is a complete call-centre workspace for sales reps. Manage leads, run a
              prioritised call queue, track outcomes, schedule follow-ups, and collaborate with your
              team — all from one dashboard.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/signin')} className="btn-primary text-base px-6 py-3">
                Sign In to your workspace <ArrowRight size={17} />
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-500 sm:ml-2">
                <Shield size={15} /> Demo account ready — no setup required.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
                <div className="grid place-items-center w-11 h-11 rounded-xl bg-slate-900 text-white mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to make your next call?</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Sign in with the demo account to explore the full workspace — dashboard, leads, calls,
            calendar, and Pulse chat.
          </p>
          <button onClick={() => navigate('/signin')} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 font-semibold px-6 py-3 hover:bg-slate-100 transition-colors">
            Sign In <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center w-7 h-7 rounded-lg bg-slate-900 text-white">
              <Sparkles size={14} />
            </div>
            <span className="text-sm text-slate-600">OnGround.ai Call Centre</span>
          </div>
          <p className="text-xs text-slate-400">Demo application — authentication is not production-secure.</p>
        </div>
      </footer>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Map,
  Mic,
  Phone,
  RefreshCw,
  CalendarClock,
  MessageSquare,
  Award,
  ArrowRight,
  Radio,
  Users,
} from 'lucide-react';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { avaniBot, agents, channels, kudos } from '@/data/pulse';
import type { AgentCard } from '@/types';

const agentIcons: Record<string, typeof Map> = {
  Map,
  Mic,
  Phone,
  RefreshCw,
  CalendarClock,
};

export function PulseHomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Pulse</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your AI sales floor — agents, channels and kudos</p>
      </div>

      {/* AvaniBot hero */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="grid place-items-center w-14 h-14 rounded-xl bg-white/10 shrink-0">
            <Sparkles size={26} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{avaniBot.name}</h2>
              <span className="badge bg-emerald-500/20 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">{avaniBot.lastMessage}</p>
          </div>
          <button
            onClick={() => navigate('/pulse/ch-avani')}
            className="btn bg-white text-slate-900 hover:bg-slate-100"
          >
            <MessageSquare size={15} /> Open chat
          </button>
        </div>
      </Card>

      {/* Agent cards */}
      <div>
        <SectionTitle title="Agents" subtitle="Role & task AI agents" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((a: AgentCard) => {
            const Icon = agentIcons[a.icon] || Sparkles;
            return (
              <Card key={a.id} className="flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="grid place-items-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{a.name}</span>
                      <Badge tone={a.status === 'active' ? 'green' : a.status === 'idle' ? 'amber' : 'neutral'}>
                        {a.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">{a.role}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-3">{a.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Channels + Kudos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="Channels" subtitle="Direct and team conversations" />
          <div className="divide-y divide-slate-100">
            {channels.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/pulse/${c.id}`)}
                className="w-full flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 text-left hover:bg-slate-50 -mx-2 px-2 rounded-md"
              >
                <div className={`grid place-items-center w-9 h-9 rounded-lg shrink-0 ${c.type === 'group' ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-white'}`}>
                  {c.type === 'group' ? <Users size={16} /> : <Radio size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-800 truncate">{c.name}</span>
                    {c.pinned && <span className="text-amber-500">★</span>}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{c.lastMessage}</div>
                </div>
                {c.unread > 0 && (
                  <span className="badge bg-rose-100 text-rose-700 shrink-0">{c.unread}</span>
                )}
                <ArrowRight size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Kudos" subtitle="Recent recognition" />
          <div className="space-y-3">
            {kudos.map((k) => (
              <div key={k.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <div className="grid place-items-center w-9 h-9 rounded-full bg-amber-100 text-amber-700 shrink-0">
                  <Award size={17} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-slate-800">
                    <span className="font-semibold">{k.from}</span> → <span className="font-semibold">{k.to}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{k.message}</div>
                  <div className="mt-1.5">
                    <Badge tone="amber">{k.badge}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

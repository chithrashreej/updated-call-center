import type { AgentCard, Channel, ChatMessage, Kudos } from '@/types';

export const avaniBot = {
  id: 'avani',
  name: 'AvaniBot',
  role: 'AI Sales Assistant',
  description:
    'Your always-on AI assistant. Prepares call briefs, surfaces buying signals, and drafts follow-ups.',
  status: 'active' as const,
  lastMessage: 'Good morning! 3 hot leads need your attention today.',
};

export const agents: AgentCard[] = [
  {
    id: 'asm',
    name: 'ASM Agent',
    role: 'Area Sales Manager',
    description: 'Coordinates territory assignments and rep workload balancing.',
    icon: 'Map',
    status: 'active',
  },
  {
    id: 'pitch',
    name: 'Pitch Coach',
    role: 'Conversation Coach',
    description: 'Live objection handling tips and pitch scoring during calls.',
    icon: 'Mic',
    status: 'active',
  },
  {
    id: 'tele',
    name: 'Tele-caller',
    role: 'Outbound Dialer',
    description: 'Autonomously dials queued leads and books meetings.',
    icon: 'Phone',
    status: 'idle',
  },
  {
    id: 'walkout',
    name: 'Walk-out Recovery',
    role: 'Retention Agent',
    description: 'Re-engages leads who drop off mid-funnel.',
    icon: 'RefreshCw',
    status: 'idle',
  },
  {
    id: 'followup',
    name: 'Follow-up',
    role: 'Nurture Agent',
    description: 'Schedules and sends multi-step follow-up sequences.',
    icon: 'CalendarClock',
    status: 'active',
  },
];

export const channels: Channel[] = [
  {
    id: 'ch-avani',
    name: 'AvaniBot',
    type: 'agent',
    lastMessage: '3 hot leads need your attention today',
    unread: 2,
    pinned: true,
  },
  {
    id: 'ch-pitch',
    name: 'Pitch Coach',
    type: 'agent',
    lastMessage: 'Try the budget anchor on Marcus',
    unread: 1,
  },
  {
    id: 'ch-team',
    name: 'Sales Team',
    type: 'group',
    lastMessage: 'Sofia: great win on Vertex!',
    unread: 5,
  },
  {
    id: 'ch-asm',
    name: 'ASM Agent',
    type: 'agent',
    lastMessage: 'Territory rebalance complete',
    unread: 0,
  },
  {
    id: 'ch-followup',
    name: 'Follow-up Agent',
    type: 'agent',
    lastMessage: '7 sequences sent today',
    unread: 0,
  },
];

export const seedMessages: ChatMessage[] = [
  {
    id: 'M-001',
    channelId: 'ch-avani',
    author: 'AvaniBot',
    text: 'Good morning! Here is your daily brief. You have 3 high-priority leads and 2 scheduled calls today.',
    timestamp: '2026-10-19T08:00:00',
  },
  {
    id: 'M-002',
    channelId: 'ch-avani',
    author: 'AvaniBot',
    text: 'Marcus Bennett (Summit Financial, $120k) replied to your proposal. He wants to discuss the 3-year term.',
    timestamp: '2026-10-19T08:02:00',
  },
  {
    id: 'M-003',
    channelId: 'ch-avani',
    author: 'AvaniBot',
    text: 'Needs Your Input: Rahul Desai asked for a 15% volume discount on the 3-year plan. Should I approve up to 12%?',
    timestamp: '2026-10-19T08:05:00',
    pinned: true,
    needsInput: true,
    options: ['Approve up to 12%', 'Hold at list price', 'Escalate to manager'],
  },
  {
    id: 'M-004',
    channelId: 'ch-pitch',
    author: 'Pitch Coach',
    text: 'For your 2pm with Marcus — open with the ROI anchor. He responded well to it last call.',
    timestamp: '2026-10-19T07:45:00',
  },
  {
    id: 'M-005',
    channelId: 'ch-pitch',
    author: 'Pitch Coach',
    text: 'Needs Your Input: Sofia raised a procurement objection. Recommend sharing the security one-pager — send it now?',
    timestamp: '2026-10-19T09:20:00',
    pinned: true,
    needsInput: true,
    options: ['Send security one-pager', 'Schedule a call instead'],
  },
  {
    id: 'M-006',
    channelId: 'ch-team',
    author: 'Sofia Martinez',
    text: 'Team — just closed Vertex Software for $88k! 🎉',
    timestamp: '2026-10-18T17:30:00',
  },
  {
    id: 'M-007',
    channelId: 'ch-team',
    author: 'David Chen',
    text: 'Incredible! Great work on the multi-thread there.',
    timestamp: '2026-10-18T17:35:00',
  },
];

export const kudos: Kudos[] = [
  {
    id: 'K-001',
    from: 'Sofia Martinez',
    to: 'David Chen',
    message: 'For crushing the Vertex multi-thread deal',
    badge: 'Closer',
    date: '2026-10-18',
  },
  {
    id: 'K-002',
    from: 'AvaniBot',
    to: 'You',
    message: 'For 11 conversions this week — top of the board',
    badge: 'Top Performer',
    date: '2026-10-17',
  },
  {
    id: 'K-003',
    from: 'Marcus Lee',
    to: 'You',
    message: 'For a flawless discovery on Summit Financial',
    badge: 'Discovery Pro',
    date: '2026-10-15',
  },
];

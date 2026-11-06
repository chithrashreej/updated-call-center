// Core data models for the OnGround.ai Call Centre app

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Callback'
  | 'Not Interested'
  | 'Closed';

export interface BuyingSignal {
  id: string;
  label: string;
  detail: string;
  weight: number; // 1-5 strength
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  title: string;
  phone: string;
  email: string;
  city: string;
  score: number; // ICP fit score 0-100
  intent: number; // lead intent score 0-100
  value: number; // deal value at stake
  status: LeadStatus;
  source: string;
  lastTouch: string; // ISO date
  followUpDate?: string; // YYYY-MM-DD
  buyingSignals: BuyingSignal[];
  notes?: string;
}

export type CallType = 'Outbound' | 'Inbound' | 'Missed' | 'Callback' | 'Practice';
export type CallStatus = 'Completed' | 'Missed' | 'Voicemail' | 'Scheduled' | 'In Progress';

export interface CallRecord {
  id: string;
  type: CallType;
  contactName: string;
  company: string;
  phone: string;
  date: string; // ISO date
  time: string; // HH:MM
  durationSeconds: number;
  status: CallStatus;
  outcome?: string;
  value?: number;
  notes?: string;
  leadId?: string;
  simulated?: boolean;
}

export interface IncomingCall {
  id: string;
  callerName: string;
  company: string;
  phone: string;
  time: string; // ISO datetime
  reason: string;
  status: 'Missed' | 'Waiting' | 'Queued';
  valueAtStake: number;
  leadId?: string;
}

export interface Task {
  id: string;
  title: string;
  type: 'call' | 'follow-up' | 'review' | 'leads';
  due: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
  leadIds?: string[];
  meta?: string;
}

export type CalendarEventType = 'call' | 'follow-up' | 'meeting' | 'demo';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  type: CalendarEventType;
  withName: string;
  company: string;
  durationMinutes: number;
  leadId?: string;
}

export interface KpiPoint {
  day: string;
  calls: number;
  connected: number;
  converted: number;
  earnings: number;
}

export interface AgentCard {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string; // lucide icon name key
  status: 'active' | 'idle' | 'offline';
}

export interface Channel {
  id: string;
  name: string;
  type: 'dm' | 'group' | 'agent';
  lastMessage: string;
  unread: number;
  pinned?: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  author: string;
  avatar?: string;
  text: string;
  timestamp: string; // ISO
  pinned?: boolean;
  needsInput?: boolean;
  options?: string[];
}

export interface Kudos {
  id: string;
  from: string;
  to: string;
  message: string;
  badge: string;
  date: string;
}

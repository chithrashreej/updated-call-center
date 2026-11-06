import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CalendarEvent, CallRecord, IncomingCall, Lead } from '@/types';
import { leads as seedLeads } from '@/data/leads';
import { incomingCalls as seedIncoming, recentCalls as seedCalls } from '@/data/calls';
import { calendarEvents as seedEvents } from '@/data/calendar';
import { addDaysISO, daysBetween, todayISODate } from '@/utils/dates';

const STORAGE_KEY = 'ongroundai_store_v1';
const SEED_DATE = '2026-10-19';

export type LeadInput = Omit<Lead, 'id' | 'buyingSignals'>;
export type EventInput = Omit<CalendarEvent, 'id'>;
export type CallInput = Omit<CallRecord, 'id'>;

export interface StoreData {
  leads: Lead[];
  incomingCalls: IncomingCall[];
  calls: CallRecord[];
  events: CalendarEvent[];
}

interface DataContextValue extends StoreData {
  addLead: (input: LeadInput) => Lead;
  updateLead: (id: string, input: LeadInput) => void;
  deleteLead: (id: string) => void;
  logCall: (input: CallInput) => CallRecord;
  updateIncomingCall: (id: string, patch: Partial<IncomingCall>) => void;
  addEvent: (input: EventInput) => CalendarEvent;
  updateEvent: (id: string, input: EventInput) => void;
  deleteEvent: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function shiftDateTime(iso: string, days: number): string {
  return addDaysISO(iso.slice(0, 10), days) + iso.slice(10);
}

function buildSeed(): StoreData {
  const offset = daysBetween(SEED_DATE, todayISODate());
  const leads = seedLeads.map((l) => ({ ...l, lastTouch: addDaysISO(l.lastTouch, offset) }));
  const leadIdByPhone = new Map(leads.map((l) => [l.phone, l.id]));
  const leadIdByName = new Map(leads.map((l) => [l.name, l.id]));
  return {
    leads,
    incomingCalls: seedIncoming.map((c) => ({ ...c, time: shiftDateTime(c.time, offset) })),
    calls: seedCalls.map((c) => ({
      ...c,
      date: addDaysISO(c.date, offset),
      leadId: leadIdByPhone.get(c.phone),
    })),
    events: seedEvents.map((e) => ({
      ...e,
      date: addDaysISO(e.date, offset),
      leadId: leadIdByName.get(e.withName),
    })),
  };
}

function isStoreData(value: unknown): value is StoreData {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return ['leads', 'incomingCalls', 'calls', 'events'].every((k) => Array.isArray(o[k]));
}

function loadStore(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isStoreData(parsed)) return parsed;
    }
  } catch {
    // Unreadable storage falls back to the seed data below.
  }
  return buildSeed();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(loadStore);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Could not save changes to local storage', err);
    }
  }, [data]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setData(loadStore());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addLead = useCallback((input: LeadInput) => {
    const lead: Lead = { ...input, id: newId('L'), buyingSignals: [] };
    setData((d) => ({ ...d, leads: [lead, ...d.leads] }));
    return lead;
  }, []);

  const updateLead = useCallback((id: string, input: LeadInput) => {
    setData((d) => ({
      ...d,
      leads: d.leads.map((l) => (l.id === id ? { ...l, ...input } : l)),
    }));
  }, []);

  const deleteLead = useCallback((id: string) => {
    const unlink = <T extends { leadId?: string }>(items: T[]) =>
      items.map((item) => (item.leadId === id ? { ...item, leadId: undefined } : item));
    setData((d) => ({
      leads: d.leads.filter((l) => l.id !== id),
      incomingCalls: unlink(d.incomingCalls),
      calls: unlink(d.calls),
      events: unlink(d.events),
    }));
  }, []);

  const logCall = useCallback((input: CallInput) => {
    const record: CallRecord = { ...input, id: newId('C') };
    setData((d) => ({
      ...d,
      calls: [record, ...d.calls],
      leads: input.leadId
        ? d.leads.map((l) =>
            l.id === input.leadId
              ? {
                  ...l,
                  lastTouch: input.date,
                  status: l.status === 'New' ? 'Contacted' : l.status,
                }
              : l
          )
        : d.leads,
    }));
    return record;
  }, []);

  const updateIncomingCall = useCallback((id: string, patch: Partial<IncomingCall>) => {
    setData((d) => ({
      ...d,
      incomingCalls: d.incomingCalls.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const addEvent = useCallback((input: EventInput) => {
    const event: CalendarEvent = { ...input, id: newId('E') };
    setData((d) => ({ ...d, events: [...d.events, event] }));
    return event;
  }, []);

  const updateEvent = useCallback((id: string, input: EventInput) => {
    setData((d) => ({
      ...d,
      events: d.events.map((e) => (e.id === id ? { ...e, ...input, id } : e)),
    }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      ...data,
      addLead,
      updateLead,
      deleteLead,
      logCall,
      updateIncomingCall,
      addEvent,
      updateEvent,
      deleteEvent,
    }),
    [data, addLead, updateLead, deleteLead, logCall, updateIncomingCall, addEvent, updateEvent, deleteEvent]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CallType, Lead } from '@/types';

export interface CallTarget {
  name: string;
  company: string;
  title?: string;
  phone: string;
  email?: string;
  city?: string;
  leadId?: string;
  callType: Extract<CallType, 'Outbound' | 'Callback'>;
}

interface CallContextValue {
  target: CallTarget | null;
  startCall: (target: CallTarget) => void;
  endCall: () => void;
}

const CallContext = createContext<CallContextValue | null>(null);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
}

export function targetFromLead(lead: Lead, callType: CallTarget['callType'] = 'Outbound'): CallTarget {
  return {
    name: lead.name,
    company: lead.company,
    title: lead.title,
    phone: lead.phone,
    email: lead.email,
    city: lead.city,
    leadId: lead.id,
    callType,
  };
}

export function CallProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<CallTarget | null>(null);

  const startCall = useCallback((next: CallTarget) => setTarget(next), []);
  const endCall = useCallback(() => setTarget(null), []);

  const value = useMemo(() => ({ target, startCall, endCall }), [target, startCall, endCall]);

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface LeadsModalContextValue {
  openLeadIds: string[] | null;
  openIndex: number;
  openLeads: (ids: string[], index?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  setIndex: (i: number) => void;
}

const LeadsModalContext = createContext<LeadsModalContextValue | null>(null);

export function useLeadsModal() {
  const ctx = useContext(LeadsModalContext);
  if (!ctx) throw new Error('useLeadsModal must be used within LeadsModalProvider');
  return ctx;
}

export function LeadsModalProvider({ children }: { children: ReactNode }) {
  const [openLeadIds, setOpenLeadIds] = useState<string[] | null>(null);
  const [openIndex, setOpenIndex] = useState(0);

  const openLeads = useCallback((ids: string[], index = 0) => {
    setOpenLeadIds(ids);
    setOpenIndex(index);
  }, []);

  const close = useCallback(() => setOpenLeadIds(null), []);
  const next = useCallback(() => setOpenIndex((i) => (openLeadIds ? (i + 1) % openLeadIds.length : i)), [openLeadIds]);
  const prev = useCallback(() => setOpenIndex((i) => (openLeadIds ? (i - 1 + openLeadIds.length) % openLeadIds.length : i)), [openLeadIds]);
  const setIndex = useCallback((i: number) => setOpenIndex(i), []);

  const value = useMemo(
    () => ({ openLeadIds, openIndex, openLeads, close, next, prev, setIndex }),
    [openLeadIds, openIndex, openLeads, close, next, prev, setIndex]
  );

  return <LeadsModalContext.Provider value={value}>{children}</LeadsModalContext.Provider>;
}

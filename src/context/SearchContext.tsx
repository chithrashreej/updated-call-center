import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface SearchContextValue {
  query: string;
}

const SearchContext = createContext<SearchContextValue>({ query: '' });

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ query, children }: { query: string; children: ReactNode }) {
  const value = useMemo(() => ({ query }), [query]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

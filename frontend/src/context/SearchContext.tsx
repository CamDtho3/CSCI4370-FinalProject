import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface SearchQuery {
  /** Free text — city, cuisine, or restaurant name. */
  term: string
  /** ISO date, 'YYYY-MM-DD'. Matches TimeSlot.slot_date over the wire. */
  slotDate: string
  partySize: number
}

interface SearchContextValue {
  query: SearchQuery
  setQuery: (next: Partial<SearchQuery>) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export const defaultQuery: SearchQuery = {
  term: '',
  slotDate: today(),
  partySize: 2,
}

/**
 * Holds the search parameters shared by the hero search on the home page
 * and the compact search in the header. Both read and write this, so a
 * query survives navigation between them.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setState] = useState<SearchQuery>(defaultQuery)

  const value = useMemo(
    () => ({
      query,
      setQuery: (next: Partial<SearchQuery>) =>
        setState((prev) => ({ ...prev, ...next })),
    }),
    [query],
  )

  return <SearchContext value={value}>{children}</SearchContext>
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider')
  return ctx
}

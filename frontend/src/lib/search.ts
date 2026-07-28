import type { RestaurantResponse } from '../api/types'

/* Client-side matching for the typeahead. Lives here rather than in
   the mocks because it survives the swap to a real API — the list gets
   fetched and cached, but the filtering stays in the browser. */

export type MatchField = 'name' | 'cuisine'

/**
 * Which field a query hits, or null for no match. Both match anywhere
 * in the string, so "ho" finds "The Chop House" and "american" finds
 * "New American".
 *
 * City is deliberately not searchable: every restaurant is in Athens,
 * so the filter would never narrow anything.
 */
export function matchField(
  r: RestaurantResponse,
  query: string,
): MatchField | null {
  const q = query.trim().toLowerCase()
  if (!q) return null

  if (r.restName.toLowerCase().includes(q)) return 'name'
  if (r.cuisine.toLowerCase().includes(q)) return 'cuisine'
  return null
}

const FIELD_RANK: Record<MatchField, number> = {
  name: 0,
  cuisine: 1,
}

export interface RestaurantMatch {
  restaurant: RestaurantResponse
  field: MatchField
}

/**
 * Filters and ranks. A name hit outranks a cuisine hit; ties break on
 * how early the match appears, so "Pom" puts "Pompeii" above a
 * restaurant merely containing those letters later on.
 */
export function searchRestaurants(
  restaurants: RestaurantResponse[],
  query: string,
  limit = 8,
): RestaurantMatch[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const hits: RestaurantMatch[] = []
  for (const restaurant of restaurants) {
    const field = matchField(restaurant, q)
    if (field) hits.push({ restaurant, field })
  }

  hits.sort((a, b) => {
    const rank = FIELD_RANK[a.field] - FIELD_RANK[b.field]
    if (rank !== 0) return rank

    const aPos = a.restaurant.restName.toLowerCase().indexOf(q)
    const bPos = b.restaurant.restName.toLowerCase().indexOf(q)
    if (aPos !== bPos) return (aPos < 0 ? 999 : aPos) - (bPos < 0 ? 999 : bPos)

    return a.restaurant.restName.localeCompare(b.restaurant.restName)
  })

  return hits.slice(0, limit)
}

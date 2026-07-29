import type {
  RestaurantResponse,
  TimeSlotResponse,
  RestaurantWithSlots,
  OperationHoursResponse,
} from '../api/types'
import {
  getRestaurantByPhone,
  getRestaurantHoursByPhone,
} from '../api/restaurants'
import { searchRestaurants } from '../lib/search'

/* ===================================================================
   Mock restaurant data — real Athens, GA establishments.

   Addresses and phone numbers came from public listings and were
   accurate as of July 2026. Verify anything you intend to present as
   fact; restaurants move and numbers change.

   ESTIMATED, NOT SOURCED: priceRange, avgRating, reviewCount.
   Ratings stand in for aggregates Spring will compute over Review.

   16 restaurants. Tres Amigos was dropped — no published phone
   number, and rest_phone is the natural key.

   This file becomes a Flyway seed migration once the schema lands.
   Because it already matches the API contract, converting it is
   mechanical — one INSERT per object.
   =================================================================== */

export const mockRestaurants: RestaurantResponse[] = [
  {
    restPhone: '706-546-7300',
    restName: 'Five and Ten',
    street: '1073 S Milledge Ave',
    zip: '30605',
    city: 'Athens',
    state: 'GA',
    cuisine: 'New American',
    priceRange: 4,
    imageUrl: '/images/FiveAndTen.jpg',
    avgRating: 4.6,
    reviewCount: 177,
  },
  {
    restPhone: '706-549-0810',
    restName: 'Last Resort Grill',
    street: '184 W Clayton St',
    zip: '30601',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Southern',
    priceRange: 2,
    imageUrl: '/images/LastResortGrill.jpg',
    avgRating: 4.5,
    reviewCount: 931,
  },
  {
    restPhone: '706-549-3450',
    restName: 'The National',
    street: '232 W Hancock Ave',
    zip: '30601',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Mediterranean',
    priceRange: 3,
    imageUrl: '/images/TheNational.jpg',
    avgRating: 4.6,
    reviewCount: 254,
  },
  {
    restPhone: '706-395-6125',
    restName: 'South Kitchen + Bar',
    street: '247 E Washington St',
    zip: '30601',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Southern',
    priceRange: 2,
    imageUrl: '/images/SouthKitchenAndBar.jpg',
    avgRating: 4.4,
    reviewCount: 523,
  },
  {
    restPhone: '706-850-2988',
    restName: 'The Place',
    street: '229 E Broad St',
    zip: '30601',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Southern',
    priceRange: 2,
    imageUrl: '/images/ThePlace.jpg',
    avgRating: 4.4,
    reviewCount: 549,
  },
  {
    restPhone: '762-316-1818',
    restName: 'Osteria Olio',
    street: '355 Oneta St',
    zip: '30601',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Italian',
    priceRange: 3,
    imageUrl: '/images/OsteriaOlio.jpg',
    avgRating: 4.6,
    reviewCount: 143,
  },
  {
    restPhone: '706-395-6556',
    restName: "ZZ & Simone's",
    street: '1540 S Lumpkin St',
    zip: '30605',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Italian',
    priceRange: 3,
    imageUrl: '/images/ZZAndSimones.jpg',
    avgRating: 4.5,
    reviewCount: 114,
  },
  {
    restPhone: '706-850-3451',
    restName: 'Marker Seven Coastal Grill',
    street: '1195 S Milledge Ave',
    zip: '30605',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Seafood',
    priceRange: 3,
    imageUrl: '/images/MarkerSevenCoastalGrill.jpg',
    avgRating: 4.4,
    reviewCount: 219,
  },
  {
    restPhone: '706-395-7855',
    restName: 'The Chop House',
    street: '2055 Oconee Connector',
    zip: '30606',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Steakhouse',
    priceRange: 4,
    imageUrl: '/images/TheChopHouse.jpg',
    avgRating: 4.3,
    reviewCount: 585,
  },
  {
    restPhone: '706-353-7667',
    restName: 'Hilltop Grille',
    street: '2310 W Broad St',
    zip: '30606',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Steakhouse',
    priceRange: 3,
    imageUrl: '/images/HilltopGrille.jpg',
    avgRating: 4.2,
    reviewCount: 144,
  },
  {
    restPhone: '706-353-4721',
    restName: 'The Globe',
    street: '199 N Lumpkin St',
    zip: '30601',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Pub',
    priceRange: 2,
    imageUrl: '/images/TheGlobe.jpg',
    avgRating: 4.4,
    reviewCount: 172,
  },
  {
    restPhone: '706-543-8997',
    restName: 'Trappeze Pub',
    street: '269 N Hull St',
    zip: '30601',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Pub',
    priceRange: 2,
    imageUrl: '/images/TrappezePub.jpg',
    avgRating: 4.5,
    reviewCount: 312,
  },
  {
    restPhone: '706-543-4002',
    restName: 'The World Famous',
    street: '351 N Hull St',
    zip: '30601',
    city: 'Athens',
    state: 'GA',
    cuisine: 'American',
    priceRange: 2,
    imageUrl: '/images/TheWorldFamous.jpg',
    avgRating: 4.4,
    reviewCount: 269,
  },
  {
    restPhone: '706-207-8700',
    restName: 'The Local 706',
    street: '1676 S Lumpkin St',
    zip: '30605',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Gastropub',
    priceRange: 2,
    imageUrl: '/images/TheLocal706.jpg',
    avgRating: 4.3,
    reviewCount: 55,
  },
  {
    restPhone: '678-403-3838',
    restName: 'La Parrilla Mexican Restaurant',
    street: '196 Alps Rd',
    zip: '30606',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Mexican',
    priceRange: 2,
    imageUrl: '/images/LaParrillaMexicanRestaurant.jpg',
    avgRating: 4.1,
    reviewCount: 25,
  },
  {
    // Opened spring 2026 — no reviews yet. Renders the "New" badge.
    restPhone: '706-521-8498',
    restName: 'Tikka Nation',
    street: '142 W Clayton St',
    zip: '30601',
    city: 'Athens',
    state: 'GA',
    cuisine: 'Indian',
    priceRange: 2,
    imageUrl: '/images/TikkaNationAthens.jpg',
    avgRating: null,
    reviewCount: 0,
  },
]

/* -------------------------------------------------------------------
   Slot generation.

   Real slots come from the TimeSlot table, generated from
   RestaurantHours. This stands in until that endpoint exists, and
   deliberately produces some full and some sparse slots so the
   unavailable and near-capacity states are reachable in the UI.
   ------------------------------------------------------------------- */

/* Stored 24-hour, displayed 12-hour. Lunch and dinner service, so the
   AM/PM distinction is real rather than decorative. */

/** Deterministic pseudo-random so a given restaurant and date always
 *  render the same availability. Makes screenshots reproducible. */
function seeded(restPhone: string, slotDate: string, slotTime: string): number {
  const key = `${restPhone}${slotDate}${slotTime}`
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const SERVICE_TIMES = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
  '20:30', '21:00',
]

export function mockSlotsFor(
  restPhone: string,
  slotDate: string,
): TimeSlotResponse[] {
  return SERVICE_TIMES.map((slotTime) => {
    const n = seeded(restPhone, slotDate, slotTime)
    const slotCapacity = 20 + (n % 3) * 10
    // Roughly one slot in six comes back full.
    const availableSpots = n % 6 === 0 ? 0 : n % slotCapacity
    return { slotDate, slotTime, slotCapacity, availableSpots }
  })
}

export function mockRestaurantsWithSlots(
  slotDate: string,
): RestaurantWithSlots[] {
  return mockRestaurants.map((r) => ({
    ...r,
    slots: mockSlotsFor(r.restPhone, slotDate),
  }))
}

export async function findRestaurant(
  restPhone: string,
): Promise<RestaurantResponse | undefined> {
  return getRestaurantByPhone(restPhone)
}

export async function findRestaurantHours(
  restPhone: string,
  dayOfWeek: string,
): Promise<OperationHoursResponse | undefined> {
  return getRestaurantHoursByPhone(restPhone, dayOfWeek)
}

/** Matches the free-text search box. Shares the typeahead's matching
 *  rules — see lib/search.ts for why city matches on prefix only. */
export function searchMockRestaurants(term: string): RestaurantResponse[] {
  if (!term.trim()) return mockRestaurants
  return searchRestaurants(mockRestaurants, term, mockRestaurants.length).map(
    (m) => m.restaurant,
  )
}

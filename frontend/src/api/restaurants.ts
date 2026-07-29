import type {
  OperationHoursResponse,
  RestaurantResponse,
  ReservationResponse,
  TimeSlotResponse,
  RestaurantWithSlots,
} from './types'
import { mockRestaurants, mockSlotsFor } from '../mocks/restaurants.ts'

export async function getRestaurantByPhone(
  restPhone: string,
): Promise<RestaurantResponse | undefined> {
  const response = await fetch(`/api/restaurants/${encodeURIComponent(restPhone)}`)

  if (response.status === 404) return undefined
  if (!response.ok) {
    throw new Error(`Failed to load restaurant ${restPhone}`)
  }

  return (await response.json()) as RestaurantResponse
}

export async function getRestaurantHoursByPhone(
  restPhone: string,
  dayOfWeek: string,
): Promise<OperationHoursResponse | undefined> {
  const response = await fetch(
    `/api/restaurant-hours/${encodeURIComponent(restPhone)}?dayOfWeek=${encodeURIComponent(dayOfWeek)}`,
  )

  if (response.status === 404) return undefined
  if (!response.ok) {
    throw new Error(`Failed to load restaurant hours for ${restPhone}`)
  }

  return (await response.json()) as OperationHoursResponse
}

export async function getReservationsByRestaurantAndDate(
  restPhone: string,
  slotDate: string,
): Promise<ReservationResponse[]> {
  const response = await fetch(
    `/api/reservations/restaurant/${encodeURIComponent(restPhone)}?slotDate=${encodeURIComponent(slotDate)}`,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load reservations for ${restPhone} on ${slotDate}`,
    )
  }

  return (await response.json()) as ReservationResponse[]
}

export function RestaurantsWithSlots(
  slotDate: string,
): RestaurantWithSlots[] {
  return mockRestaurants.map((r) => ({
    ...r,
    slots: mockSlotsFor(r.restPhone, slotDate),
  }))
}

/**
 * Slots come straight from the reservation_slot table — slotCapacity is
 * whatever the restaurant actually configured, and availableSpots is
 * computed server-side from real bookings. Nothing about capacity or
 * open/close times gets invented on the client.
 */
export async function SlotsFor(
  restPhone: string,
  slotDate: string,
): Promise<TimeSlotResponse[]> {
  const response = await fetch(
    `/api/reservation-slots/restaurant/${encodeURIComponent(restPhone)}?slotDate=${encodeURIComponent(slotDate)}`,
  )

  if (!response.ok) {
    throw new Error(`Failed to load slots for ${restPhone} on ${slotDate}`)
  }

  return (await response.json()) as TimeSlotResponse[]
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

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

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const timeSlots: string[] = [];

  // Helper function to convert "HH:MM" string to total minutes
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to convert total minutes back to "HH:MM" string
  const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Loop in 15-minute increments
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 15) {
    timeSlots.push(minutesToTime(minutes));
  }

  return timeSlots;
}

function getDayName(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function RestaurantsWithSlots(
  slotDate: string,
): RestaurantWithSlots[] {
  return mockRestaurants.map((r) => ({
    ...r,
    slots: mockSlotsFor(r.restPhone, slotDate),
  }))
}

export async function SlotsFor(
  restPhone: string,
  slotDate: string,
): Promise<TimeSlotResponse[]> {
  const dayOfWeek = getDayName(slotDate)
  const hours = await findRestaurantHours(restPhone, dayOfWeek)
  if (!hours || hours.isClosed) return []

  const slotTimes = generateTimeSlots(hours.openTime, hours.closeTime)
  const reservations = await getReservationsByRestaurantAndDate(restPhone, slotDate)
  const bookedTimes = reservations.map((r) => r.slotTime)
  const openTimes = slotTimes.filter((time) => !bookedTimes.includes(time))
  const bookingsByTime = new Map<string, number>()

  for (const r of reservations) {
    bookingsByTime.set(r.slotTime, (bookingsByTime.get(r.slotTime) ?? 0) + r.partySize)
  }

  const timeSlots: TimeSlotResponse[] = openTimes.map((slotTime) => {
    const slotCapacity = 5
    const booked = bookingsByTime.get(slotTime) ?? 0

    return {
      slotDate,
      slotTime,
      slotCapacity,
      availableSpots: Math.max(0, slotCapacity - booked),
    }
  })
  return timeSlots
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

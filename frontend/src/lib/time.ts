/* Time formatting.

   The wire format is always 24-hour 'HH:mm' — that is what Postgres
   stores in slot_time and what Spring serialises a LocalTime to.
   Twelve-hour display is a presentation concern and lives only here,
   so nothing that talks to the API ever sees an AM/PM string. */

/** '17:30' -> '5:30 PM' */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

/** '17:30' -> '5:30' — for tight spaces where the period is implied. */
export function formatTimeShort(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')}`
}

/** '17:30' -> 'PM' */
export function periodOf(hhmm: string): 'AM' | 'PM' {
  return Number(hhmm.split(':')[0]) >= 12 ? 'PM' : 'AM'
}

export type MealPeriod = 'lunch' | 'dinner'

/** Anything before 3pm is lunch service. */
export function mealPeriodOf(hhmm: string): MealPeriod {
  return Number(hhmm.split(':')[0]) < 15 ? 'lunch' : 'dinner'
}

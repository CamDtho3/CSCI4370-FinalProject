import type {
  ReservationStatus,
  StaffReservationResponse,
  StatusHistoryEntry,
} from '../api/types'
import { MockApiError } from './reservations'
import { mockSlotsFor } from './restaurants'

/* ===================================================================
   Staff-side reservation store.

   Separate from the diner store because the shapes differ: staff see
   the guest's name and phone plus the full status history, a diner
   sees neither for anyone but themselves.

   The point of this file is the status machine below. Until now every
   reservation got exactly one ReservationStatusHistory row at
   creation and never changed — which meant the audit table, and the
   composite key {res_num, changed_at} driving the 2NF violation,
   never actually did anything. Staff transitions are what exercise it.
   =================================================================== */

/** Which statuses each status may move to. Terminal states map to []. */
export const ALLOWED_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SEATED', 'NO_SHOW', 'CANCELLED'],
  SEATED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export const STATUS_ACTION_LABEL: Record<ReservationStatus, string> = {
  PENDING: 'Mark pending',
  CONFIRMED: 'Confirm',
  SEATED: 'Seat',
  COMPLETED: 'Complete',
  CANCELLED: 'Cancel',
  NO_SHOW: 'No show',
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function ts(hhmm: string, minutesAgo = 0): string {
  const d = new Date(`${today()}T${hhmm}:00`)
  d.setMinutes(d.getMinutes() - minutesAgo)
  return d.toISOString()
}

/** Seeded bookings at The National — matches DEMO_STAFF's employer. */
const STAFF_REST_PHONE = '706-549-3450'

const seeded: StaffReservationResponse[] = [
  {
    resNum: 'RK4M2P', restName: 'The National', restPhone: STAFF_REST_PHONE,
    slotDate: today(), slotTime: '17:30', partySize: 2,
    specialReq: null, resStatus: 'COMPLETED', resCreated: ts('09:12'),
    dinerName: 'Maya Whitfield', dinerEmail: 'maya.w@example.com',
    dinerPhone: '706-555-0118',
    history: [
      { changedAt: ts('09:12'), changedTo: 'PENDING', changedBy: 'maya.w@example.com' },
      { changedAt: ts('09:14'), changedTo: 'CONFIRMED', changedBy: 'host@thenational.com' },
      { changedAt: ts('17:33'), changedTo: 'SEATED', changedBy: 'host@thenational.com' },
      { changedAt: ts('19:02'), changedTo: 'COMPLETED', changedBy: 'host@thenational.com' },
    ],
  },
  {
    resNum: 'RQ7T9B', restName: 'The National', restPhone: STAFF_REST_PHONE,
    slotDate: today(), slotTime: '18:00', partySize: 4,
    specialReq: 'Celebrating an anniversary — a quiet table if possible.',
    resStatus: 'SEATED', resCreated: ts('10:40'),
    dinerName: 'Daniel Okafor', dinerEmail: 'd.okafor@example.com',
    dinerPhone: '706-555-0193',
    history: [
      { changedAt: ts('10:40'), changedTo: 'PENDING', changedBy: 'd.okafor@example.com' },
      { changedAt: ts('10:41'), changedTo: 'CONFIRMED', changedBy: 'host@thenational.com' },
      { changedAt: ts('18:04'), changedTo: 'SEATED', changedBy: 'host@thenational.com' },
    ],
  },
  {
    resNum: 'RH3X8L', restName: 'The National', restPhone: STAFF_REST_PHONE,
    slotDate: today(), slotTime: '19:00', partySize: 6,
    specialReq: 'One guest uses a wheelchair.',
    resStatus: 'CONFIRMED', resCreated: ts('08:05'),
    dinerName: 'Priya Raman', dinerEmail: 'priya.r@example.com',
    dinerPhone: '706-555-0164',
    history: [
      { changedAt: ts('08:05'), changedTo: 'PENDING', changedBy: 'priya.r@example.com' },
      { changedAt: ts('08:22'), changedTo: 'CONFIRMED', changedBy: 'host@thenational.com' },
    ],
  },
  {
    resNum: 'RB6N1V', restName: 'The National', restPhone: STAFF_REST_PHONE,
    slotDate: today(), slotTime: '19:30', partySize: 2,
    specialReq: null, resStatus: 'PENDING', resCreated: ts('12:30'),
    dinerName: 'Elliot Shaw', dinerEmail: 'elliot.s@example.com',
    dinerPhone: null,
    history: [
      { changedAt: ts('12:30'), changedTo: 'PENDING', changedBy: 'elliot.s@example.com' },
    ],
  },
  {
    resNum: 'RD9W5C', restName: 'The National', restPhone: STAFF_REST_PHONE,
    slotDate: today(), slotTime: '20:00', partySize: 3,
    specialReq: 'Nut allergy.', resStatus: 'CONFIRMED', resCreated: ts('11:15'),
    dinerName: 'Sofia Marchetti', dinerEmail: 's.marchetti@example.com',
    dinerPhone: '706-555-0127',
    history: [
      { changedAt: ts('11:15'), changedTo: 'PENDING', changedBy: 's.marchetti@example.com' },
      { changedAt: ts('11:16'), changedTo: 'CONFIRMED', changedBy: 'host@thenational.com' },
    ],
  },
  {
    resNum: 'RF2J7K', restName: 'The National', restPhone: STAFF_REST_PHONE,
    slotDate: today(), slotTime: '20:30', partySize: 2,
    specialReq: null, resStatus: 'CANCELLED', resCreated: ts('07:50'),
    dinerName: 'Tomas Berg', dinerEmail: 't.berg@example.com',
    dinerPhone: '706-555-0155',
    history: [
      { changedAt: ts('07:50'), changedTo: 'PENDING', changedBy: 't.berg@example.com' },
      { changedAt: ts('07:52'), changedTo: 'CONFIRMED', changedBy: 'host@thenational.com' },
      { changedAt: ts('16:20'), changedTo: 'CANCELLED', changedBy: 't.berg@example.com' },
    ],
  },
]

const staffReservations: StaffReservationResponse[] = [...seeded]

export function listStaffReservations(
  restPhone: string,
  slotDate: string,
): StaffReservationResponse[] {
  return staffReservations
    .filter((r) => r.restPhone === restPhone && r.slotDate === slotDate)
    .sort((a, b) => a.slotTime.localeCompare(b.slotTime))
}

/**
 * Moves a reservation to a new status and appends the audit row.
 *
 * Server-side this is one transaction: update reservation.res_status,
 * insert into reservation_status_history. Both or neither — a status
 * change with no trail is exactly the inconsistency the table exists
 * to prevent.
 */
export async function transitionStaffReservation(
  resNum: string,
  to: ReservationStatus,
  changedBy: string,
): Promise<StaffReservationResponse> {
  await new Promise((r) => setTimeout(r, 250))

  const found = staffReservations.find((r) => r.resNum === resNum)
  if (!found) {
    throw new MockApiError(404, 'NOT_FOUND', 'That reservation no longer exists.')
  }

  if (!ALLOWED_TRANSITIONS[found.resStatus].includes(to)) {
    throw new MockApiError(
      409,
      'INVALID_TRANSITION',
      `A ${found.resStatus.toLowerCase()} booking cannot become ${to.toLowerCase()}.`,
    )
  }

  const entry: StatusHistoryEntry = {
    changedAt: new Date().toISOString(),
    changedTo: to,
    changedBy,
  }

  found.resStatus = to
  found.history = [...found.history, entry]
  return { ...found }
}

/**
 * Seats still free at a slot, counting only this restaurant's bookings.
 * `excludeResNum` adds that reservation's own party back, since editing
 * releases its current seats.
 */
export function remainingAtStaffSlot(
  restPhone: string,
  slotDate: string,
  slotTime: string,
  excludeResNum?: string,
): number {
  const slot = mockSlotsFor(restPhone, slotDate).find(
    (s) => s.slotTime === slotTime,
  )
  if (!slot) return 0

  const booked = staffReservations
    .filter(
      (r) =>
        r.restPhone === restPhone &&
        r.slotDate === slotDate &&
        r.slotTime === slotTime &&
        r.resNum !== excludeResNum &&
        r.resStatus !== 'CANCELLED' &&
        r.resStatus !== 'NO_SHOW',
    )
    .reduce((sum, r) => sum + r.partySize, 0)

  return Math.max(0, slot.availableSpots - booked)
}

/**
 * Applies an edit on the staff side.
 *
 * Staff are not held to the diner's two-hour cancellation window — a
 * host moving a guest to a larger table mid-service is the normal case.
 * No history row is written; an edit is not a status transition.
 */
export async function updateStaffReservation(
  resNum: string,
  next: {
    slotDate: string
    slotTime: string
    partySize: number
    specialReq: string
  },
): Promise<StaffReservationResponse> {
  await new Promise((r) => setTimeout(r, 350))

  const found = staffReservations.find((r) => r.resNum === resNum)
  if (!found) {
    throw new MockApiError(404, 'NOT_FOUND', 'That reservation no longer exists.')
  }

  const remaining = remainingAtStaffSlot(
    found.restPhone,
    next.slotDate,
    next.slotTime,
    resNum,
  )
  if (next.partySize > remaining) {
    throw new MockApiError(
      409,
      'SLOT_FULL',
      remaining > 0
        ? `Only ${remaining} ${remaining === 1 ? 'seat' : 'seats'} remain at that time.`
        : 'That time is fully booked.',
    )
  }

  found.slotDate = next.slotDate
  found.slotTime = next.slotTime
  found.partySize = next.partySize
  found.specialReq = next.specialReq.trim() || null

  return { ...found }
}

/** Rolls up the day for the dashboard header. */
export function summarise(reservations: StaffReservationResponse[]) {
  const active = reservations.filter(
    (r) => r.resStatus !== 'CANCELLED' && r.resStatus !== 'NO_SHOW',
  )
  return {
    bookings: active.length,
    covers: active.reduce((sum, r) => sum + r.partySize, 0),
    awaiting: reservations.filter((r) => r.resStatus === 'PENDING').length,
    seated: reservations.filter((r) => r.resStatus === 'SEATED').length,
  }
}

import type { ReservationResponse, ReservationRequest } from '../api/types'
import { findMockRestaurant, mockSlotsFor } from './restaurants'

/* ===================================================================
   In-memory reservation store.

   Stands in for POST /api/reservations and the reservation queries.
   State lives in a module-level array, so it resets on page refresh —
   fine for building UI, and a reminder that this is not persistence.

   The capacity re-check below mirrors what ReservationService does
   inside its transaction. It is the one piece of business logic worth
   duplicating in the mock, because the SLOT_FULL path is otherwise
   unreachable while building.
   =================================================================== */

const reservations: ReservationResponse[] = []

/** Mirrors the ApiError shape the real client throws. */
export class MockApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

function generateResNum(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return `R${out}`
}

/**
 * Creates a reservation, or throws if the slot cannot seat the party.
 *
 * Server-side this also writes the first ReservationStatusHistory row —
 * your model requires 1..* history rows per reservation, so the initial
 * status is recorded at creation rather than on the first edit.
 */
export async function createMockReservation(
  req: ReservationRequest,
  dinerEmail: string,
): Promise<ReservationResponse> {
  // Simulated latency so loading states are visible while building.
  await new Promise((r) => setTimeout(r, 400))

  const restaurant = findMockRestaurant(req.restPhone)
  if (!restaurant) {
    throw new MockApiError(404, 'NOT_FOUND', 'That restaurant no longer exists.')
  }

  const slot = mockSlotsFor(req.restPhone, req.slotDate).find(
    (s) => s.slotTime === req.slotTime,
  )
  if (!slot) {
    throw new MockApiError(404, 'NOT_FOUND', 'That time is no longer offered.')
  }

  const alreadyBooked = reservations
    .filter(
      (r) =>
        r.restPhone === req.restPhone &&
        r.slotDate === req.slotDate &&
        r.slotTime === req.slotTime &&
        r.resStatus !== 'CANCELLED' &&
        r.resStatus !== 'NO_SHOW',
    )
    .reduce((sum, r) => sum + r.partySize, 0)

  const remaining = slot.availableSpots - alreadyBooked
  if (req.partySize > remaining) {
    throw new MockApiError(
      409,
      'SLOT_FULL',
      remaining > 0
        ? `Only ${remaining} ${remaining === 1 ? 'seat' : 'seats'} remain at this time.`
        : 'That time just filled up.',
    )
  }

  const created: ReservationResponse = {
    resNum: generateResNum(),
    restName: restaurant.restName,
    restPhone: restaurant.restPhone,
    slotDate: req.slotDate,
    slotTime: req.slotTime,
    partySize: req.partySize,
    specialReq: req.specialReq?.trim() || null,
    resStatus: 'CONFIRMED',
    resCreated: new Date().toISOString(),
  }

  reservations.push(created)
  // dinerEmail is unused in the mock; server-side it comes from the
  // authenticated principal, never from the request body.
  void dinerEmail

  return created
}

export function findMockReservation(
  resNum: string,
): ReservationResponse | undefined {
  return reservations.find((r) => r.resNum === resNum)
}

export function listMockReservations(): ReservationResponse[] {
  return [...reservations].sort((a, b) =>
    `${b.slotDate}${b.slotTime}`.localeCompare(`${a.slotDate}${a.slotTime}`),
  )
}

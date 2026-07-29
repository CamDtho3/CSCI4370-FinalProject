import type { ReservationResponse, ReservationRequest } from '../api/types'
import { findRestaurant, mockSlotsFor } from './restaurants'

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

    const restaurant = await findRestaurant(req.restPhone)
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

/**
 * Server-side this filters by the authenticated principal — a diner
 * must never receive another diner's bookings. The mock has one user
 * at a time, so it returns everything.
 */
export function listMockReservations(): ReservationResponse[] {
    return [...reservations].sort((a, b) =>
        `${b.slotDate}${b.slotTime}`.localeCompare(`${a.slotDate}${a.slotTime}`),
    )
}

/**
 * Cancels a booking.
 *
 * Server-side this is a status transition, not a delete: the row stays
 * and a ReservationStatusHistory entry records who cancelled it and
 * when. That trail is what settles "I cancelled in time" disputes.
 */
export async function cancelMockReservation(
    resNum: string,
): Promise<ReservationResponse> {
    await new Promise((r) => setTimeout(r, 300))

    const found = reservations.find((r) => r.resNum === resNum)
    if (!found) {
        throw new MockApiError(404, 'NOT_FOUND', 'That reservation no longer exists.')
    }
    if (found.resStatus === 'CANCELLED') {
        throw new MockApiError(409, 'ALREADY_CANCELLED', 'This booking is already cancelled.')
    }
    if (found.resStatus === 'COMPLETED' || found.resStatus === 'SEATED') {
        throw new MockApiError(409, 'NOT_CANCELLABLE', 'This booking can no longer be cancelled.')
    }

    found.resStatus = 'CANCELLED'
    return found
}

/**
 * Seats still free at a slot.
 *
 * `excludeResNum` adds that reservation's own party back — when editing,
 * its existing seats are about to be released, so they count as
 * available. Without it a diner could not keep the party size they
 * already have.
 */
export function remainingAtSlot(
    restPhone: string,
    slotDate: string,
    slotTime: string,
    excludeResNum?: string,
): number {
    const slot = mockSlotsFor(restPhone, slotDate).find(
        (s) => s.slotTime === slotTime,
    )
    if (!slot) return 0

    const booked = reservations
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
 * Applies an edit. Party size, slot, and requests only — the restaurant
 * and the diner are fixed, and changing either would be a different
 * reservation rather than an edit.
 *
 * No ReservationStatusHistory row is written: an edit is not a status
 * transition, and forcing one in would put a meaningless value in
 * changed_to.
 */
export async function updateMockReservation(
    resNum: string,
    next: {
        slotDate: string
        slotTime: string
        partySize: number
        specialReq: string
    },
): Promise<ReservationResponse> {
    await new Promise((r) => setTimeout(r, 350))

    const found = reservations.find((r) => r.resNum === resNum)
    if (!found) {
        throw new MockApiError(404, 'NOT_FOUND', 'That reservation no longer exists.')
    }

    const remaining = remainingAtSlot(
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
                : 'That time just filled up.',
        )
    }

    found.slotDate = next.slotDate
    found.slotTime = next.slotTime
    found.partySize = next.partySize
    found.specialReq = next.specialReq.trim() || null

    return { ...found }
}

/** True while the booking is still in the future and not yet resolved. */
export function isUpcoming(r: ReservationResponse): boolean {
    if (r.resStatus === 'CANCELLED' || r.resStatus === 'COMPLETED' || r.resStatus === 'NO_SHOW') {
        return false
    }
    return new Date(`${r.slotDate}T${r.slotTime}`) >= new Date()
}

/** Cancellation closes 2 hours before the reservation — see the policy
 *  shown on the confirmation page. */
export function isCancellable(r: ReservationResponse): boolean {
    if (r.resStatus !== 'CONFIRMED' && r.resStatus !== 'PENDING') return false
    const start = new Date(`${r.slotDate}T${r.slotTime}`).getTime()
    return start - Date.now() > 2 * 60 * 60 * 1000
}

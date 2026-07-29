import type { ReservationResponse, ReservationRequest, ReservationStatus } from './types'

/* ===================================================================
   Real reservation client — talks to POST/GET/PATCH /api/reservations.

   updateReservation below saves edits for real. The edit panel's slot
   picker (mocks/reservations.ts::remainingAtSlot) still shows mock
   availability while choosing a time — it can't see real bookings — but
   the save itself is capacity-checked server-side regardless, so a bad
   pick is rejected with a real SLOT_FULL rather than silently accepted.
   =================================================================== */

/** Mirrors the ErrorResponse shape GlobalExceptionHandler returns. */
export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function throwApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => null)
  throw new ApiError(
    response.status,
    body?.code ?? 'UNKNOWN_ERROR',
    body?.message ?? 'Something went wrong.',
  )
}

/**
 * Wire shape the backend actually returns — resNum is a plain integer
 * server-side (Reservation.resNum, SERIAL). Converted to a string below
 * so the rest of the app, built against the mocks' "RK4M2P"-style
 * confirmation codes, doesn't need to change. Whether reservations get a
 * real confirmation-code format is still an open product question this
 * conversion sidesteps rather than resolves.
 */
interface ReservationDto {
  resNum: number
  restPhone: string
  restName: string
  partySize: number
  specialReq: string | null
  resStatus: ReservationStatus
  resCreated: string
  slotDate: string
  slotTime: string
}

function toReservationResponse(dto: ReservationDto): ReservationResponse {
  return {
    resNum: String(dto.resNum),
    restName: dto.restName,
    restPhone: dto.restPhone,
    slotDate: dto.slotDate,
    slotTime: dto.slotTime,
    partySize: dto.partySize,
    specialReq: dto.specialReq,
    resStatus: dto.resStatus,
    resCreated: dto.resCreated,
  }
}

/**
 * Creates a reservation, or throws ApiError with code SLOT_FULL if the
 * party doesn't fit — see the capacity check in ReservationService.
 *
 * dinerEmail is a stand-in for the authenticated principal until a real
 * auth session exists; the backend takes it as a request field for now.
 */
export async function createReservation(
  req: ReservationRequest,
  dinerEmail: string,
): Promise<ReservationResponse> {
  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...req, email: dinerEmail }),
  })

  if (!response.ok) await throwApiError(response)
  return toReservationResponse((await response.json()) as ReservationDto)
}

export async function findReservation(
  resNum: string,
): Promise<ReservationResponse | undefined> {
  const response = await fetch(`/api/reservations/${encodeURIComponent(resNum)}`)

  if (response.status === 404) return undefined
  if (!response.ok) await throwApiError(response)
  return toReservationResponse((await response.json()) as ReservationDto)
}

/**
 * Server-side this should scope to the authenticated diner — a diner
 * must never receive another diner's bookings. There is no auth session
 * yet (see the backend punch list), so this currently returns every
 * reservation in the system.
 */
export async function listReservations(): Promise<ReservationResponse[]> {
  const response = await fetch('/api/reservations')

  if (!response.ok) await throwApiError(response)
  const data = (await response.json()) as ReservationDto[]
  return data
    .map(toReservationResponse)
    .sort((a, b) => `${b.slotDate}${b.slotTime}`.localeCompare(`${a.slotDate}${a.slotTime}`))
}

/**
 * Moves a reservation to any target status via the status-transition
 * endpoint. Server-side this is not a delete: the row stays and a
 * ReservationHistory entry records who made the change and when — that
 * trail is what settles "I cancelled in time" disputes, and what staff's
 * status history view reads from.
 *
 * changedByEmail is the same auth stand-in as createReservation's
 * dinerEmail.
 */
export async function transitionReservationStatus(
  resNum: string,
  toStatus: ReservationStatus,
  changedByEmail: string,
): Promise<ReservationResponse> {
  const response = await fetch(`/api/reservations/${encodeURIComponent(resNum)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toStatus, changedByEmail }),
  })

  if (!response.ok) await throwApiError(response)
  return toReservationResponse((await response.json()) as ReservationDto)
}

/** Convenience wrapper for the diner-facing cancel action. */
export async function cancelReservation(
  resNum: string,
  changedByEmail: string,
): Promise<ReservationResponse> {
  return transitionReservationStatus(resNum, 'CANCELLED', changedByEmail)
}

/**
 * Edits party size, slot, and/or special request, or throws ApiError
 * with code SLOT_FULL if the new slot can't seat the party. No status
 * transition, no history row — see ReservationService.updateReservation.
 */
export async function updateReservation(
  resNum: string,
  next: {
    slotDate: string
    slotTime: string
    partySize: number
    specialReq: string
  },
): Promise<ReservationResponse> {
  const response = await fetch(`/api/reservations/${encodeURIComponent(resNum)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slotDate: next.slotDate,
      slotTime: next.slotTime,
      partySize: next.partySize,
      specialReq: next.specialReq.trim() || null,
    }),
  })

  if (!response.ok) await throwApiError(response)
  return toReservationResponse((await response.json()) as ReservationDto)
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

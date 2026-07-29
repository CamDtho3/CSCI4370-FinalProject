import type { ReservationStatus, StaffReservationResponse } from './types'
import { throwApiError } from './errors'

/* ===================================================================
   Staff-side reservation client. Writes (status transitions, edits) go
   through the same endpoints as the diner side — see api/reservations.ts
   — since a reservation is a reservation regardless of who's changing
   it. This file only adds the one genuinely staff-specific read: the
   shaped GET that carries guest identity and full status history.
   =================================================================== */

/** Wire shape GET /api/reservations/restaurant/{phone}/staff returns. */
interface StaffReservationDto {
  resNum: number
  restPhone: string
  restName: string
  partySize: number
  specialReq: string | null
  resStatus: ReservationStatus
  resCreated: string
  slotDate: string
  slotTime: string
  dinerName: string
  dinerEmail: string
  dinerPhone: string | null
  history: { changedAt: string; changedTo: ReservationStatus; changedBy: string }[]
}

function toStaffReservationResponse(dto: StaffReservationDto): StaffReservationResponse {
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
    dinerName: dto.dinerName,
    dinerEmail: dto.dinerEmail,
    dinerPhone: dto.dinerPhone,
    history: dto.history,
  }
}

export async function getStaffReservations(
  restPhone: string,
  slotDate: string,
): Promise<StaffReservationResponse[]> {
  const response = await fetch(
    `/api/reservations/restaurant/${encodeURIComponent(restPhone)}/staff?slotDate=${encodeURIComponent(slotDate)}`,
    { credentials: 'same-origin' },
  )

  if (!response.ok) await throwApiError(response)
  const data = (await response.json()) as StaffReservationDto[]
  return data.map(toStaffReservationResponse)
}

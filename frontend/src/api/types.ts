/* ===================================================================
   API contract — must match the Spring Boot DTOs exactly.
   Field names are case-sensitive; a mismatch silently yields
   undefined rather than an error.

   These are RESPONSE shapes, not table shapes. They are deliberately
   denormalised: city and state come inline even though the schema
   splits them into ZipCode, because the frontend shouldn't reassemble
   a join. Normalisation is a storage concern.
   =================================================================== */

export type PriceRange = 1 | 2 | 3 | 4

export type UserRole = 'DINER' | 'STAFF' | 'REST_ADMIN' | 'PLATFORM_ADMIN'

/**
 * The signed-in account — what GET /api/auth/me returns, and what
 * login and signup respond with.
 *
 * pwd_hash and acct_created exist on the User table but are
 * deliberately absent here: one must never leave the server, the
 * other has no use in the UI.
 */
export interface CurrentUser {
  email: string
  fname: string
  lname: string
  /** Optional at signup, so null is a real value here. */
  userPhone: string | null
  userRole: UserRole
  /**
   * Restaurant this account works for, resolved through FD A7
   * (email → employer_phone). Absent for diners and platform admins.
   */
  employerName?: string
}

export interface RestaurantResponse {
  /** Natural key — FD group B. Also the URL segment. */
  restPhone: string
  restName: string
  street: string
  zip: string
  city: string
  state: string
  cuisine: string
  priceRange: PriceRange

  /** Path under /images/restaurants/. Not in the schema — see note below. */
  imageUrl: string

  /**
   * Aggregates over Review. Spring must compute these:
   *   avg(rating) and count(*) grouped by rest_phone.
   * Null when a restaurant has no reviews yet — do not send 0,
   * which would render as a one-star average.
   */
  avgRating: number | null
  reviewCount: number
}

export interface TimeSlotResponse {
  /** ISO 'YYYY-MM-DD' — LocalDate does not survive JSON. */
  slotDate: string
  /** 'HH:mm' — LocalTime, likewise. */
  slotTime: string
  slotCapacity: number
  /** Derived server-side: capacity minus booked covers. */
  availableSpots: number
}

export interface RestaurantWithSlots extends RestaurantResponse {
  slots: TimeSlotResponse[]
}

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface ReservationRequest {
  restPhone: string
  slotDate: string
  slotTime: string
  partySize: number
  specialReq?: string
}

/** One row of ReservationStatusHistory — FD group G. */
export interface StatusHistoryEntry {
  /** ISO timestamp. With resNum this forms the composite key. */
  changedAt: string
  changedTo: ReservationStatus
  /** Email of the user who made the change — FD G2, changed_by. */
  changedBy: string
}

export interface ReservationResponse {
  /** Natural key — FD group F. Shown to the diner as their confirmation. */
  resNum: string
  restName: string
  restPhone: string
  slotDate: string
  slotTime: string
  partySize: number
  specialReq: string | null
  resStatus: ReservationStatus
  resCreated: string
}

/**
 * What staff see. Deliberately a different shape from the diner-facing
 * response: it carries the guest's identity, which a diner has no
 * business receiving about anyone else's booking.
 */
export interface StaffReservationResponse extends ReservationResponse {
  dinerName: string
  dinerEmail: string
  dinerPhone: string | null
  history: StatusHistoryEntry[]
}

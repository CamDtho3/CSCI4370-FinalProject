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

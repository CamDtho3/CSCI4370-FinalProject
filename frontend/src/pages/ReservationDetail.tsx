import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { ReservationResponse } from '../api/types'
import { Button, ReservationBadge } from '../components/ui'
import {
  cancelMockReservation,
  findMockReservation,
  isCancellable,
  MockApiError,
} from '../mocks/reservations'
import { findMockRestaurant } from '../mocks/restaurants'
import { formatTime } from '../lib/time'
import styles from './ReservationDetail.module.css'

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function CheckIcon() {
  return (
    <svg
      className={styles.successIcon}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.5 6.5 12 13 4" />
    </svg>
  )
}

export default function ReservationDetail() {
  const { resNum = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Set by BookingConfirm on success. Router state is right here —
  // it's a nicety, and losing it on refresh is correct behaviour.
  const justBooked = (location.state as { justBooked?: boolean } | null)
    ?.justBooked

  const [reservation, setReservation] = useState<ReservationResponse | undefined>(
    () => findMockReservation(resNum),
  )
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!reservation) {
    return (
      <div className={styles.missing}>
        <h1>Reservation not found</h1>
        <p className={styles.missingText}>
          We couldn't find a booking with that confirmation number.
        </p>
        <Button variant="primary" onClick={() => navigate('/reservations')}>
          Your reservations
        </Button>
      </div>
    )
  }

  const restaurant = findMockRestaurant(reservation.restPhone)

  async function handleCancel() {
    setCancelling(true)
    setError(null)
    try {
      const updated = await cancelMockReservation(resNum)
      setReservation({ ...updated })
      setConfirming(false)
    } catch (err) {
      setError(
        err instanceof MockApiError
          ? err.message
          : 'Could not cancel. Please try again.',
      )
    } finally {
      setCancelling(false)
    }
  }

  const cancellable = isCancellable(reservation)

  return (
    <div className={styles.wrap}>
      {justBooked && reservation.resStatus === 'CONFIRMED' && (
        <div className={styles.success} role="status">
          <CheckIcon />
          <div>
            <div className={styles.successTitle}>Your table is booked</div>
            <div className={styles.successBody}>
              Keep confirmation {reservation.resNum} handy when you arrive.
            </div>
          </div>
        </div>
      )}

      <article className={styles.card}>
        <header className={styles.head}>
          <div className={styles.headTop}>
            <h1 className={styles.restName}>{reservation.restName}</h1>
            <ReservationBadge status={reservation.resStatus} />
          </div>
          {restaurant && (
            <p className={styles.address}>
              {restaurant.street}, {restaurant.city}, {restaurant.state}{' '}
              {restaurant.zip}
            </p>
          )}
        </header>

        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Date</span>
            <span className={styles.rowValue}>
              {formatDate(reservation.slotDate)}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Time</span>
            <span className={styles.rowValue}>
              {formatTime(reservation.slotTime)}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Party size</span>
            <span className={styles.rowValue}>
              {reservation.partySize}{' '}
              {reservation.partySize === 1 ? 'guest' : 'guests'}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Confirmation</span>
            <span className={`${styles.rowValue} ${styles.mono}`}>
              {reservation.resNum}
            </span>
          </div>
          {restaurant && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Restaurant phone</span>
              <span className={styles.rowValue}>{restaurant.restPhone}</span>
            </div>
          )}
        </div>

        {reservation.specialReq && (
          <div className={styles.requests}>
            <div className={styles.requestsLabel}>Special requests</div>
            <div className={styles.requestsBody}>{reservation.specialReq}</div>
          </div>
        )}

        {cancellable && (
          <div className={styles.actions}>
            {confirming ? (
              <>
                <span className={styles.confirmCancel}>
                  Cancel this reservation?
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={cancelling}
                  onClick={handleCancel}
                >
                  {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                </Button>
                <Button
                  size="sm"
                  disabled={cancelling}
                  onClick={() => setConfirming(false)}
                >
                  Keep it
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setConfirming(true)}>
                Cancel reservation
              </Button>
            )}
          </div>
        )}
      </article>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {reservation.resStatus === 'CONFIRMED' && !cancellable && (
        <p className={styles.policy}>
          Cancellation closes 2 hours before your reservation. Call the
          restaurant directly if your plans have changed.
        </p>
      )}
    </div>
  )
}

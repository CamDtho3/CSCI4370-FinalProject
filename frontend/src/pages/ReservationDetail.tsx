import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ReservationResponse } from '../api/types'
import { Button, ReservationBadge } from '../components/ui'
import {
  cancelReservation,
  findReservation,
  isCancellable,
  updateReservation,
  ApiError,
} from '../api/reservations'
// The edit panel's slot picker still previews mock availability — see
// the note in api/reservations.ts. The save itself is real.
import { remainingAtSlot } from '../mocks/reservations'
import EditReservation from '../components/EditReservation'
import type { ReservationEdit } from '../components/EditReservation'
import { findRestaurant } from '../api/restaurants'
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
    undefined,
  )
  const [loadingReservation, setLoadingReservation] = useState(true)
  const [restaurant, setRestaurant] = useState<
    | {
        restPhone: string
        restName: string
        street: string
        city: string
        state: string
        zip: string
      }
    | null
  >(null)
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  // ?edit=1 opens the panel straight away — set by the Edit link on the
  // reservations list, and preserved across a refresh.
  const [searchParams, setSearchParams] = useSearchParams()
  const [editing, setEditing] = useState(searchParams.get('edit') === '1')
  const [error, setError] = useState<string | null>(null)

  function stopEditing() {
    setEditing(false)
    if (searchParams.has('edit')) {
      searchParams.delete('edit')
      setSearchParams(searchParams, { replace: true })
    }
  }

  useEffect(() => {
    let active = true

    setLoadingReservation(true)
    findReservation(resNum)
      .then((result) => {
        if (active) setReservation(result)
      })
      .catch(() => {
        if (active) setReservation(undefined)
      })
      .finally(() => {
        if (active) setLoadingReservation(false)
      })

    return () => {
      active = false
    }
  }, [resNum])

  useEffect(() => {
    if (!reservation) return

    let active = true

    setLoadingRestaurant(true)
    findRestaurant(reservation.restPhone)
      .then((result) => {
        if (!active) return
        setRestaurant(
          result
            ? {
                restPhone: result.restPhone,
                restName: result.restName,
                street: result.street,
                city: result.city,
                state: result.state,
                zip: result.zip,
              }
            : null,
        )
      })
      .catch(() => {
        if (!active) return
        setRestaurant(null)
      })
      .finally(() => {
        if (active) setLoadingRestaurant(false)
      })

    return () => {
      active = false
    }
  }, [reservation?.restPhone])

  if (loadingReservation) {
    return (
      <div className={styles.missing}>
        <h1>Loading reservation</h1>
        <p className={styles.missingText}>Fetching your booking.</p>
      </div>
    )
  }

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

  async function handleCancel() {
    setCancelling(true)
    setError(null)
    try {
      const updated = await cancelReservation(resNum)
      setReservation({ ...updated })
      setConfirming(false)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not cancel. Please try again.',
      )
    } finally {
      setCancelling(false)
    }
  }

  // Editing follows the same window as cancelling: if a diner can call
  // it off, they can change it.
  const cancellable = isCancellable(reservation)

  async function handleSave(next: ReservationEdit) {
    const updated = await updateReservation(resNum, next)
    setReservation({ ...updated })
    stopEditing()
  }

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
          {loadingRestaurant ? (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Restaurant</span>
              <span className={styles.rowValue}>Loading...</span>
            </div>
          ) : restaurant ? (
            <p className={styles.address}>
              {restaurant.street}, {restaurant.city}, {restaurant.state}{' '}
              {restaurant.zip}
            </p>
          ) : null}
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

        {editing && (
          <div className={styles.editWrap}>
            <EditReservation
              restPhone={reservation.restPhone}
              initial={{
                slotDate: reservation.slotDate,
                slotTime: reservation.slotTime,
                partySize: reservation.partySize,
                specialReq: reservation.specialReq ?? '',
              }}
              remainingFor={(d, t) =>
                remainingAtSlot(reservation!.restPhone, d, t, resNum)
              }
              onSave={handleSave}
              onCancel={stopEditing}
            />
          </div>
        )}

        {cancellable && !editing && (
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
              <>
                <Button variant="primary" size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button size="sm" onClick={() => setConfirming(true)}>
                  Cancel reservation
                </Button>
              </>
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

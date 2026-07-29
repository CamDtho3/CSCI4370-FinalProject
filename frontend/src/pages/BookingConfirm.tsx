import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSearch } from '../context/SearchContext'
import type { RestaurantResponse } from '../api/types'
import { Button, Textarea } from '../components/ui'
import { findRestaurant } from '../mocks/restaurants'
import { createMockReservation, MockApiError } from '../mocks/reservations'
import { formatTime } from '../lib/time'
import styles from './BookingConfirm.module.css'

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BookingConfirm() {
  const { restPhone = '' } = useParams()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const { query } = useSearch()
  const navigate = useNavigate()

  const slotTime = params.get('time') ?? ''
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null)
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)

  const [specialReq, setSpecialReq] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<{ title: string; body: string } | null>(null)

  useEffect(() => {
    let active = true

    setLoadingRestaurant(true)
    findRestaurant(restPhone)
      .then((result) => {
        if (!active) return
        setRestaurant(result ?? null)
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
  }, [restPhone])

  if (!slotTime) {
    return (
      <div className={styles.missing}>
        <h1>Booking details missing</h1>
        <p className={styles.missingText}>
          Pick a restaurant and a time to continue.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to search
        </Button>
      </div>
    )
  }

  if (loadingRestaurant) {
    return (
      <div className={styles.missing}>
        <h1>Loading booking details</h1>
        <p className={styles.missingText}>
          Fetching restaurant information.
        </p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className={styles.missing}>
        <h1>Booking details missing</h1>
        <p className={styles.missingText}>
          We couldn't find that restaurant.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to search
        </Button>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const created = await createMockReservation(
        {
          restPhone,
          slotDate: query.slotDate,
          slotTime,
          partySize: query.partySize,
          specialReq,
        },
        user!.email,
      )
      navigate(`/reservations/${created.resNum}`, {
        replace: true,
        state: { justBooked: true },
      })
    } catch (err) {
      if (err instanceof MockApiError && err.code === 'SLOT_FULL') {
        // Someone booked between page load and submit. Send them back
        // to pick again rather than leaving them on a dead form.
        setError({ title: 'That time is no longer available', body: err.message })
      } else {
        setError({
          title: 'Something went wrong',
          body: 'Your reservation was not created. Please try again.',
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const { restName, street, city, state, zip } = restaurant

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Confirm your reservation</h1>

      <section className={styles.summary}>
        <div className={styles.summaryHead}>
          <span className={styles.restName}>{restName}</span>
          <Link to={`/restaurants/${restPhone}`} className={styles.change}>
            Change
          </Link>
        </div>
        <p className={styles.address}>
          {street}, {city}, {state} {zip}
        </p>

        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Date</span>
            <span className={styles.rowValue}>{formatDate(query.slotDate)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Time</span>
            <span className={styles.rowValue}>{formatTime(slotTime)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Party size</span>
            <span className={styles.rowValue}>
              {query.partySize} {query.partySize === 1 ? 'guest' : 'guests'}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Booked by</span>
            <span className={styles.rowValue}>
              {user?.fname} {user?.lname}
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className={styles.error} role="alert">
          <span className={styles.errorTitle}>{error.title}</span>
          <span className={styles.errorBody}>{error.body}</span>
          <div>
            <Button size="sm" onClick={() => navigate(`/restaurants/${restPhone}`)}>
              Pick another time
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.form}>
          <Textarea
            label="Special requests"
            optional
            placeholder="Allergies, a birthday, seating preference"
            maxLength={500}
            value={specialReq}
            onChange={(e) => setSpecialReq(e.target.value)}
          />
        </div>

        <p className={styles.policy}>
          Your table is held for 15 minutes past the reservation time. You can
          cancel free of charge up to 2 hours beforehand from your reservations
          page.
        </p>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Confirming…' : 'Confirm reservation'}
        </Button>
      </form>
    </div>
  )
}

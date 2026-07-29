import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ReservationResponse } from '../api/types'
import { Button, ReservationBadge } from '../components/ui'
import { listReservations, isUpcoming, isCancellable } from '../api/reservations'
import { formatTime } from '../lib/time'
import styles from './MyReservations.module.css'

/**
 * The row is a <div>, not a <Link>. A button nested inside an anchor is
 * invalid HTML and breaks keyboard navigation, so the link covers the
 * restaurant name and the Edit button sits beside it as a sibling.
 */
function ReservationRow({
  r,
  past = false,
}: {
  r: ReservationResponse
  past?: boolean
}) {
  const date = new Date(`${r.slotDate}T00:00:00`)
  const editable = isCancellable(r)

  return (
    <div className={past ? `${styles.row} ${styles.past}` : styles.row}>
      <div className={styles.when}>
        <div className={styles.month}>
          {date.toLocaleDateString('en-US', { month: 'short' })}
        </div>
        <div className={styles.day}>{date.getDate()}</div>
      </div>

      <div className={styles.divider} />

      <div className={styles.body}>
        <Link to={`/reservations/${r.resNum}`} className={styles.restName}>
          {r.restName}
        </Link>
        <div className={styles.detail}>
          {formatTime(r.slotTime)} · {r.partySize}{' '}
          {r.partySize === 1 ? 'guest' : 'guests'}
        </div>
      </div>

      <div className={styles.trailing}>
        <span className={styles.resNum}>{r.resNum}</span>
        <ReservationBadge status={r.resStatus} />
        {editable && (
          <Link
            to={`/reservations/${r.resNum}?edit=1`}
            className={styles.editLink}
          >
            Edit
          </Link>
        )}
      </div>
    </div>
  )
}

export default function MyReservations() {
  const navigate = useNavigate()
  const [all, setAll] = useState<ReservationResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Server-side this should scope to the authenticated diner — see the
  // auth flow item on the backend punch list. For now it's everyone's.
  useEffect(() => {
    let active = true

    listReservations()
      .then((result) => {
        if (active) setAll(result)
      })
      .catch(() => {
        if (active) setAll([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const upcoming = all.filter(isUpcoming)
  const past = all.filter((r) => !isUpcoming(r))

  if (loading) {
    return <h1 className={styles.title}>Your reservations</h1>
  }

  if (all.length === 0) {
    return (
      <>
        <h1 className={styles.title}>Your reservations</h1>
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No reservations yet</p>
          <p className={styles.emptyBody}>
            Once you book a table it will show up here.
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Find a restaurant
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className={styles.title}>Your reservations</h1>

      {upcoming.length > 0 && (
        <section className={styles.group}>
          <h2 className={styles.groupTitle}>Upcoming</h2>
          <div className={styles.list}>
            {upcoming.map((r) => (
              <ReservationRow key={r.resNum} r={r} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className={styles.group}>
          <h2 className={styles.groupTitle}>Past and cancelled</h2>
          <div className={styles.list}>
            {past.map((r) => (
              <ReservationRow key={r.resNum} r={r} past />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReservationStatus, StaffReservationResponse } from '../api/types'
import { Button, ReservationBadge } from '../components/ui'
import {
  ALLOWED_TRANSITIONS,
  STATUS_ACTION_LABEL,
  listStaffReservations,
  summarise,
  transitionStaffReservation,
} from '../mocks/staff'
import { MockApiError } from '../mocks/reservations'
import { formatTime } from '../lib/time'
import styles from './StaffToday.module.css'

const STAFF_REST_PHONE = '706-549-3450'

function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ReservationRow({
  r,
  onTransition,
}: {
  r: StaffReservationResponse
  onTransition: (to: ReservationStatus) => Promise<void>
}) {
  const [showHistory, setShowHistory] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = ALLOWED_TRANSITIONS[r.resStatus]
  const resolved = next.length === 0

  async function run(to: ReservationStatus) {
    setBusy(true)
    setError(null)
    try {
      await onTransition(to)
    } catch (err) {
      setError(err instanceof MockApiError ? err.message : 'Could not update.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className={resolved ? `${styles.row} ${styles.resolved}` : styles.row}>
      <div className={styles.rowMain}>
        <span className={styles.time}>{formatTime(r.slotTime)}</span>

        <div className={styles.who}>
          <div className={styles.name}>{r.dinerName}</div>
          <div className={styles.contact}>
            {r.dinerPhone ?? r.dinerEmail} · {r.resNum}
          </div>
        </div>

        <span className={styles.party}>
          {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}
        </span>

        <span className={styles.badgeCell}>
          <ReservationBadge status={r.resStatus} />
        </span>
      </div>

      {r.specialReq && (
        <p className={styles.note}>
          <span className={styles.noteLabel}>Request: </span>
          {r.specialReq}
        </p>
      )}

      <div className={styles.actions}>
        {next.map((to) => (
          <Button
            key={to}
            size="sm"
            variant={to === 'CANCELLED' || to === 'NO_SHOW' ? 'secondary' : 'primary'}
            disabled={busy}
            onClick={() => run(to)}
          >
            {STATUS_ACTION_LABEL[to]}
          </Button>
        ))}

        <button
          type="button"
          className={styles.historyToggle}
          onClick={() => setShowHistory((v) => !v)}
        >
          {showHistory ? 'Hide history' : `History (${r.history.length})`}
        </button>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {showHistory && (
        <div className={styles.history}>
          <p className={styles.historyTitle}>Status history</p>
          {r.history.map((h) => (
            <div key={h.changedAt} className={styles.historyRow}>
              <span className={styles.historyTime}>{timeOfDay(h.changedAt)}</span>
              <span className={styles.historyTo}>{h.changedTo}</span>
              <span className={styles.historyBy}>{h.changedBy}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

export default function StaffToday() {
  const { user, isStaff } = useAuth()
  const [slotDate, setSlotDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [version, setVersion] = useState(0)

  if (!isStaff) return <Navigate to="/" replace />

  const reservations = listStaffReservations(STAFF_REST_PHONE, slotDate)
  const stats = summarise(reservations)
  void version // re-render key after a transition mutates the store

  async function handleTransition(resNum: string, to: ReservationStatus) {
    await transitionStaffReservation(resNum, to, user!.email)
    setVersion((v) => v + 1)
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Today</h1>
          <p className={styles.subtitle}>{user?.employerName}</p>
        </div>

        <div className={styles.dateField}>
          <label htmlFor="staff-date" className={styles.dateLabel}>
            Service date
          </label>
          <input
            id="staff-date"
            type="date"
            className={styles.dateInput}
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Bookings</div>
          <div className={styles.statValue}>{stats.bookings}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Covers</div>
          <div className={styles.statValue}>{stats.covers}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Awaiting confirmation</div>
          <div className={styles.statValue}>{stats.awaiting}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Seated now</div>
          <div className={styles.statValue}>{stats.seated}</div>
        </div>
      </div>

      {reservations.length === 0 ? (
        <p className={styles.empty}>No bookings for this date.</p>
      ) : (
        <div className={styles.list}>
          {reservations.map((r) => (
            <ReservationRow
              key={r.resNum}
              r={r}
              onTransition={(to) => handleTransition(r.resNum, to)}
            />
          ))}
        </div>
      )}
    </>
  )
}

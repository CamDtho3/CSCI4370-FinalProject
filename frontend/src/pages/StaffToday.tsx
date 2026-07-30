import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReservationStatus, StaffReservationResponse } from '../api/types'
import { Button, ReservationBadge } from '../components/ui'
import { ALLOWED_TRANSITIONS, STATUS_ACTION_LABEL, remainingAtStaffSlot, summarise } from '../mocks/staff'
import { getStaffReservations } from '../api/staff'
import { transitionReservationStatus, updateReservation, ApiError } from '../api/reservations'
import EditReservation from '../components/EditReservation'
import type { ReservationEdit } from '../components/EditReservation'
import { formatTime } from '../lib/time'
import styles from './StaffToday.module.css'

function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ReservationRow({
  r,
  onTransition,
  onEdit,
}: {
  r: StaffReservationResponse
  onTransition: (to: ReservationStatus) => Promise<void>
  onEdit: (next: ReservationEdit) => Promise<void>
}) {
  const [showHistory, setShowHistory] = useState(false)
  const [editing, setEditing] = useState(false)
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
      setError(err instanceof ApiError ? err.message : 'Could not update.')
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

        {/* Staff may edit up to the moment of service — no two-hour
            window, unlike diners. */}
        {!resolved && (
          <Button size="sm" disabled={busy} onClick={() => setEditing((v) => !v)}>
            {editing ? 'Close' : 'Edit'}
          </Button>
        )}

        <button
          type="button"
          className={styles.historyToggle}
          onClick={() => setShowHistory((v) => !v)}
        >
          {showHistory ? 'Hide history' : `History (${r.history.length})`}
        </button>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {editing && (
        <div className={styles.editWrap}>
          <EditReservation
            restPhone={r.restPhone}
            initial={{
              slotDate: r.slotDate,
              slotTime: r.slotTime,
              partySize: r.partySize,
              specialReq: r.specialReq ?? '',
            }}
            remainingFor={(d, t) =>
              remainingAtStaffSlot(r.restPhone, d, t, r.resNum)
            }
            onSave={async (nextEdit) => {
              await onEdit(nextEdit)
              setEditing(false)
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

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
  const [reservations, setReservations] = useState<StaffReservationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const employerPhone = user?.employerPhone

  useEffect(() => {
    if (!isStaff || !employerPhone) return

    let active = true

    setLoading(true)
    getStaffReservations(employerPhone, slotDate)
      .then((result) => {
        if (active) setReservations(result)
      })
      .catch(() => {
        if (active) setReservations([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
    // version bumps after a transition/edit to trigger a re-fetch
  }, [slotDate, isStaff, employerPhone, version])

  if (!isStaff) return <Navigate to="/" replace />

  if (!employerPhone) {
    return (
      <p className={styles.empty}>
        Your account isn't associated with a restaurant, so there's nothing to show here.
      </p>
    )
  }

  const stats = summarise(reservations)

  async function handleTransition(resNum: string, to: ReservationStatus) {
    await transitionReservationStatus(resNum, to)
    setVersion((v) => v + 1)
  }

  async function handleEdit(resNum: string, next: ReservationEdit) {
    await updateReservation(resNum, next)
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

      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : reservations.length === 0 ? (
        <p className={styles.empty}>No bookings for this date.</p>
      ) : (
        <div className={styles.list}>
          {reservations.map((r) => (
            <ReservationRow
              key={r.resNum}
              r={r}
              onTransition={(to) => handleTransition(r.resNum, to)}
              onEdit={(next) => handleEdit(r.resNum, next)}
            />
          ))}
        </div>
      )}
    </>
  )
}

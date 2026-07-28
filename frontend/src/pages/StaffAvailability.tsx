import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockSlotsFor } from '../mocks/restaurants'
import { listStaffReservations } from '../mocks/staff'
import { formatTime, mealPeriodOf } from '../lib/time'
import styles from './StaffAvailability.module.css'

const STAFF_REST_PHONE = '706-549-3450'

export default function StaffAvailability() {
  const { user, isStaff } = useAuth()
  const [slotDate, setSlotDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )

  if (!isStaff) return <Navigate to="/" replace />

  const slots = mockSlotsFor(STAFF_REST_PHONE, slotDate)
  const booked = listStaffReservations(STAFF_REST_PHONE, slotDate).filter(
    (r) => r.resStatus !== 'CANCELLED' && r.resStatus !== 'NO_SHOW',
  )

  function coversAt(slotTime: string): number {
    return booked
      .filter((r) => r.slotTime === slotTime)
      .reduce((sum, r) => sum + r.partySize, 0)
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Availability</h1>
          <p className={styles.subtitle}>{user?.employerName}</p>
        </div>

        <div className={styles.dateField}>
          <label htmlFor="avail-date" className={styles.dateLabel}>
            Service date
          </label>
          <input
            id="avail-date"
            type="date"
            className={styles.dateInput}
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
          />
        </div>
      </div>

      {(['lunch', 'dinner'] as const).map((period) => {
        const inPeriod = slots.filter((s) => mealPeriodOf(s.slotTime) === period)
        if (inPeriod.length === 0) return null

        return (
          <section key={period} className={styles.group}>
            <h2 className={styles.groupTitle}>
              {period === 'lunch' ? 'Lunch service' : 'Dinner service'}
            </h2>

            <div className={styles.table}>
              <div className={`${styles.tr} ${styles.th}`}>
                <span className={styles.cTime}>Time</span>
                <span className={styles.cNum}>Capacity</span>
                <span className={styles.cNum}>Booked</span>
                <span className={styles.cBar}>Fill</span>
              </div>

              {inPeriod.map((s) => {
                const taken = coversAt(s.slotTime)
                const pct = Math.min(
                  100,
                  Math.round((taken / s.slotCapacity) * 100),
                )
                return (
                  <div key={s.slotTime} className={styles.tr}>
                    <span className={styles.cTime}>{formatTime(s.slotTime)}</span>
                    <span className={styles.cNum}>{s.slotCapacity}</span>
                    <span className={styles.cNum}>{taken}</span>
                    <span className={styles.cBar}>
                      <span className={styles.barTrack}>
                        <span
                          className={
                            pct >= 100
                              ? `${styles.barFill} ${styles.barFull}`
                              : styles.barFill
                          }
                          style={{ '--fill': `${pct}%` } as CSSProperties}
                        />
                      </span>
                      <span className={styles.pct}>{pct}%</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <p className={styles.note}>
        Capacity comes from the TimeSlot table, generated from this
        restaurant's operating hours. Editing it is not built yet.
      </p>
    </>
  )
}

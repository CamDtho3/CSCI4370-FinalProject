import { useMemo, useState } from 'react'
import { Button, Select, Textarea } from './ui'
import { mockSlotsFor } from '../mocks/restaurants'
import { formatTime, mealPeriodOf } from '../lib/time'
import styles from './EditReservation.module.css'

const MAX_PARTY = 20

export interface ReservationEdit {
  slotDate: string
  slotTime: string
  partySize: number
  specialReq: string
}

interface Props {
  restPhone: string
  initial: ReservationEdit
  /**
   * Seats still free at a slot, with this reservation's own booking
   * already added back on its current slot. Without that, a diner
   * could not even keep the party size they already have.
   *
   * Party size itself is unrestricted — only the slot list narrows.
   * Capping the dropdown by the selected slot made growing a party
   * require changing time first, which is not obvious.
   */
  remainingFor: (slotDate: string, slotTime: string) => number
  onSave: (next: ReservationEdit) => Promise<void>
  onCancel: () => void
}

export default function EditReservation({
  restPhone,
  initial,
  remainingFor,
  onSave,
  onCancel,
}: Props) {
  const [slotDate, setSlotDate] = useState(initial.slotDate)
  const [slotTime, setSlotTime] = useState(initial.slotTime)
  const [partySize, setPartySize] = useState(initial.partySize)
  const [specialReq, setSpecialReq] = useState(initial.specialReq)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slots = useMemo(
    () => mockSlotsFor(restPhone, slotDate),
    [restPhone, slotDate],
  )

  // Party size is unrestricted; the slot list narrows to match it.
  function slotFits(t: string, party = partySize): boolean {
    return remainingFor(slotDate, t) >= party
  }

  function changeParty(next: number) {
    setPartySize(next)
    // Drop a selected time the new party no longer fits into, so the
    // form can't be saved against a slot without room.
    if (slotTime && remainingFor(slotDate, slotTime) < next) setSlotTime('')
  }

  function changeDate(next: string) {
    setSlotDate(next)
    // The old time may not exist or fit on the new date.
    const stillOk = mockSlotsFor(restPhone, next).some(
      (s) => s.slotTime === slotTime && remainingFor(next, s.slotTime) >= partySize,
    )
    if (!stillOk) setSlotTime('')
  }

  const dirty =
    slotDate !== initial.slotDate ||
    slotTime !== initial.slotTime ||
    partySize !== initial.partySize ||
    specialReq !== initial.specialReq

  async function handleSave() {
    if (!slotTime) {
      setError('Pick a time for your reservation.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({ slotDate, slotTime, partySize, specialReq })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.title}>Edit reservation</p>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.dateRow}>
        <Select
          label="Party size"
          value={partySize}
          onChange={(e) => changeParty(Number(e.target.value))}
        >
          {Array.from({ length: MAX_PARTY }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </Select>

        <div>
          <p className={styles.label}>Date</p>
          <input
            type="date"
            className={styles.dateInput}
            value={slotDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => changeDate(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <p className={styles.label}>Time</p>

        {slots.every((s) => !slotFits(s.slotTime)) ? (
          <p className={styles.noSlots}>
            No times on this date can seat {partySize}{' '}
            {partySize === 1 ? 'guest' : 'guests'}.
          </p>
        ) : (
          (['lunch', 'dinner'] as const).map((period) => {
            const inPeriod = slots.filter(
              (s) => mealPeriodOf(s.slotTime) === period,
            )
            if (inPeriod.length === 0) return null

            return (
              <div key={period} className={styles.periodGroup}>
                <p className={styles.periodLabel}>
                  {period === 'lunch' ? 'Lunch' : 'Dinner'}
                  <span className={styles.periodRule} />
                </p>
                <div className={styles.slots}>
                  {inPeriod.map(({ slotTime: t }) => (
                    <button
                      key={t}
                      type="button"
                      disabled={!slotFits(t)}
                      aria-pressed={slotTime === t}
                      onClick={() => setSlotTime(t)}
                      className={
                        slotTime === t
                          ? `${styles.slot} ${styles.slotSelected}`
                          : styles.slot
                      }
                    >
                      {formatTime(t)}
                    </button>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className={styles.field}>
        <Textarea
          label="Special requests"
          optional
          maxLength={500}
          value={specialReq}
          onChange={(e) => setSpecialReq(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="sm"
          disabled={saving || !dirty}
          onClick={handleSave}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button size="sm" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
        {!dirty && <span className={styles.unchanged}>No changes yet</span>}
      </div>
    </div>
  )
}

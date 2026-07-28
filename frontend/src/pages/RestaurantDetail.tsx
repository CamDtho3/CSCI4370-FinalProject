import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSearch } from '../context/SearchContext'
import { Button, Select, partySizeOptions } from '../components/ui'
import { findMockRestaurant, mockSlotsFor } from '../mocks/restaurants'
import { formatTime, mealPeriodOf } from '../lib/time'
import type { TimeSlotResponse } from '../api/types'
import styles from './RestaurantDetail.module.css'

function StarIcon() {
  return (
    <svg
      className={styles.star}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 1.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.3l-3.8 2 .7-4.3-3.1-3 4.3-.6z" />
    </svg>
  )
}

export default function RestaurantDetail() {
  const { restPhone = '' } = useParams()
  const { query, setQuery } = useSearch()
  const navigate = useNavigate()

  const [imageFailed, setImageFailed] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const restaurant = useMemo(
    () => findMockRestaurant(restPhone),
    [restPhone],
  )

  const slots = useMemo(
    () => mockSlotsFor(restPhone, query.slotDate),
    [restPhone, query.slotDate],
  )

  if (!restaurant) {
    return (
      <div className={styles.notFound}>
        <h1>Restaurant not found</h1>
        <p className={styles.notFoundText}>
          We couldn't find a restaurant with that number.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to search
        </Button>
      </div>
    )
  }

  const { restName, cuisine, priceRange, street, city, state, zip,
          imageUrl, avgRating, reviewCount } = restaurant

  // Changing party size can invalidate the chosen time.
  function changeParty(partySize: number) {
    setQuery({ partySize })
    const stillFits = slots.find(
      (s) => s.slotTime === selectedTime && s.availableSpots >= partySize,
    )
    if (!stillFits) setSelectedTime(null)
  }

  function changeDate(slotDate: string) {
    setQuery({ slotDate })
    setSelectedTime(null)
  }

  return (
    <>
      <div className={styles.banner}>
        {imageFailed ? (
          <div className={styles.bannerFallback}>{restName}</div>
        ) : (
          <img
            className={styles.bannerImage}
            src={imageUrl}
            alt=""
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <header className={styles.head}>
        <h1 className={styles.name}>{restName}</h1>
        <div className={styles.meta}>
          {avgRating !== null && (
            <>
              <span className={styles.rating}>
                <StarIcon />
                {avgRating.toFixed(1)}
                <span className={styles.count}>({reviewCount})</span>
              </span>
              <span className={styles.dot} />
            </>
          )}
          <span>{cuisine}</span>
          <span className={styles.dot} />
          <span>{'$'.repeat(priceRange)}</span>
          <span className={styles.dot} />
          <span>
            {street}, {city}, {state} {zip}
          </span>
        </div>
      </header>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Make a reservation</h2>

        <div className={styles.fields}>
          <Select
            label="Party size"
            value={query.partySize}
            onChange={(e) => changeParty(Number(e.target.value))}
          >
            {partySizeOptions}
          </Select>

          <div className={styles.field}>
            <label htmlFor="slot-date" className={styles.fieldLabel}>
              Date
            </label>
            <input
              id="slot-date"
              type="date"
              className={styles.dateInput}
              value={query.slotDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => changeDate(e.target.value)}
            />
          </div>
        </div>

        <p className={styles.slotsLabel}>Available times</p>

        {slots.every((s) => s.availableSpots < query.partySize) ? (
          <p className={styles.noSlots}>
            No tables for {query.partySize}{' '}
            {query.partySize === 1 ? 'guest' : 'guests'} on this date.
            Try another day or a smaller party.
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
                  {inPeriod.map(({ slotTime, availableSpots }: TimeSlotResponse) => {
                    const fits = availableSpots >= query.partySize
                    return (
                      <button
                        key={slotTime}
                        type="button"
                        disabled={!fits}
                        aria-pressed={selectedTime === slotTime}
                        onClick={() => setSelectedTime(slotTime)}
                        className={
                          selectedTime === slotTime
                            ? `${styles.slot} ${styles.slotSelected}`
                            : styles.slot
                        }
                      >
                        {formatTime(slotTime)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}

        <Button
          variant="primary"
          fullWidth
          disabled={!selectedTime}
          onClick={() =>
            navigate(
              `/restaurants/${restPhone}/book?time=${encodeURIComponent(selectedTime!)}`,
            )
          }
        >
          {selectedTime
            ? `Reserve ${formatTime(selectedTime)} for ${query.partySize} ${
                query.partySize === 1 ? 'guest' : 'guests'
              }`
            : 'Select a time'}
        </Button>
      </section>
    </>
  )
}

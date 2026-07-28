import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { RestaurantWithSlots } from '../api/types'
import { formatTime } from '../lib/time'
import styles from './RestaurantCard.module.css'

interface Props {
  restaurant: RestaurantWithSlots
  /** How many slots to surface on the card. The rest live on the detail page. */
  maxSlots?: number
  onSelectSlot?: (restPhone: string, slotTime: string) => void
}

function StarIcon() {
  return (
    <svg
      className={styles.star}
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 1.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.3l-3.8 2 .7-4.3-3.1-3 4.3-.6z" />
    </svg>
  )
}

export default function RestaurantCard({
  restaurant,
  maxSlots = 4,
  onSelectSlot,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const {
    restPhone,
    restName,
    cuisine,
    priceRange,
    city,
    imageUrl,
    avgRating,
    reviewCount,
    slots,
  } = restaurant

  const visible = slots.slice(0, maxSlots)

  return (
    <article>
      <Link
        to={`/restaurants/${restPhone}`}
        className={styles.card}
        aria-label={restName}
      >
        <div className={styles.media}>
          {imageFailed ? (
            <div className={styles.placeholder}>{restName}</div>
          ) : (
            <img
              className={styles.image}
              src={imageUrl}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}
          <span className={styles.tag}>{cuisine}</span>
        </div>

        <div className={styles.info}>
          <div className={styles.banner}>
            <span className={styles.name}>{restName}</span>

            {avgRating === null ? (
              <span className={styles.newBadge}>New</span>
            ) : (
              <span className={styles.rating}>
                <StarIcon />
                {avgRating.toFixed(1)}
                <span className={styles.count}>({reviewCount})</span>
              </span>
            )}
          </div>

          <div className={styles.meta}>
            <span>{'$'.repeat(priceRange)}</span>
            <span className={styles.dot} />
            <span>{city}</span>
          </div>
        </div>
      </Link>

      {visible.length === 0 ? (
        <p className={styles.noSlots}>No tables available</p>
      ) : (
        <div className={styles.slots}>
          {visible.map(({ slotTime, availableSpots }) => {
            const full = availableSpots === 0
            return (
              <button
                key={slotTime}
                type="button"
                disabled={full}
                aria-pressed={selected === slotTime}
                onClick={() => {
                  setSelected(slotTime)
                  onSelectSlot?.(restPhone, slotTime)
                }}
                className={
                  selected === slotTime
                    ? `${styles.slot} ${styles.slotSelected}`
                    : styles.slot
                }
              >
                {formatTime(slotTime)}
              </button>
            )
          })}
        </div>
      )}
    </article>
  )
}

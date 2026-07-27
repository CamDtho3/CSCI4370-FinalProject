import { useId, useState } from 'react'
import type { RestaurantWithSlots } from '../api/types'
import RestaurantCard from './RestaurantCard'
import styles from './CardSection.module.css'

interface Props {
  title: string
  restaurants: RestaurantWithSlots[]
  /** How many to show collapsed. Four fills one row at the default width. */
  collapsedCount?: number
  /** Open on first render. */
  defaultOpen?: boolean
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={open ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M1 1.5 6 6.5l5-5" />
    </svg>
  )
}

export default function CardSection({
  title,
  restaurants,
  collapsedCount = 4,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const gridId = useId()

  const hasMore = restaurants.length > collapsedCount
  const visible = open ? restaurants : restaurants.slice(0, collapsedCount)

  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.head}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={gridId}
        disabled={!hasMore}
      >
        <span className={styles.title}>{title}</span>
        <span className={styles.count}>{restaurants.length}</span>
        {hasMore && (
          <span className={styles.toggle}>
            {open ? 'Show less' : `Show all ${restaurants.length}`}
            <Chevron open={open} />
          </span>
        )}
      </button>

      {restaurants.length === 0 ? (
        <p className={styles.empty}>Nothing to show here.</p>
      ) : (
        <div id={gridId} className={styles.grid}>
          {visible.map((r) => (
            <RestaurantCard key={r.restPhone} restaurant={r} />
          ))}
        </div>
      )}
    </section>
  )
}

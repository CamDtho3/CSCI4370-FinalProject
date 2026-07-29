import { useEffect, useMemo, useState } from 'react'
import { useSearch } from '../context/SearchContext'
import SearchFields from '../components/search/SearchFields'
import CardSection from '../components/CardSection'
import { getRestaurantsWithSlots } from '../api/restaurants'
import type { RestaurantWithSlots } from '../api/types'
import styles from './Home.module.css'

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function Home() {
  const { query } = useSearch()
  const [restaurants, setRestaurants] = useState<RestaurantWithSlots[]>([])

  useEffect(() => {
    let active = true

    getRestaurantsWithSlots(query.slotDate, query.term)
      .then((result) => {
        if (active) setRestaurants(result)
      })
      .catch(() => {
        if (active) setRestaurants([])
      })

    return () => {
      active = false
    }
  }, [query.slotDate, query.term])

  // Unrated restaurants sort last rather than as zero.
  const topRated = useMemo(
    () =>
      [...restaurants].sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1)),
    [restaurants],
  )

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>Book a table in Athens</h1>
          <p className={styles.subtitle}>
            Find a spot for tonight, this weekend, or whenever you're free.
          </p>
          <div className={styles.searchWrap}>
            <SearchFields hero onSubmit={() => {}} />
          </div>
        </div>
      </section>

      <CardSection
        title={`Available ${formatDate(query.slotDate)}`}
        restaurants={restaurants}
      />

      <CardSection title="Top rated" restaurants={topRated} />
    </>
  )
}

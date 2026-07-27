import { useId } from 'react'
import type { FormEvent } from 'react'
import { useSearch } from '../../context/SearchContext'
import styles from './SearchFields.module.css'

interface Props {
  /** Larger treatment for the landing page. */
  hero?: boolean
  onSubmit: () => void
}

/**
 * The three search inputs. Reads and writes SearchContext directly, so
 * the hero and header instances stay in sync without prop drilling.
 */
export default function SearchFields({ hero = false, onSubmit }: Props) {
  const { query, setQuery } = useSearch()
  const id = useId()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form
      className={hero ? `${styles.form} ${styles.hero}` : styles.form}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className={`${styles.field} ${styles.term}`}>
        <label className={styles.label} htmlFor={`${id}-term`}>
          Where or what
        </label>
        <input
          id={`${id}-term`}
          className={styles.input}
          type="search"
          placeholder="Athens, or Italian"
          value={query.term}
          onChange={(e) => setQuery({ term: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-date`}>
          Date
        </label>
        <input
          id={`${id}-date`}
          className={styles.input}
          type="date"
          value={query.slotDate}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setQuery({ slotDate: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-party`}>
          Guests
        </label>
        <select
          id={`${id}-party`}
          className={`${styles.input} ${styles.select}`}
          value={query.partySize}
          onChange={(e) => setQuery({ partySize: Number(e.target.value) })}
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className={styles.submit}>
        Search
      </button>
    </form>
  )
}

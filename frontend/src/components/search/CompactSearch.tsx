import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../../context/SearchContext'
import SearchFields from './SearchFields'
import styles from './CompactSearch.module.css'

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Header search. Collapsed it reads as a summary pill; clicking it opens
 * the same field set the hero search uses.
 */
export default function CompactSearch() {
  const { query } = useSearch()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function runSearch() {
    setOpen(false)
    navigate('/search')
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={query.term ? undefined : styles.muted}>
          {query.term || 'Anywhere'}
        </span>
        <span className={styles.divider} />
        <span>{formatDate(query.slotDate)}</span>
        <span className={styles.divider} />
        <span>
          {query.partySize} {query.partySize === 1 ? 'guest' : 'guests'}
        </span>
        <span className={styles.icon} aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.popover} role="dialog" aria-label="Search restaurants">
            <SearchFields onSubmit={runSearch} />
          </div>
        </>
      )}
    </div>
  )
}

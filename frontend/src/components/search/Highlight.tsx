import { Fragment } from 'react'
import styles from './RestaurantTypeahead.module.css'

interface Props {
  text: string
  query: string
}

/**
 * Renders `text` with every occurrence of `query` emphasised and the
 * remainder dimmed. Matching is case-insensitive, but slices come from
 * the original string so display casing survives — searching "the"
 * against "The Chop House" still renders a capital T.
 */
export default function Highlight({ text, query }: Props) {
  const q = query.trim().toLowerCase()
  if (!q) return <>{text}</>

  const lower = text.toLowerCase()
  const parts: { value: string; hit: boolean }[] = []

  let cursor = 0
  let found = lower.indexOf(q)

  while (found !== -1) {
    if (found > cursor) {
      parts.push({ value: text.slice(cursor, found), hit: false })
    }
    parts.push({ value: text.slice(found, found + q.length), hit: true })
    cursor = found + q.length
    found = lower.indexOf(q, cursor)
  }

  if (cursor < text.length) {
    parts.push({ value: text.slice(cursor), hit: false })
  }

  // Nothing matched in this field — dim the whole thing.
  if (!parts.some((p) => p.hit)) {
    return <span className={styles.dim}>{text}</span>
  }

  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p.hit ? (
            <mark className={styles.hit}>{p.value}</mark>
          ) : (
            <span className={styles.dim}>{p.value}</span>
          )}
        </Fragment>
      ))}
    </>
  )
}

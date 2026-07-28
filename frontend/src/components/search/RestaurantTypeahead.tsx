import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RestaurantResponse } from '../../api/types'
import { mockRestaurants } from '../../mocks/restaurants'
import { searchRestaurants } from '../../lib/search'
import Highlight from './Highlight'
import styles from './RestaurantTypeahead.module.css'

const MAX_RESULTS = 8

interface Props {
  value: string
  onChange: (term: string) => void
  hero?: boolean
  inputId?: string
}

/**
 * Combobox over the restaurant list.
 *
 * Filtering is client-side against a cached list rather than a request
 * per keystroke — at this scale the whole dataset is a few kilobytes,
 * so shipping it once beats debouncing and cancelling network calls.
 * Swap `mockRestaurants` for a cached GET /api/restaurants; nothing
 * else here changes.
 */
export default function RestaurantTypeahead({
  value,
  onChange,
  hero = false,
  inputId,
}: Props) {
  const navigate = useNavigate()
  const generatedId = useId()
  const id = inputId ?? generatedId
  const listboxId = `${id}-listbox`

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(
    () => searchRestaurants(mockRestaurants, value, MAX_RESULTS),
    [value],
  )

  // Reset the highlighted row whenever the result set changes.
  useEffect(() => {
    setActiveIndex(-1)
  }, [value])

  // Close when focus or a click leaves the component.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  function select(r: RestaurantResponse) {
    onChange(r.restName)
    setOpen(false)
    navigate(`/restaurants/${r.restPhone}`)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }

    if (!open || matches.length === 0) {
      if (e.key === 'ArrowDown' && matches.length > 0) {
        setOpen(true)
        setActiveIndex(0)
        e.preventDefault()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % matches.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? matches.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      // Only intercept Enter when a row is highlighted; otherwise let
      // the form submit as normal.
      e.preventDefault()
      select(matches[activeIndex].restaurant)
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  const showList = open && value.trim().length > 0

  return (
    <div
      ref={wrapperRef}
      className={hero ? `${styles.wrapper} ${styles.hero}` : styles.wrapper}
    >
      <input
        id={id}
        className={styles.input}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        autoComplete="off"
        placeholder="Pompeii, or Italian"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {showList && (
        <ul className={styles.listbox} id={listboxId} role="listbox">
          {matches.length === 0 ? (
            <li className={styles.empty}>No restaurants match "{value}"</li>
          ) : (
            matches.map(({ restaurant: r }, i) => (
              <li
                key={r.restPhone}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={
                  i === activeIndex
                    ? `${styles.option} ${styles.optionActive}`
                    : styles.option
                }
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(r)}
              >
                <span className={styles.name}>
                  <Highlight text={r.restName} query={value} />
                </span>
                <span className={styles.detail}>
                  <Highlight text={r.cuisine} query={value} />
                  <span className={styles.dim}> · {r.street}</span>
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

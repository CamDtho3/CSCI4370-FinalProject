import { useId } from 'react'
import type { SelectHTMLAttributes, ReactNode } from 'react'
import styles from './Field.module.css'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

export default function Select({
  label,
  hint,
  error,
  id,
  className,
  children,
  ...rest
}: Props) {
  const generated = useId()
  const fieldId = id ?? generated
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined

  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>

      <select
        id={fieldId}
        className={[
          styles.control,
          styles.select,
          error && styles.invalid,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {children}
      </select>

      {error ? (
        <p id={`${fieldId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/** Party size options, 1–20. Matches the CHECK constraint on party_size. */
export const partySizeOptions = Array.from({ length: 20 }, (_, i) => i + 1).map(
  (n) => (
    <option key={n} value={n}>
      {n} {n === 1 ? 'guest' : 'guests'}
    </option>
  ),
)

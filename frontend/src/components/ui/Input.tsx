import { useId } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import styles from './Field.module.css'

interface BaseProps {
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

type Props = BaseProps & InputHTMLAttributes<HTMLInputElement>

export default function Input({
  label,
  hint,
  error,
  optional = false,
  id,
  className,
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
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>

      <input
        id={fieldId}
        className={[styles.control, error && styles.invalid, className]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />

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

type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({
  label,
  hint,
  error,
  optional = false,
  id,
  className,
  ...rest
}: TextareaProps) {
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
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>

      <textarea
        id={fieldId}
        className={[
          styles.control,
          styles.textarea,
          error && styles.invalid,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />

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

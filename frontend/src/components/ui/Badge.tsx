import type { ReactNode } from 'react'
import styles from './Badge.module.css'

type Tone = 'neutral' | 'positive' | 'active' | 'muted' | 'warning' | 'danger'

interface Props {
  tone?: Tone
  children: ReactNode
}

export default function Badge({ tone = 'neutral', children }: Props) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
}

/* -------------------------------------------------------------------
   Status mapping lives here, not in the pages that render it.
   Adding a status to the schema means one edit in this file.
   ------------------------------------------------------------------- */

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

const reservationTone: Record<ReservationStatus, Tone> = {
  PENDING: 'neutral',
  CONFIRMED: 'positive',
  SEATED: 'active',
  COMPLETED: 'muted',
  CANCELLED: 'warning',
  NO_SHOW: 'danger',
}

const reservationLabel: Record<ReservationStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SEATED: 'Seated',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
}

export function ReservationBadge({ status }: { status: ReservationStatus }) {
  return <Badge tone={reservationTone[status]}>{reservationLabel[status]}</Badge>
}

export type WaitlistStatus = 'WAITING' | 'NOTIFIED' | 'CONVERTED' | 'CANCELLED'

const waitlistTone: Record<WaitlistStatus, Tone> = {
  WAITING: 'neutral',
  NOTIFIED: 'positive',
  CONVERTED: 'muted',
  CANCELLED: 'warning',
}

const waitlistLabel: Record<WaitlistStatus, string> = {
  WAITING: 'Waiting',
  NOTIFIED: 'Notified',
  CONVERTED: 'Converted',
  CANCELLED: 'Cancelled',
}

export function WaitlistBadge({ status }: { status: WaitlistStatus }) {
  return <Badge tone={waitlistTone[status]}>{waitlistLabel[status]}</Badge>
}

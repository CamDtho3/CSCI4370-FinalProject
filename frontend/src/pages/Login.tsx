import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { CurrentUser } from '../context/AuthContext'
import { Button, Input } from '../components/ui'
import styles from './Login.module.css'

/* Stand-ins until /api/auth exists. */
const DEMO_DINER: CurrentUser = {
  email: 'ana@example.com',
  fname: 'Ana',
  lname: 'Reyes',
  userPhone: '706-555-0142',
  userRole: 'DINER',
}

const DEMO_STAFF: CurrentUser = {
  email: 'host@thenational.com',
  fname: 'Cam',
  lname: 'Dunn',
  userPhone: '706-549-3450',
  userRole: 'STAFF',
  employerName: 'The National',
}

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const returnTo = params.get('returnTo') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)

  // Already signed in — nothing to do here.
  if (user) return <Navigate to={returnTo} replace />

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Enter your email'
    else if (!email.includes('@')) next.email = 'That does not look like an email'
    if (!password) next.password = 'Enter your password'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Real implementation: POST /api/auth/login, then signIn(response).
    // Until then, any credentials sign you in as a diner.
    signIn({ ...DEMO_DINER, email: email.trim() })
    navigate(returnTo, { replace: true })
  }

  function devSignIn(as: CurrentUser) {
    signIn(as)
    navigate(returnTo, { replace: true })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Log in</h1>
        <p className={styles.subtitle}>
          Sign in to book a table and manage your reservations.
        </p>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.fields}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth>
            Log in
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link
            to={`/signup${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className={styles.footerLink}
          >
            Sign up
          </Link>
        </p>

        <div className={styles.devPanel}>
          <p className={styles.devLabel}>
            Development only — remove once /api/auth exists
          </p>
          <div className={styles.devButtons}>
            <Button size="sm" onClick={() => devSignIn(DEMO_DINER)}>
              Sign in as diner
            </Button>
            <Button size="sm" onClick={() => devSignIn(DEMO_STAFF)}>
              Sign in as staff
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

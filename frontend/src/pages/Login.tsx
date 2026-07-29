import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/auth'
import { ApiError } from '../api/errors'
import { Button, Input } from '../components/ui'
import styles from './Login.module.css'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const returnTo = params.get('returnTo') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in — nothing to do here.
  if (user) return <Navigate to={returnTo} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Enter your email'
    else if (!email.includes('@')) next.email = 'That does not look like an email'
    if (!password) next.password = 'Enter your password'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const result = await login(email.trim(), password)
      signIn(result)
      navigate(returnTo, { replace: true })
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not log in. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
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

          <Button type="submit" variant="primary" fullWidth disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
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
      </div>
    </div>
  )
}

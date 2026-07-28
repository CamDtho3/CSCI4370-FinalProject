import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'
import styles from './Login.module.css'

interface FieldErrors {
  fname?: string
  lname?: string
  email?: string
  userPhone?: string
  password?: string
  confirm?: string
}

export default function Signup() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const returnTo = params.get('returnTo') ?? '/'

  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')
  const [email, setEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  if (user) return <Navigate to={returnTo} replace />

  function validate(): FieldErrors {
    const next: FieldErrors = {}

    if (!fname.trim()) next.fname = 'Enter your first name'
    if (!lname.trim()) next.lname = 'Enter your last name'

    if (!email.trim()) next.email = 'Enter your email'
    else if (!email.includes('@')) next.email = 'That does not look like an email'

    // Optional, but validate the shape if given.
    if (userPhone.trim() && userPhone.replace(/\D/g, '').length < 10) {
      next.userPhone = 'Enter a 10-digit phone number'
    }

    if (!password) next.password = 'Choose a password'
    else if (password.length < 8) next.password = 'Use at least 8 characters'

    if (confirm !== password) next.confirm = 'Passwords do not match'

    return next
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Real implementation: POST /api/auth/signup, which creates the
    // User row with user_role = 'diner', then signs in.
    signIn({
      email: email.trim(),
      fname: fname.trim(),
      lname: lname.trim(),
      userPhone: userPhone.trim() || null,
      userRole: 'DINER',
    })
    navigate(returnTo, { replace: true })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>
          You'll need one to hold a table and manage your bookings.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.fields}>
            <Input
              label="First name"
              autoComplete="given-name"
              value={fname}
              error={errors.fname}
              onChange={(e) => setFname(e.target.value)}
            />
            <Input
              label="Last name"
              autoComplete="family-name"
              value={lname}
              error={errors.lname}
              onChange={(e) => setLname(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              hint="This is how you'll sign in."
              value={email}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone"
              type="tel"
              optional
              autoComplete="tel"
              placeholder="706-555-0142"
              hint="Restaurants use this if plans change."
              value={userPhone}
              error={errors.userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters."
              value={password}
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              error={errors.confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth>
            Create account
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link
            to={`/login${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className={styles.footerLink}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

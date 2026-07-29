import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signup } from '../api/auth'
import { ApiError } from '../api/errors'
import { getAllRestaurants } from '../api/restaurants'
import type { RestaurantResponse } from '../api/types'
import { Button, Input, Select } from '../components/ui'
import styles from './Signup.module.css'

type AccountType = 'diner' | 'restaurant'

interface FieldErrors {
  fname?: string
  lname?: string
  email?: string
  userPhone?: string
  employerPhone?: string
  password?: string
  confirm?: string
}

export default function Signup() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const typeName = useId()

  const returnTo = params.get('returnTo') ?? '/'

  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([])

  useEffect(() => {
    let active = true
    getAllRestaurants()
      .then((result) => {
        if (active) setRestaurants(result)
      })
      .catch(() => {
        if (active) setRestaurants([])
      })
    return () => {
      active = false
    }
  }, [])

  const [accountType, setAccountType] = useState<AccountType>('diner')
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')
  const [email, setEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [employerPhone, setEmployerPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={returnTo} replace />

  const isRestaurant = accountType === 'restaurant'

  function validate(): FieldErrors {
    const next: FieldErrors = {}

    if (!fname.trim()) next.fname = 'Enter your first name'
    if (!lname.trim()) next.lname = 'Enter your last name'

    if (!email.trim()) next.email = 'Enter your email'
    else if (!email.includes('@')) next.email = 'That does not look like an email'

    if (userPhone.trim() && userPhone.replace(/\D/g, '').length < 10) {
      next.userPhone = 'Enter a 10-digit phone number'
    }

    // employer_phone is NOT NULL for restaurant accounts — the schema's
    // CHECK requires it whenever user_role is STAFF.
    if (isRestaurant && !employerPhone) {
      next.employerPhone = 'Choose the restaurant you work at'
    }

    if (!password) next.password = 'Choose a password'
    else if (password.length < 8) next.password = 'Use at least 8 characters'

    if (confirm !== password) next.confirm = 'Passwords do not match'

    return next
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const result = await signup({
        email: email.trim(),
        password,
        userRole: isRestaurant ? 'STAFF' : 'DINER',
        fname: fname.trim(),
        lname: lname.trim(),
        userPhone: userPhone.trim() || undefined,
        employerPhone: isRestaurant ? employerPhone : undefined,
      })
      signIn(result)
      navigate(isRestaurant ? '/staff' : returnTo, { replace: true })
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Could not create your account. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>
          You'll need one to hold a table or manage a restaurant's bookings.
        </p>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className={styles.typeGroup}>
            <legend className={styles.typeLabel}>Account type</legend>
            <div className={styles.typeOptions}>
              <div>
                <input
                  type="radio"
                  id={`${typeName}-diner`}
                  name={typeName}
                  className={styles.typeInput}
                  checked={accountType === 'diner'}
                  onChange={() => setAccountType('diner')}
                />
                <label htmlFor={`${typeName}-diner`} className={styles.typeOption}>
                  <span className={styles.typeName}>Diner</span>
                  <span className={styles.typeHint}>Book tables</span>
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  id={`${typeName}-restaurant`}
                  name={typeName}
                  className={styles.typeInput}
                  checked={accountType === 'restaurant'}
                  onChange={() => setAccountType('restaurant')}
                />
                <label
                  htmlFor={`${typeName}-restaurant`}
                  className={styles.typeOption}
                >
                  <span className={styles.typeName}>Restaurant</span>
                  <span className={styles.typeHint}>Manage bookings</span>
                </label>
              </div>
            </div>
          </fieldset>

          {isRestaurant && (
            <div className={styles.employer}>
              <Select
                label="Where do you work?"
                value={employerPhone}
                error={errors.employerPhone}
                onChange={(e) => setEmployerPhone(e.target.value)}
              >
                <option value="">Select a restaurant</option>
                {restaurants.map((r) => (
                  <option key={r.restPhone} value={r.restPhone}>
                    {r.restName}
                  </option>
                ))}
              </Select>
            </div>
          )}

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
              hint={
                isRestaurant
                  ? 'Your own number, not the restaurant’s.'
                  : 'Restaurants use this if plans change.'
              }
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

          <Button type="submit" variant="primary" fullWidth disabled={submitting}>
            {submitting
              ? 'Creating account…'
              : isRestaurant
                ? 'Create restaurant account'
                : 'Create account'}
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

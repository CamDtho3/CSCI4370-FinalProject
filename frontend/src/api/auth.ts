import type { CurrentUser, UserRole } from './types'
import { throwApiError } from './errors'

/* ===================================================================
   Auth client — talks to POST/GET /api/auth/*. The backend issues a
   session cookie on login/signup; every call here needs
   credentials: 'same-origin' so the browser sends it back.
   =================================================================== */

export interface SignupRequest {
  email: string
  password: string
  userRole: UserRole
  fname: string
  lname: string
  userPhone?: string
  employerPhone?: string
}

export async function login(email: string, password: string): Promise<CurrentUser> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) await throwApiError(response)
  return (await response.json()) as CurrentUser
}

export async function signup(req: SignupRequest): Promise<CurrentUser> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!response.ok) await throwApiError(response)
  return (await response.json()) as CurrentUser
}

/** Restores the session on app load. Null (not an error) when signed out. */
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin' })

  if (response.status === 401) return null
  if (!response.ok) await throwApiError(response)
  return (await response.json()) as CurrentUser
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
}

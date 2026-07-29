import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Gates a route behind sign-in. Sends the attempted URL along as
 * returnTo so the booking survives the round trip through login —
 * which is why the booking lives in the URL rather than in router
 * state.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Still restoring the session from the /api/auth/me check — wait
  // rather than redirect, or a refresh on a protected route would
  // flash straight to the login page before the cookie's even checked.
  if (isLoading) return null

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  return <>{children}</>
}

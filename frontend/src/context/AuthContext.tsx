import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CurrentUser } from '../api/types'
import { fetchCurrentUser } from '../api/auth'

/* The CurrentUser shape lives in api/types.ts with the rest of the
   API contract — it is what the auth endpoints return, so it belongs
   beside them rather than here. Re-exported for convenience. */
export type { CurrentUser, UserRole } from '../api/types'

interface AuthContextValue {
  user: CurrentUser | null
  isStaff: boolean
  /** True until the initial GET /api/auth/me check resolves — consumers
   *  that redirect on `!user` (RequireAuth) must wait for this first,
   *  or a refresh on a protected route would flash straight to login. */
  isLoading: boolean
  signIn: (user: CurrentUser) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Restores the session on mount via GET /api/auth/me (cookie-based).
 * signIn/signOut only touch local state — the API calls that establish
 * or end the session live in api/auth.ts and are called by whoever
 * triggers them (Login, Signup, Header's sign-out button).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetchCurrentUser()
      .then((result) => {
        if (active) setUser(result)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isStaff: user?.userRole === 'STAFF',
      isLoading,
      signIn: setUser,
      signOut: () => setUser(null),
    }),
    [user, isLoading],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function initials(user: CurrentUser): string {
  return `${user.fname[0] ?? ''}${user.lname[0] ?? ''}`.toUpperCase()
}

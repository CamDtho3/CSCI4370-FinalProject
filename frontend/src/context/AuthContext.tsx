import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CurrentUser } from '../api/types'

/* The CurrentUser shape lives in api/types.ts with the rest of the
   API contract — it is what the auth endpoints return, so it belongs
   beside them rather than here. Re-exported for convenience. */
export type { CurrentUser, UserRole } from '../api/types'

interface AuthContextValue {
  user: CurrentUser | null
  isStaff: boolean
  signIn: (user: CurrentUser) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Stubbed for now — swap signIn/signOut for real calls once
 * /api/auth exists. Everything downstream reads this shape.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)

  const value = useMemo(
    () => ({
      user,
      isStaff: user?.userRole === 'STAFF',
      signIn: setUser,
      signOut: () => setUser(null),
    }),
    [user],
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

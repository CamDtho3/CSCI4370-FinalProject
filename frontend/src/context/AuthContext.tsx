import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type UserRole = 'DINER' | 'STAFF' | 'REST_ADMIN' | 'PLATFORM_ADMIN'

export interface CurrentUser {
  email: string
  fname: string
  lname: string
  userRole: UserRole
  /** Present only for STAFF and REST_ADMIN — FD A7, employer_phone. */
  employerName?: string
}

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
      isStaff: user?.userRole === 'STAFF' || user?.userRole === 'REST_ADMIN',
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

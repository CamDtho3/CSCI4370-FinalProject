import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import styles from './Layout.module.css'

/** Routes rendered at the narrow width — forms, auth, confirmation. */
const NARROW_PREFIXES = ['/login', '/signup', '/reservations/']

function isNarrowRoute(pathname: string): boolean {
  // Booking lives at /restaurants/:restPhone/book, so it matches on
  // the tail rather than the head.
  if (pathname.endsWith('/book')) return true
  return NARROW_PREFIXES.some((r) => pathname.startsWith(r))
}

export default function Layout() {
  const { pathname } = useLocation()

  const isHome = pathname === '/'
  const isNarrow = isNarrowRoute(pathname)

  const containerClass = [
    styles.container,
    isHome && styles.flush,
    isNarrow && styles.narrow,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <Header />

      <main className={styles.main}>
        <div className={containerClass}>
          <Outlet />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          CSCI 4370 · Database Management · Fall 2026
        </div>
      </footer>
    </>
  )
}

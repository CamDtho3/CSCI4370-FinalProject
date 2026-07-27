import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import styles from './Layout.module.css'

/** Routes rendered at the narrow width — forms, auth, confirmation. */
const NARROW_ROUTES = ['/login', '/signup', '/reservations/', '/book']

export default function Layout() {
  const { pathname } = useLocation()

  const isHome = pathname === '/'
  const isNarrow = NARROW_ROUTES.some((r) => pathname.startsWith(r))

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

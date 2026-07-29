import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, initials } from '../../context/AuthContext'
import CompactSearch from '../search/CompactSearch'
import Button from '../ui/Button'
import styles from './Header.module.css'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
}

export default function Header() {
  const { user, isStaff, signOut } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Hero search owns the landing page; the compact one appears everywhere else.
  const showCompactSearch = pathname !== '/'

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/" className={styles.wordmark}>
            Reserve
          </Link>
          {isStaff && user?.employerName && (
            <span className={styles.roleBadge}>Staff · {user.employerName}</span>
          )}
        </div>

        <div className={styles.centre}>
          {showCompactSearch && !isStaff && <CompactSearch />}
        </div>

        <nav className={styles.right}>
          {!user && (
            <div className={styles.authActions}>
              <NavLink to="/login" className={navClass}>
                Log in
              </NavLink>
              <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </div>
          )}

          {user && !isStaff && (
            <>
              <NavLink to="/" end className={navClass}>
                Browse
              </NavLink>
              <NavLink to="/reservations" className={navClass}>
                My reservations
              </NavLink>
              <button
                type="button"
                className={styles.avatar}
                title={`${user.fname} ${user.lname} — sign out`}
                onClick={signOut}
              >
                {initials(user)}
              </button>
            </>
          )}

          {user && isStaff && (
            <>
              <NavLink to="/staff" end className={navClass}>
                Today
              </NavLink>
              <NavLink to="/staff/availability" className={navClass}>
                Availability
              </NavLink>
              <button
                type="button"
                className={styles.avatar}
                title={`${user.fname} ${user.lname} — sign out`}
                onClick={signOut}
              >
                {initials(user)}
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui'
import styles from './NotFound.module.css'

export default function NotFound() {
  const navigate = useNavigate()
  const { user, isStaff } = useAuth()

  return (
    <div className={styles.wrap}>
      <p className={styles.code}>Error 404</p>
      <h1 className={styles.title}>We couldn't find that page</h1>
      <p className={styles.body}>
        The link may be out of date, or the address may have a typo in it.
      </p>

      <div className={styles.actions}>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to search
        </Button>
        {user && !isStaff && (
          <Button onClick={() => navigate('/reservations')}>
            Your reservations
          </Button>
        )}
        {isStaff && <Button onClick={() => navigate('/staff')}>Dashboard</Button>}
      </div>
    </div>
  )
}

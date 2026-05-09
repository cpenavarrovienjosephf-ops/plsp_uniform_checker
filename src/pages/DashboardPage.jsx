import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { UNIFORMS } from '../data/uniforms'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { account, student, loginHistory } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!account) navigate('/login')
  }, [account])

  if (!account) return null

  const proper = UNIFORMS.filter(u => u.is_proper).length
  const improper = UNIFORMS.filter(u => !u.is_proper).length
  const categories = [...new Set(UNIFORMS.map(u => u.category))].length

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Good day,</p>
          <h1 className={styles.name}>{student?.name}</h1>
          <p className={styles.meta}>@{account.username} · Joined {student?.date_joined}</p>
        </div>
        <div className={styles.headerBadge}>Student</div>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: 'Proper examples', value: proper, color: 'success' },
          { label: 'Improper examples', value: improper, color: 'danger' },
          { label: 'Categories', value: categories, color: 'gold' },
          { label: 'Logins recorded', value: loginHistory.length, color: 'muted' },
        ].map((s, i) => (
          <div key={i} className={`${styles.statCard} ${styles[s.color]}`}>
            <span className={styles.statVal}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Uniform Gallery</h2>
        <p className={styles.sectionSub}>Browse examples of proper and improper school uniforms</p>
        <button className={styles.galleryBtn} onClick={() => navigate('/gallery')}>
          Open Gallery
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      {loginHistory.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Login Activity</h2>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Date & Time</span>
              <span>IP Address</span>
              <span>Status</span>
            </div>
            {loginHistory.slice(0, 5).map(h => (
              <div key={h.history_id} className={styles.tableRow}>
                <span>{new Date(h.login_time).toLocaleString()}</span>
                <span className={styles.ip}>{h.ip_address}</span>
                <span className={styles.statusBadge}>Success</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

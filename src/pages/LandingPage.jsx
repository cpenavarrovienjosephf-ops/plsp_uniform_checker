import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const { account } = useAuth()

  useEffect(() => {
    if (account) navigate('/dashboard')
  }, [account])

  return (
    <div className={styles.root}>
      <div className={styles.bg}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.hero}>
        <div className={styles.badge}>School Uniform Management System</div>
        <h1 className={styles.title}>
          Dress for<br />
          <span className={styles.accent}>Success.</span>
        </h1>
        <p className={styles.subtitle}>
          UniCheck helps PLSP students understand and follow the Pamantasan ng Lungsod ng San Pablo uniform policy
          through a curated gallery of proper and improper examples based on official OSAS guidelines.
        </p>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => navigate('/register')}>
            Create Account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>21</span>
            <span className={styles.statLabel}>Uniform Examples</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>5</span>
            <span className={styles.statLabel}>Categories</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>100%</span>
            <span className={styles.statLabel}>Free to Use</span>
          </div>
        </div>
      </div>

      <div className={styles.cards}>
        {[
          { icon: '✓', title: 'Proper Uniforms', desc: 'Browse approved attire that meets school standards.' },
          { icon: '✗', title: 'Improper Uniforms', desc: 'See what to avoid to stay compliant.' },
          { icon: '⊞', title: 'By Category', desc: 'Filter by tops, bottoms, shoes & accessories.' },
        ].map((c, i) => (
          <div key={i} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={styles.cardIcon}>{c.icon}</div>
            <h3 className={styles.cardTitle}>{c.title}</h3>
            <p className={styles.cardDesc}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

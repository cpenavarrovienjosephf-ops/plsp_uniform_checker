import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [params]  = useSearchParams()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) return setError('Please fill in all fields.')
    setLoading(true)
    const result = await login(form.username, form.password)
    setLoading(false)
    if (result.error) return setError(result.error)
    navigate('/dashboard')
  }

  return (
    <div className={styles.root}>
      <div className={styles.bg}><div className={styles.glow} /></div>
      <div className={styles.card} style={{ maxWidth: 420 }}>
        <div className={styles.top}>
          <div className={styles.logoMark}>U</div>
          <h1 className={styles.heading}>Welcome back</h1>
          <p className={styles.sub}>No account yet? <Link to="/register" className={styles.link}>Register</Link></p>
        </div>

        {params.get('registered') && (
          <div className={styles.successBanner}>Account created! Sign in below.</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              placeholder="your username"
              value={form.username}
              onChange={set('username')}
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

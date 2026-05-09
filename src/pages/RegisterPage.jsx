import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form,    setForm]    = useState({ name: '', email: '', username: '', password: '', confirm: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.username || !form.password)
      return setError('All fields are required.')
    if (form.password !== form.confirm)
      return setError('Passwords do not match.')
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.')
    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (result.error) return setError(result.error)
    navigate('/login?registered=1')
  }

  return (
    <div className={styles.root}>
      <div className={styles.bg}><div className={styles.glow} /></div>
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={styles.logoMark}>U</div>
          <h1 className={styles.heading}>Create account</h1>
          <p className={styles.sub}>Already have one? <Link to="/login" className={styles.link}>Sign in</Link></p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Full name</label>
              <input className={styles.input} placeholder="Maria Santos" value={form.name} onChange={set('name')} disabled={loading} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="you@school.edu" value={form.email} onChange={set('email')} disabled={loading} />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input className={styles.input} placeholder="maria_santos" value={form.username} onChange={set('username')} disabled={loading} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} disabled={loading} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm password</label>
              <input className={styles.input} type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} disabled={loading} />
            </div>
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

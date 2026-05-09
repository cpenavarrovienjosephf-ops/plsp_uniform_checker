import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext  = createContext(null)
const API_BASE     = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const TOKEN_KEY    = 'uniccheck_token'

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const res   = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

export function AuthProvider({ children }) {
  const [account,      setAccount]      = useState(null)
  const [student,      setStudent]      = useState(null)
  const [loginHistory, setLoginHistory] = useState([])
  const [loading,      setLoading]      = useState(true)   // resolving stored token on mount

  // ── Restore session from stored JWT ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }

    ;(async () => {
      const { ok, data } = await apiFetch('/auth/me')
      if (ok) {
        setAccount(data.account)
        setStudent(data.student)
        // fetch history in background
        apiFetch('/auth/history').then(r => { if (r.ok) setLoginHistory(r.data) })
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
      setLoading(false)
    })()
  }, [])

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const { ok, data } = await apiFetch('/auth/login', {
      method: 'POST',
      body:   JSON.stringify({ username, password }),
    })
    if (!ok) return { error: data.error ?? 'Login failed.' }

    localStorage.setItem(TOKEN_KEY, data.token)
    setAccount(data.account)
    setStudent(data.student)
    // fetch history after login
    apiFetch('/auth/history').then(r => { if (r.ok) setLoginHistory(r.data) })
    return { success: true }
  }, [])

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, username, password }) => {
    const { ok, data } = await apiFetch('/auth/register', {
      method: 'POST',
      body:   JSON.stringify({ name, email, username, password }),
    })
    if (!ok) return { error: data.error ?? 'Registration failed.' }
    return { success: true }
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
    setAccount(null)
    setStudent(null)
    setLoginHistory([])
  }, [])

  return (
    <AuthContext.Provider value={{ account, student, loginHistory, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

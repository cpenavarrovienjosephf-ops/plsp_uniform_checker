import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const TOKEN_KEY = "uniccheck_token";

// Always pass the token explicitly so we never race against localStorage
async function apiFetch(path, options = {}, token = null) {
  const tok = token ?? localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [student, setStudent] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Restore session from stored token on mount ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      const { ok, data } = await apiFetch("/auth/me", {}, token);
      if (ok) {
        setAccount(data.account);
        setStudent(data.student);
        const hr = await apiFetch("/auth/history", {}, token);
        if (hr.ok && Array.isArray(hr.data)) setLoginHistory(hr.data);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      setLoading(false);
    })();
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const { ok, data } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!ok) return { error: data.error ?? "Login failed." };

    const token = data.token;
    localStorage.setItem(TOKEN_KEY, token);
    setAccount(data.account);
    setStudent(data.student);

    // Pass token explicitly — avoids any localStorage timing race
    const hr = await apiFetch("/auth/history", {}, token);
    if (hr.ok && Array.isArray(hr.data)) {
      setLoginHistory(hr.data);
    }

    return { success: true };
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, username, password }) => {
    const { ok, data } = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, username, password }),
    });
    if (!ok) return { error: data.error ?? "Registration failed." };
    return { success: true };
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setAccount(null);
    setStudent(null);
    setLoginHistory([]);
  }, []);

  // ── Manual refresh ───────────────────────────────────────────────────────
  const refreshHistory = useCallback(async () => {
    const hr = await apiFetch("/auth/history");
    if (hr.ok && Array.isArray(hr.data)) setLoginHistory(hr.data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        account,
        student,
        loginHistory,
        loading,
        login,
        register,
        logout,
        refreshHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

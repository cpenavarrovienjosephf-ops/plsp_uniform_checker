import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { account, student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={styles.nav}>
      <div
        className={styles.logo}
        onClick={() => navigate(account ? "/dashboard" : "/login")}
      >
        <div className={styles.logoMark}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className={styles.logoText}>PLSP Uniform Checker Guide</span>
      </div>
      {account && (
        <div className={styles.right}>
          <span className={styles.greeting}>
            <span className={styles.dot} />
            {student?.name?.toUpperCase()}
          </span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

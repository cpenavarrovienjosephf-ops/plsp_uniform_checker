import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { UNIFORMS, SCHEDULE } from "../data/uniforms";
import styles from "./DashboardPage.module.css";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getTodayName() {
  return DAYS[new Date().getDay()];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function ScheduleTypeChip({ type }) {
  const isUniform = type.includes("Official");
  const isWash = type === "Wash Day";
  const isFree = type === "Freestyle";
  const cls = isUniform
    ? styles.chipUniform
    : isWash
      ? styles.chipWash
      : styles.chipFree;
  return <span className={`${styles.chip} ${cls}`}>{type}</span>;
}

export default function DashboardPage() {
  const { account, student, loginHistory } = useAuth();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const today = getTodayName();

  useEffect(() => {
    if (!account) navigate("/login");
  }, [account]);
  if (!account) return null;

  const proper = UNIFORMS.filter((u) => u.is_proper).length;
  const improper = UNIFORMS.filter((u) => !u.is_proper).length;
  const categories = [...new Set(UNIFORMS.map((u) => u.category))].length;
  const todayAttire = SCHEDULE[today];

  const stats = [
    {
      label: "Proper Examples",
      value: proper,
      color: "success",
      icon: <CheckIcon />,
      onClick: () => navigate("/gallery?filter=Proper"),
      hint: "View in gallery →",
    },
    {
      label: "Improper Examples",
      value: improper,
      color: "danger",
      icon: <XIcon />,
      onClick: () => navigate("/gallery?filter=Improper"),
      hint: "View in gallery →",
    },
    {
      label: "Categories",
      value: categories,
      color: "green",
      icon: <GridIcon />,
      onClick: () => navigate("/gallery"),
      hint: "Browse gallery →",
    },
    {
      label: "Logins Recorded",
      value: loginHistory.length,
      color: "muted",
      icon: <ClockIcon />,
      onClick: () => setShowHistory(true),
      hint: "View history →",
    },
  ];

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={styles.greeting}>{getGreeting()},</p>
          <h1 className={styles.name}>{student?.name?.toUpperCase()}</h1>
          <p className={styles.meta}>
            <span className={styles.metaDot} />@{account.username}
            <span className={styles.metaSep}>·</span>
            Joined {student?.date_joined}
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeDot} />
            Student
          </div>
        </div>
      </div>

      {/* ── Today's Attire banner ── */}
      <div className={styles.todayBanner}>
        <div className={styles.todayLeft}>
          <CalendarIcon />
          <div>
            <p className={styles.todayLabel}>Today — {today}</p>
            <p className={styles.todayAttire}>{todayAttire}</p>
          </div>
        </div>
        <ScheduleTypeChip type={todayAttire} />
      </div>

      {/* ── Stat cards ── */}
      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <button
            key={i}
            className={`${styles.statCard} ${styles[s.color]}`}
            onClick={s.onClick}
          >
            <div className={styles.statTop}>
              <div
                className={`${styles.statIcon} ${styles[`icon_${s.color}`]}`}
              >
                {s.icon}
              </div>
              <span className={styles.statVal}>{s.value}</span>
            </div>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statHint}>{s.hint}</span>
          </button>
        ))}
      </div>

      {/* ── Weekly schedule ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Weekly Uniform Schedule</h2>
            <p className={styles.sectionSub}>
              What to wear each day of the week
            </p>
          </div>
          <button
            className={styles.galleryBtn}
            onClick={() => navigate("/gallery")}
          >
            Open Gallery
            <ArrowRightIcon />
          </button>
        </div>

        <div className={styles.scheduleGrid}>
          {DAYS.map((day) => {
            const attire = SCHEDULE[day];
            const isToday = day === today;
            const isUniform = attire?.includes("Official");
            const isWash = attire === "Wash Day";
            return (
              <div
                key={day}
                className={`${styles.dayCard}
                  ${isToday ? styles.dayToday : ""}
                  ${isUniform ? styles.dayUniform : ""}
                  ${isWash ? styles.dayWash : ""}
                  ${!isUniform && !isWash ? styles.dayFree : ""}`}
              >
                {isToday && <span className={styles.todayPill}>Today</span>}
                <span className={styles.dayName}>{day.slice(0, 3)}</span>
                <span className={styles.dayFull}>{day}</span>
                <span className={styles.dayAttire}>{attire}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.scheduleLegend}>
          <span className={`${styles.legendItem} ${styles.legendUniform}`}>
            <span className={styles.legendDot} /> Official Uniform
          </span>
          <span className={`${styles.legendItem} ${styles.legendWash}`}>
            <span className={styles.legendDot} /> Wash Day
          </span>
          <span className={`${styles.legendItem} ${styles.legendFree}`}>
            <span className={styles.legendDot} /> Freestyle
          </span>
        </div>
      </div>

      {/* ── Login history modal ── */}
      {showHistory && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowHistory(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>Login History</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            {loginHistory.length === 0 ? (
              <p className={styles.emptyHistory}>No login records found.</p>
            ) : (
              <div className={styles.historyList}>
                {loginHistory.map((h, i) => (
                  <div
                    key={h.history_id}
                    className={`${styles.historyRow} ${i === 0 ? styles.historyLatest : ""}`}
                  >
                    <div className={styles.historyIcon}>
                      <ClockIcon />
                    </div>
                    <div className={styles.historyInfo}>
                      <span className={styles.historyTime}>
                        {new Date(h.login_time).toLocaleString()}
                      </span>
                      <span className={styles.historyIp}>{h.ip_address}</span>
                    </div>
                    {i === 0 && (
                      <span className={styles.latestBadge}>Latest</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

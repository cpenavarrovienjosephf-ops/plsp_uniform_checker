import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UNIFORMS } from "../data/uniforms";
import styles from "./GalleryPage.module.css";

const CATEGORIES = ["All", ...new Set(UNIFORMS.map((u) => u.category))];

function UniformImage({ src, alt, color, accent, className }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div
        className={`${styles.imgFallback} ${className || ""}`}
        style={{ background: color }}
      >
        <span
          style={{
            color: accent,
            fontSize: "2.5rem",
            fontWeight: 800,
            opacity: 0.8,
          }}
        >
          {alt?.[0] ?? "?"}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`${styles.cardImg} ${className || ""}`}
      onError={() => setErrored(true)}
    />
  );
}

export default function GalleryPage() {
  const { account } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("filter") || "All");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!account) navigate("/login");
  }, [account]);
  if (!account) return null;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setLightbox(null);
        setSelected(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const setFilterAndSync = (f) => {
    setFilter(f);
    setSearchParams(f !== "All" ? { filter: f } : {});
  };

  const filtered = UNIFORMS.filter((u) => {
    const typeMatch =
      filter === "All" || (filter === "Proper" ? u.is_proper : !u.is_proper);
    const catMatch = category === "All" || u.category === category;
    return typeMatch && catMatch;
  });

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.headerRow}>
        <button className={styles.back} onClick={() => navigate("/dashboard")}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </button>
        <h1 className={styles.title}>PLSP Uniform Gallery</h1>
        <p className={styles.sub}>
          Pamantasan ng Lungsod ng San Pablo — Office of Student Affairs
        </p>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Show</span>
          {["All", "Proper", "Improper"].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ""} ${f === "Proper" ? styles.fProper : f === "Improper" ? styles.fImproper : ""}`}
              onClick={() => setFilterAndSync(f)}
            >
              {f === "Proper" && (
                <span
                  className={styles.statusDot}
                  style={{ background: "#16a34a" }}
                />
              )}
              {f === "Improper" && (
                <span
                  className={styles.statusDot}
                  style={{ background: "#dc2626" }}
                />
              )}
              {f}
            </button>
          ))}
        </div>
        <div className={styles.divider} />
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Category</span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`${styles.filterBtn} ${category === c ? styles.active : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <span className={styles.count}>
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map((u) => (
          <div
            key={u.uniform_id}
            className={`${styles.card} ${u.is_proper ? styles.properCard : styles.improperCard}`}
            onClick={() => setSelected(u)}
          >
            <div className={styles.imgWrap}>
              <UniformImage
                src={u.image}
                alt={u.label}
                color={u.color}
                accent={u.accent}
              />
              {/* Proper / Improper badge */}
              <div
                className={`${styles.badge} ${u.is_proper ? styles.properBadge : styles.improperBadge}`}
              >
                <span className={styles.badgeDot} />
                {u.is_proper ? "Proper" : "Improper"}
              </div>
            </div>
            <div className={styles.info}>
              {/* Category + Gender tags row */}
              <div className={styles.tagRow}>
                <span className={`${styles.tag} ${styles.tagCat}`}>
                  {u.category}
                </span>
                {u.gender && (
                  <span className={`${styles.tag} ${styles.tagGender}`}>
                    {u.gender}
                  </span>
                )}
                <span className={`${styles.tag} ${styles.tagDay}`}>
                  {u.day_type}
                </span>
              </div>
              <h3 className={styles.label}>{u.label}</h3>
              <p className={styles.desc}>{u.description}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p>No uniforms match this filter.</p>
        </div>
      )}

      {/* ── Card detail modal ── */}
      {selected && !lightbox && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setSelected(null)}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div
              className={styles.modalImgWrap}
              onClick={() => setLightbox(selected)}
              title="Click to view full image"
            >
              <UniformImage
                src={selected.image}
                alt={selected.label}
                color={selected.color}
                accent={selected.accent}
                className={styles.modalImg}
              />
              <div className={styles.viewFullHint}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                View full image
              </div>
            </div>

            <div className={styles.modalInfo}>
              <div
                className={`${styles.badge} ${styles.modalBadge} ${selected.is_proper ? styles.properBadge : styles.improperBadge}`}
              >
                <span className={styles.badgeDot} />
                {selected.is_proper ? "Proper" : "Improper"}
              </div>
              <div className={styles.tagRow} style={{ marginBottom: "0.5rem" }}>
                <span className={`${styles.tag} ${styles.tagCat}`}>
                  {selected.category}
                </span>
                {selected.gender && (
                  <span className={`${styles.tag} ${styles.tagGender}`}>
                    {selected.gender}
                  </span>
                )}
                <span className={`${styles.tag} ${styles.tagDay}`}>
                  {selected.day_type}
                </span>
              </div>
              <h2 className={styles.modalTitle}>{selected.label}</h2>
              <p className={styles.modalDesc}>{selected.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Full-image lightbox ── */}
      {lightbox && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightbox(null)}
        >
          <button
            className={styles.lightboxClose}
            onClick={() => setLightbox(null)}
          >
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
          </button>
          <img
            src={lightbox.image}
            alt={lightbox.label}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <p className={styles.lightboxCaption}>{lightbox.label}</p>
        </div>
      )}
    </div>
  );
}

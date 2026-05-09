import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UNIFORMS, SCHEDULE, WASH_DAY_OPTIONS, FREESTYLE_PROHIBITED, DRESS_CODE_SPECS } from '../data/uniforms'
import styles from './GalleryPage.module.css'

const CATEGORIES = ['All', ...new Set(UNIFORMS.map(u => u.category))]

function categoryIcon(cat) {
  if (cat === 'Top')         return '👔'
  if (cat === 'Bottom')      return '👖'
  if (cat === 'Shoes')       return '👞'
  if (cat === 'Accessories') return '🎽'
  if (cat === 'Hair')        return '💇'
  return '👕'
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function GalleryPage() {
  const { account } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]       = useState('gallery')  // gallery | schedule | specs
  const [filter, setFilter] = useState('All')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => { if (!account) navigate('/login') }, [account])
  if (!account) return null

  const filtered = UNIFORMS.filter(u => {
    const typeMatch = filter === 'All' || (filter === 'Proper' ? u.is_proper : !u.is_proper)
    const catMatch  = category === 'All' || u.category === category
    return typeMatch && catMatch
  })

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div>
          <button className={styles.back} onClick={() => navigate('/dashboard')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </button>
          <h1 className={styles.title}>PLSP Uniform Policy</h1>
          <p className={styles.sub}>Pamantasan ng Lungsod ng San Pablo — Office of Student Affairs</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {[['gallery','Uniform Gallery'],['schedule','Weekly Schedule'],['specs','Dress Code Specs']].map(([k,l]) => (
          <button key={k} className={`${styles.tab} ${tab===k ? styles.activeTab : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── GALLERY TAB ── */}
      {tab === 'gallery' && <>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            {['All','Proper','Improper'].map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter===f ? styles.active : ''} ${f==='Proper' ? styles.proper : f==='Improper' ? styles.improper : ''}`}
                onClick={() => setFilter(f)}
              >
                {f==='Proper'   && <span className={styles.dot} style={{background:'var(--success)'}} />}
                {f==='Improper' && <span className={styles.dot} style={{background:'var(--danger)'}} />}
                {f}
              </button>
            ))}
          </div>
          <div className={styles.filterGroup}>
            {CATEGORIES.map(c => (
              <button key={c} className={`${styles.filterBtn} ${category===c ? styles.active : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        <p className={styles.sub} style={{marginBottom:'1rem'}}>{filtered.length} item{filtered.length!==1?'s':''} shown</p>

        <div className={styles.grid}>
          {filtered.map(u => (
            <div
              key={u.uniform_id}
              className={`${styles.card} ${u.is_proper ? styles.properCard : styles.improperCard}`}
              onClick={() => setSelected(u)}
            >
              <div className={styles.preview} style={{ background: u.color }}>
                <div className={styles.previewIcon} style={{ color: u.accent }}>{categoryIcon(u.category)}</div>
                <div className={`${styles.badge} ${u.is_proper ? styles.properBadge : styles.improperBadge}`}>
                  {u.is_proper ? '✓ Proper' : '✗ Improper'}
                </div>
              </div>
              <div className={styles.info}>
                <span className={styles.category}>{u.category}</span>
                <h3 className={styles.label}>{u.label}</h3>
                <p className={styles.desc}>{u.description}</p>
                <span className={styles.dayTag}>{u.day_type}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={styles.empty}><p>No uniforms match this filter.</p></div>
        )}
      </>}

      {/* ── SCHEDULE TAB ── */}
      {tab === 'schedule' && (
        <div className={styles.scheduleWrap}>
          <h2 className={styles.sectionH}>2.1. Weekly Schedule</h2>
          <div className={styles.scheduleGrid}>
            {DAYS.map(day => {
              const type = SCHEDULE[day]
              const isUniform  = type.includes('Official')
              const isWash     = type === 'Wash Day'
              const isStyle    = type === 'Freestyle'
              return (
                <div key={day} className={`${styles.dayCard} ${isUniform ? styles.uniformDay : isWash ? styles.washDay : styles.freeDay}`}>
                  <span className={styles.dayName}>{day}</span>
                  <span className={styles.dayType}>{type}</span>
                </div>
              )
            })}
          </div>

          <h2 className={styles.sectionH} style={{marginTop:'2rem'}}>Wash Day Options (Tue & Thu)</h2>
          <ul className={styles.optList}>
            {WASH_DAY_OPTIONS.map((o,i) => <li key={i} className={styles.optItem}><span className={styles.optCheck}>✓</span>{o}</li>)}
          </ul>

          <h2 className={styles.sectionH} style={{marginTop:'2rem'}}>Freestyle Prohibited Items (Sat & Sun)</h2>
          <ul className={styles.optList}>
            {FREESTYLE_PROHIBITED.map((o,i) => <li key={i} className={styles.optItem}><span className={styles.optX}>✗</span>{o}</li>)}
          </ul>
        </div>
      )}

      {/* ── SPECS TAB ── */}
      {tab === 'specs' && (
        <div className={styles.specWrap}>
          <h2 className={styles.sectionH}>Section 4. Dress Code Specifications</h2>
          {DRESS_CODE_SPECS.map((s,i) => (
            <div key={i} className={styles.specCard}>
              <span className={styles.specTitle}>4.{i+1}. {s.spec}</span>
              <p className={styles.specRule}>{s.rule}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setSelected(null)}>✕</button>
            <div className={styles.modalPreview} style={{ background: selected.color }}>
              <div className={styles.modalIcon}>{categoryIcon(selected.category)}</div>
            </div>
            <div className={styles.modalInfo}>
              <div className={`${styles.badge} ${selected.is_proper ? styles.properBadge : styles.improperBadge}`} style={{marginBottom:'0.75rem',display:'inline-flex'}}>
                {selected.is_proper ? '✓ Proper' : '✗ Improper'}
              </div>
              <h2 className={styles.modalTitle}>{selected.label}</h2>
              <p className={styles.modalCat}>{selected.category} · {selected.day_type}</p>
              <p className={styles.modalDesc}>{selected.description}</p>
              <div className={styles.modalMeta}>
                <span>ID #{selected.uniform_id}</span>
                <span>Category: {selected.category}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

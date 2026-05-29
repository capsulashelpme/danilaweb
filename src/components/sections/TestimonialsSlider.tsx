import { useEffect, useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

/* ── Tipos ── */
interface Shape {
  type: 'circle' | 'roundedrect' | 'pill'
  w: number; h: number
  top?: string; bottom?: string; left?: string; right?: string
  color: string
  opacity: number
  rotate?: number
}

const SHAPE_SETS: Shape[][] = [
  [
    { type: 'circle',      w: 100, h: 100, top: '-18px',   left: '-20px',  color: '#FF5A1F', opacity: 0.85 },
    { type: 'pill',        w: 130, h: 46,  bottom: '18px', left: '30%',    color: '#C93A12', opacity: 0.65, rotate: -8 },
    { type: 'roundedrect', w: 68,  h: 68,  bottom: '10px', right: '-14px', color: '#ffffff', opacity: 0.08, rotate: 18 },
  ],
  [
    { type: 'roundedrect', w: 120, h: 120, top: '-22px',   right: '8%',    color: '#FF6A00', opacity: 0.75, rotate: 20 },
    { type: 'circle',      w: 64,  h: 64,  bottom: '8px',  left: '-14px',  color: '#ffffff', opacity: 0.07 },
    { type: 'pill',        w: 85,  h: 36,  bottom: '20px', right: '6%',    color: '#E54A12', opacity: 0.70, rotate: 5 },
  ],
  [
    { type: 'pill',        w: 150, h: 52,  top: '-16px',   left: '14%',    color: '#FF5A1F', opacity: 0.80, rotate: -12 },
    { type: 'circle',      w: 85,  h: 85,  bottom: '-18px',right: '-8px',  color: '#C93A12', opacity: 0.70 },
    { type: 'roundedrect', w: 55,  h: 55,  bottom: '16px', left: '4%',     color: '#ffffff', opacity: 0.07, rotate: 35 },
  ],
  [
    { type: 'circle',      w: 90,  h: 90,  top: '-12px',   right: '10%',   color: '#FF5A1F', opacity: 0.80 },
    { type: 'roundedrect', w: 110, h: 42,  bottom: '14px', left: '-10px',  color: '#E54A12', opacity: 0.65, rotate: 12 },
    { type: 'pill',        w: 60,  h: 60,  bottom: '8px',  right: '-10px', color: '#ffffff', opacity: 0.07 },
  ],
  [
    { type: 'pill',        w: 140, h: 50,  top: '-14px',   left: '5%',     color: '#C93A12', opacity: 0.75, rotate: 6 },
    { type: 'circle',      w: 75,  h: 75,  bottom: '-15px',right: '12%',   color: '#FF6A00', opacity: 0.70 },
    { type: 'roundedrect', w: 50,  h: 50,  bottom: '20px', left: '-8px',   color: '#ffffff', opacity: 0.07, rotate: -25 },
  ],
  [
    { type: 'circle',      w: 95,  h: 95,  top: '-16px',   left: '20%',    color: '#FF5A1F', opacity: 0.78 },
    { type: 'roundedrect', w: 70,  h: 70,  bottom: '-12px',left: '-10px',  color: '#C93A12', opacity: 0.65, rotate: 30 },
    { type: 'pill',        w: 100, h: 38,  bottom: '22px', right: '5%',    color: '#ffffff', opacity: 0.07, rotate: -5 },
  ],
  [
    { type: 'roundedrect', w: 105, h: 105, top: '-20px',   left: '-16px',  color: '#E54A12', opacity: 0.70, rotate: 15 },
    { type: 'pill',        w: 120, h: 44,  bottom: '16px', left: '25%',    color: '#FF6A00', opacity: 0.65, rotate: 8 },
    { type: 'circle',      w: 58,  h: 58,  bottom: '-10px',right: '8%',    color: '#ffffff', opacity: 0.08 },
  ],
  [
    { type: 'pill',        w: 160, h: 54,  top: '-18px',   right: '6%',    color: '#FF5A1F', opacity: 0.80, rotate: -10 },
    { type: 'circle',      w: 80,  h: 80,  bottom: '-14px',left: '5%',     color: '#C93A12', opacity: 0.70 },
    { type: 'roundedrect', w: 55,  h: 55,  bottom: '20px', right: '-10px', color: '#ffffff', opacity: 0.07, rotate: 22 },
  ],
  [
    { type: 'circle',      w: 88,  h: 88,  top: '-10px',   left: '-14px',  color: '#FF6A00', opacity: 0.80 },
    { type: 'roundedrect', w: 95,  h: 38,  bottom: '18px', left: '30%',    color: '#E54A12', opacity: 0.65, rotate: -15 },
    { type: 'pill',        w: 65,  h: 65,  bottom: '-12px',right: '10%',   color: '#ffffff', opacity: 0.07 },
  ],
  [
    { type: 'pill',        w: 130, h: 48,  top: '-14px',   left: '10%',    color: '#C93A12', opacity: 0.75, rotate: 10 },
    { type: 'circle',      w: 100, h: 100, bottom: '-20px',right: '-12px', color: '#FF5A1F', opacity: 0.72 },
    { type: 'roundedrect', w: 60,  h: 60,  bottom: '24px', left: '-8px',   color: '#ffffff', opacity: 0.07, rotate: -30 },
  ],
]

function ShapeEl({ s }: { s: Shape }) {
  return (
    <div style={{
      position: 'absolute',
      width: s.w, height: s.h,
      top: s.top, bottom: s.bottom, left: s.left, right: s.right,
      background: s.color,
      opacity: s.opacity,
      transform: s.rotate ? `rotate(${s.rotate}deg)` : undefined,
      pointerEvents: 'none',
      borderRadius:
        s.type === 'circle'      ? '50%'  :
        s.type === 'roundedrect' ? '22px' : '999px',
    }} />
  )
}

const SERVICE_COLOR: Record<string, string> = {
  'Publicidad Pagada':   '#FF5A1F',
  'Página Web':          '#6B9FFF',
  'Publicidad Orgánica': '#A78BFA',
}
void SERVICE_COLOR

const SERVICES = ['Publicidad Pagada', 'Página Web', 'Publicidad Orgánica']
const LS_KEY = 'dogma_my_testimonials'

interface TestimonialItem {
  id?: string
  name: string; biz: string; service: string
  stars: number; text: string; shapes: Shape[]
  pending?: boolean
}

interface StoredTestimonial {
  id: string; name: string; biz: string; service: string
  text: string; stars: number; submittedAt: string
}

function loadOwn(): StoredTestimonial[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function saveOwn(items: StoredTestimonial[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

/* ── Stars ── */
function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#FF5A1F">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  )
}

function Verified() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1D9BF0" style={{ flexShrink: 0 }}>
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.51-1.27-3.9-.81-.68-1.31-1.9-2.19-3.35-2.19-1.43 0-2.65.88-3.33 2.19-1.4-.46-2.9-.2-3.91.81-1 1-1.26 2.51-.8 3.9C1.88 9.33 1 10.57 1 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1 1 2.51 1.26 3.9.8.68 1.31 1.9 2.19 3.34 2.19 1.43 0 2.65-.88 3.33-2.19 1.4.46 2.9.2 3.91-.81 1-1 1.26-2.51.8-3.9C21.36 14.67 22.25 13.43 22.25 12zm-6.25-1.29l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 011.06 1.06z"/>
    </svg>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    }}>
      <span style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

/* ── Card ── */
function Card({ t }: { t: TestimonialItem }) {
  return (
    <div style={{
      borderRadius: 22, overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
      width: '100%', background: '#fff', height: 280,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={t.name} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.name}
              </span>
              {!t.pending && <Verified />}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>{t.biz}</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#444', background: '#f0f0f0', borderRadius: 8, padding: '5px 10px', whiteSpace: 'nowrap', flexShrink: 0, border: '1px solid #e5e5e5' }}>
            {t.service}
          </span>
        </div>

        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 15, lineHeight: 1.45, color: '#111', margin: 0,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: '65px',
        }}>
          "{t.text}"
        </p>

        <Stars n={t.stars} />
      </div>

      <div style={{ position: 'relative', background: '#111', padding: '14px 20px', overflow: 'hidden' }}>
        {t.shapes.map((s, i) => <ShapeEl key={i} s={s} />)}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{t.biz}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Cliente verificado</div>
        </div>
      </div>
    </div>
  )
}

/* ── Arrow button ── */
function ArrowBtn({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={dir === 'right' ? 'Siguiente opinión' : 'Opinión anterior'}
      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,90,31,0.75)' }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', duration: 0.25, bounce: 0.3 }}
      style={{
        position: 'absolute',
        top: '50%',
        [dir]: -18,
        transform: 'translateY(-50%)',
        zIndex: 10,
        width: 36, height: 36,
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'right' ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
      </svg>
    </motion.button>
  )
}

/* ── Star picker ── */
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1,2,3,4,5].map(n => (
        <motion.button
          key={n} type="button"
          onClick={() => onChange(n)}
          onHoverStart={() => setHovered(n)}
          onHoverEnd={() => setHovered(0)}
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', duration: 0.2, bounce: 0.4 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24"
            fill={n <= (hovered || value) ? '#FF5A1F' : '#e0e0e0'}
            style={{ transition: 'fill 0.15s' }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </motion.button>
      ))}
    </div>
  )
}

/* ── Helpers ── */
const toTitleCase = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase())
const toFirstCap  = (s: string) => s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)
const MAX_NAME = 40; const MAX_BIZ = 50; const MAX_TEXT = 220

/* ── Bottom Sheet ── */
function OpinionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name,    setNameRaw] = useState('')
  const [biz,     setBizRaw]  = useState('')
  const [service, setService] = useState(SERVICES[0])
  const [text,    setTextRaw] = useState('')
  const [stars,   setStars]   = useState(5)
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [err,     setErr]     = useState('')

  const setName = (v: string) => setNameRaw(toTitleCase(v.slice(0, MAX_NAME)))
  const setBiz  = (v: string) => setBizRaw(toFirstCap(v.slice(0, MAX_BIZ)))
  const setText = (v: string) => setTextRaw(toFirstCap(v.slice(0, MAX_TEXT)))

  const reset = () => {
    setNameRaw(''); setBizRaw(''); setService(SERVICES[0])
    setTextRaw(''); setStars(5); setSent(false); setErr('')
  }
  const handleClose = () => { onClose(); setTimeout(reset, 420) }

  const submit = async () => {
    const n = name.trim(); const b = biz.trim(); const t = text.trim()
    if (!n) { setErr('Escribe tu nombre.'); return }
    if (!b) { setErr('Escribe el nombre de tu negocio.'); return }
    if (!t) { setErr('Escribe tu opinión.'); return }
    setErr(''); setSending(true)
    const id = crypto.randomUUID()
    const { error } = await supabase
      .from('testimonials')
      .insert({ id, name: n, biz: b, service, text: t, stars, status: 'pending' })
    setSending(false)
    if (error) {
      console.error('Testimonial insert error:', error)
      setErr('Hubo un problema al enviar. Intenta de nuevo.')
      return
    }
    const existing = loadOwn()
    existing.unshift({ id, name: n, biz: b, service, text: t, stars, submittedAt: new Date().toISOString() })
    saveOwn(existing.slice(0, 10))
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: '#f5f5f5', border: '1.5px solid #e8e8e8',
    borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)',
    color: '#111', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6,
  }

  return (
    <>
      {/* Overlay — fade */}
      <motion.div
        onClick={handleClose}
        initial={false}
        animate={{ opacity: open ? 1 : 0, backdropFilter: open ? 'blur(4px)' : 'blur(0px)' }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 1000,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Sheet — slide up con spring */}
      <motion.div
        initial={false}
        animate={{
          y: open ? 0 : '105%',
          scale: open ? 1 : 0.98,
        }}
        transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.9 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 1001,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '0 20px 36px',
          maxHeight: '82vh',
          overflowY: 'auto',
          boxShadow: '0 -8px 48px rgba(0,0,0,0.35)',
          transformOrigin: 'bottom center',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: '#ddd' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#111' }}>
            Dejar mi opinión
          </span>
          <motion.button
            onClick={handleClose}
            whileHover={{ scale: 1.1, backgroundColor: '#e5e5e5' }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', duration: 0.2, bounce: 0.3 }}
            style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            /* ── Estado de éxito ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              style={{ textAlign: 'center', padding: '32px 0 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
            >
              {/* Ícono con animación de entrada */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 220, delay: 0.1 }}
                style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 180, delay: 0.18 }}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#111', margin: 0 }}
              >
                Publicada con éxito
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 180, delay: 0.26 }}
                style={{ fontSize: 13.5, color: '#666', margin: 0, lineHeight: 1.5, maxWidth: '28ch' }}
              >
                Tu opinión será revisada y publicada pronto. ¡Gracias!
              </motion.p>
              <motion.button
                onClick={handleClose}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 180, delay: 0.34 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 36px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Cerrar
              </motion.button>
            </motion.div>
          ) : (
            /* ── Formulario ── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input style={inputStyle} placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} maxLength={MAX_NAME} autoComplete="given-name"/>
                </div>
                <div>
                  <label style={labelStyle}>Negocio *</label>
                  <input style={inputStyle} placeholder="Nombre del negocio" value={biz} onChange={e => setBiz(e.target.value)} maxLength={MAX_BIZ} autoComplete="organization"/>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Servicio contratado</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SERVICES.map(s => (
                    <motion.button
                      key={s} type="button" onClick={() => setService(s)}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', duration: 0.2, bounce: 0.3 }}
                      style={{
                        fontSize: 11.5, fontWeight: 600, borderRadius: 999, padding: '6px 14px',
                        border: 'none', cursor: 'pointer',
                        background: service === s ? '#111' : '#f0f0f0',
                        color: service === s ? '#fff' : '#555',
                        transition: 'background 0.18s, color 0.18s',
                      }}
                    >{s}</motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Calificación *</label>
                <StarPicker value={stars} onChange={setStars} />
              </div>

              <div>
                <label style={labelStyle}>Tu opinión *</label>
                <textarea
                  style={{ ...inputStyle, resize: 'none', height: 88 }}
                  placeholder="Cuéntanos tu experiencia..."
                  value={text} onChange={e => setText(e.target.value)} maxLength={MAX_TEXT}
                />
                <div style={{ fontSize: 11, color: text.length >= MAX_TEXT * 0.9 ? '#f59e0b' : '#bbb', textAlign: 'right', marginTop: 3 }}>
                  {text.length} / {MAX_TEXT}
                </div>
              </div>

              <AnimatePresence>
                {err && (
                  <motion.p
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: 'spring', duration: 0.25, bounce: 0.2 }}
                    style={{ fontSize: 12.5, color: '#ef4444', margin: 0, fontWeight: 500, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}
                  >
                    {err}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                onClick={submit}
                disabled={sending}
                whileHover={sending ? {} : { scale: 1.02, y: -1 }}
                whileTap={sending ? {} : { scale: 0.98 }}
                transition={{ type: 'spring', duration: 0.25, bounce: 0.2 }}
                style={{
                  background: sending ? '#d1d5db' : '#111', color: '#fff',
                  border: 'none', borderRadius: 14, padding: '14px', width: '100%',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                {sending ? 'Enviando…' : 'Enviar opinión'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

/* ── Merge DB + own pending ── */
function buildItems(approved: TestimonialItem[], own: StoredTestimonial[]): TestimonialItem[] {
  const approvedIds = new Set(approved.map(a => a.id).filter(Boolean))
  const stillPending = own.filter(o => !approvedIds.has(o.id))
  if (stillPending.length !== own.length) saveOwn(stillPending)

  const pendingItems: TestimonialItem[] = stillPending.map((o, i) => ({
    id: o.id, name: o.name, biz: o.biz, service: o.service,
    text: o.text, stars: o.stars, pending: true,
    shapes: SHAPE_SETS[(approved.length + i) % SHAPE_SETS.length],
  }))

  return [...pendingItems, ...approved]
}

/* ── Variants para el slider con dirección ── */
const CARD_VARIANTS = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '72%' : '-72%',
    opacity: 0,
    scale: 0.92,
    filter: 'blur(3px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '-72%' : '72%',
    opacity: 0,
    scale: 0.92,
    filter: 'blur(3px)',
  }),
}

const SPRING = { type: 'spring' as const, damping: 28, stiffness: 220, mass: 0.85 }

/* ── Dots de paginación ── */
function Dots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null
  const shown = Math.min(total, 5)
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current % shown ? 20 : 6, opacity: i === current % shown ? 1 : 0.3 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.3 }}
          style={{ height: 6, borderRadius: 999, background: 'var(--orange-1)' }}
        />
      ))}
    </div>
  )
}

export function TestimonialsSlider() {
  const [items, setItems] = useState<TestimonialItem[]>(() => buildItems([], loadOwn()))
  const [sheetOpen, setSheetOpen] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [direction, setDirection]   = useState(0) // -1 swipe left, 1 swipe right

  const currentRef  = useRef(0)
  const totalRef    = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  currentRef.current = currentIdx
  totalRef.current   = items.length

  const refreshItems = useCallback(async () => {
    const own = loadOwn()
    const { data } = await supabase
      .from('testimonials')
      .select('id, name, biz, service, text, stars')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    const approved: TestimonialItem[] = (data ?? []).map((d, i) => ({
      id: d.id, name: d.name, biz: d.biz,
      service: d.service ?? 'Publicidad Pagada',
      text: d.text, stars: d.stars,
      shapes: SHAPE_SETS[i % SHAPE_SETS.length],
    }))
    const next = buildItems(approved, own)
    setItems(next)
    if (currentRef.current >= next.length) setCurrentIdx(0)
  }, [])

  useEffect(() => {
    refreshItems()
    const ch = supabase
      .channel('testimonials-public-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, refreshItems)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [refreshItems])

  const goNext = useCallback(() => {
    setDirection(-1)
    setCurrentIdx(i => (i + 1) % totalRef.current)
  }, [])

  const goPrev = useCallback(() => {
    setDirection(1)
    setCurrentIdx(i => (i - 1 + totalRef.current) % totalRef.current)
  }, [])

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (totalRef.current > 1) {
      intervalRef.current = setInterval(goNext, 4200)
    }
  }, [goNext])

  useEffect(() => {
    resetTimer()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [resetTimer])

  const handleNext = () => { goNext(); resetTimer() }
  const handlePrev = () => { goPrev(); resetTimer() }

  return (
    <>
      <section style={{ padding: '56px 20px 48px', background: 'var(--bg-0)' }} aria-label="Opiniones de clientes">
        {/* Cabecera */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="eyebrow">Opiniones reales</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(22px, 5vw, 34px)', lineHeight: 1.15,
            margin: '10px 0 0', color: 'var(--fg-0)',
          }}>
            Lo que dicen nuestros clientes
          </h2>
        </div>

        {/* Slider */}
        {items.length > 0 && (
          <div style={{ maxWidth: 400, margin: '0 auto', padding: '0 12px 0 24px', position: 'relative' }}>
            {items.length > 1 && (
              <>
                <ArrowBtn dir="left"  onClick={handlePrev} />
                <ArrowBtn dir="right" onClick={handleNext} />
              </>
            )}

            {/* Stage con overflow hidden para que la card saliente no sea visible */}
            <div style={{ overflow: 'hidden', borderRadius: 22 }}>
              <AnimatePresence custom={direction} mode="popLayout">
                <motion.div
                  key={currentIdx}
                  custom={direction}
                  variants={CARD_VARIANTS}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SPRING}
                  drag={items.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  dragMomentum={false}
                  onDragStart={() => {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                  }}
                  onDragEnd={(_, info) => {
                    const W = 400
                    const threshold = W * 0.28
                    const vel       = info.velocity.x
                    const off       = info.offset.x

                    if (off < -threshold || vel < -450) {
                      goNext()
                    } else if (off > threshold || vel > 450) {
                      goPrev()
                    }
                    resetTimer()
                  }}
                  whileDrag={{ scale: 1.025, boxShadow: '0 16px 56px rgba(0,0,0,0.55)' }}
                  style={{ cursor: items.length > 1 ? 'grab' : 'default', willChange: 'transform' }}
                >
                  <Card t={items[currentIdx]} />
                </motion.div>
              </AnimatePresence>
            </div>

            <Dots total={items.length} current={currentIdx} />
          </div>
        )}

        {/* Botón "Dejar mi opinión" */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <motion.button
            onClick={() => setSheetOpen(true)}
            whileHover={{ scale: 1.04, borderColor: 'rgba(255,90,31,0.5)', color: 'var(--fg-1)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0.2 }}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999, padding: '8px 20px',
              color: 'var(--fg-3)', fontSize: 12.5, fontFamily: 'var(--font-body)',
              fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Dejar mi opinión
          </motion.button>
        </div>
      </section>

      <OpinionSheet open={sheetOpen} onClose={() => {
        setSheetOpen(false)
        setTimeout(async () => {
          await refreshItems()
          if (loadOwn().length > 0) setCurrentIdx(0)
        }, 320)
      }} />
    </>
  )
}

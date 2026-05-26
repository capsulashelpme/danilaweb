import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSiteSetting } from '@/hooks/useSiteSetting'
import { WA_LINK } from '@/lib/constants'

const TESTIMONIALS = [
  { txt: 'Implementamos muchas mejoras, gracias a su servicio.',                                              who: 'Social Media CUU · Chihuahua' },
  { txt: 'Los diseños y videos sencillos pero atrajeron más ventas.',                                         who: 'Kocomita · Chihuahua' },
  { txt: 'La agencia despegó con el contenido orgánico en el primer video.',                                  who: 'Bycar · Chihuahua' },
  { txt: 'El contenido y los métodos de venta sirvieron bastante.',                                           who: 'Palenque Poliforum · Chihuahua' },
  { txt: 'Vendimos en 3 meses lo que tardábamos 1 año hacer.',                                               who: 'Rebeldillo · Chihuahua' },
  { txt: 'Las consolas se vendían rápido gracias a los videos orgánicos.',                                    who: 'Bitverse MX · CDMX' },
  { txt: 'El rebranding al negocio le dio otra vida al negocio digital.',                                     who: 'Infinia · Chihuahua' },
  { txt: 'Como marca personal, la asesoría y rebranding fue muy profesional.',                                who: 'Dafne Leah · Chihuahua' },
  { txt: 'La web quedó excelente, ya veo todas las estadísticas a las que no tenía acceso.',                 who: 'Arove Media · Chihuahua' },
  { txt: 'Dani hizo buen trabajo al saber cómo hacer el catálogo digital de los carros sin tanto rollo.',    who: 'Luxury Car · Guadalajara' },
]

const WhatsAppIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M27.2 4.7A15.85 15.85 0 0 0 16 0 16 16 0 0 0 2.16 23.86L0 32l8.36-2.19A15.97 15.97 0 0 0 16 32 16 16 0 0 0 27.2 4.7zM16 29.26a13.27 13.27 0 0 1-6.77-1.85l-.48-.29-5 1.3 1.34-4.87-.32-.5A13.3 13.3 0 1 1 16 29.26zm7.3-9.95c-.4-.2-2.36-1.17-2.73-1.3-.36-.13-.63-.2-.9.2-.27.4-1.03 1.3-1.27 1.57-.23.27-.46.3-.86.1a10.93 10.93 0 0 1-3.22-2 12.07 12.07 0 0 1-2.23-2.77c-.23-.4-.02-.6.18-.8.18-.18.4-.46.6-.7.2-.23.27-.4.4-.66.13-.27.07-.5-.03-.7-.1-.2-.9-2.16-1.23-2.96-.32-.78-.65-.67-.9-.68l-.76-.02c-.27 0-.7.1-1.06.5-.36.4-1.4 1.36-1.4 3.32 0 1.96 1.43 3.85 1.63 4.12.2.27 2.82 4.3 6.83 6.04.95.4 1.7.65 2.28.84.96.3 1.83.26 2.52.16.77-.12 2.36-.97 2.7-1.9.32-.94.32-1.74.23-1.9-.1-.16-.36-.27-.76-.46z"/>
  </svg>
)

const GoogleG = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Google" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const Stars = ({ n = 5, size = 12 }: { n?: number; size?: number }) => (
  <span aria-label={`${n} de 5 estrellas`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--orange-1)', filter: 'drop-shadow(0 0 6px rgba(255,90,31,0.4))' }}>
    {Array.from({ length: n }).map((_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17l-6.1 3.5 1.5-6.8L2.2 9l6.9-.7L12 2z"/>
      </svg>
    ))}
  </span>
)

// Fixed-height fade carousel — never changes layout size
function FadeTestimonials() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'relative', zIndex: 2, marginTop: 28, paddingTop: 14, paddingLeft: 24, paddingRight: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Rating summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16, fontSize: 13, color: 'var(--fg-2)' }}>
        <Stars n={5} size={12}/>
        <span><b style={{ color: 'var(--fg-0)', fontWeight: 700 }}>4.9 / 5</b> en valoraciones reales de clientes</span>
      </div>

      {/* Fixed-height card container — never collapses/expands */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
          {/* Card shell — siempre visible */}
          <div style={{
            padding: '12px 20px 14px',
            borderRadius: 'var(--r-lg)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 5, textAlign: 'center',
            minHeight: 100,
          }}>
            {/* Íconos estáticos — nunca desaparecen */}
            <GoogleG size={13}/>
            <Stars n={5} size={11}/>

            {/* Solo el texto anima */}
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              >
                <p style={{
                  fontSize: 12, color: 'var(--fg-1)', lineHeight: 1.4, fontWeight: 500,
                }}>"{TESTIMONIALS[idx].txt}"</p>
                <small style={{ fontSize: 10, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
                  {TESTIMONIALS[idx].who}
                </small>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Opinión ${i + 1}`}
            style={{
              width: i === idx ? 16 : 6, height: 6, borderRadius: 3,
              background: i === idx ? 'var(--orange-1)' : 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer',
              transition: 'width .3s, background .3s', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Partículas flotantes — posiciones iniciales fijas para evitar re-renders
const PARTICLES = [
  { x: 12, y: 18 }, { x: 78, y: 8  }, { x: 55, y: 25 }, { x: 30, y: 45 },
  { x: 88, y: 35 }, { x: 20, y: 60 }, { x: 65, y: 55 }, { x: 45, y: 12 },
  { x: 92, y: 65 }, { x: 10, y: 80 }, { x: 72, y: 78 }, { x: 38, y: 88 },
]

export function HeroCard() {
  const [heroBadge] = useSiteSetting('hero_badge', '2 espacios disponibles')
  const [ripples,   setRipples]   = useState<{ id: number; x: number; y: number }[]>([])
  const [tapPoint,  setTapPoint]  = useState<{ x: number; y: number; id: number } | null>(null)
  const nextId = useCallback(() => Date.now() + Math.random(), [])

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? e.changedTouches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    const id = nextId()
    setRipples(prev => [...prev, { id, x, y }])
    setTapPoint({ x, y, id })
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
      setTapPoint(null)
    }, 950)
  }, [nextId])

  return (
    <section style={{ paddingTop: 0 }}>
      <div style={{ width: '100%' }}>
        <div
          className="dot-grid hero-animated-bg"
          onClick={handleTap}
          onTouchStart={handleTap}
          style={{
            position: 'relative', overflow: 'hidden',
            isolation: 'isolate',
            cursor: 'default',
            padding: '100px 0px 0',
          }}
        >
          {/* Ripples — detrás de todo el contenido */}
          {ripples.map(r => (
            <span
              key={r.id}
              className="hero-ripple"
              style={{ left: r.x, top: r.y, zIndex: 0 }}
            />
          ))}

          {/* Partículas flotantes reactivas */}
          {PARTICLES.map((p, i) => {
            let dx = 0, dy = 0
            if (tapPoint) {
              // Vector desde el toque hacia la partícula
              const px = (p.x / 100) * 400  // approx px
              const py = (p.y / 100) * 600
              const vx = px - tapPoint.x
              const vy = py - tapPoint.y
              const dist = Math.sqrt(vx * vx + vy * vy) || 1
              const force = Math.max(0, 1 - dist / 280) * 55
              dx = (vx / dist) * force
              dy = (vy / dist) * force
            }
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 3 === 0 ? 3 : 2,
                  borderRadius: '50%',
                  background: i % 4 === 0 ? 'rgba(255,106,0,0.55)' : 'rgba(255,255,255,0.2)',
                  pointerEvents: 'none',
                  zIndex: 1,
                  transform: `translate(${dx}px, ${dy}px)`,
                  transition: tapPoint
                    ? 'transform 0.6s cubic-bezier(0.22,1,0.36,1)'
                    : 'transform 1s cubic-bezier(0.22,1,0.36,1)',
                  boxShadow: i % 4 === 0 ? '0 0 6px rgba(255,106,0,0.4)' : 'none',
                }}
              />
            )
          })}
          {/* bottom fade radial */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,0.6), transparent 60%)', pointerEvents: 'none', zIndex: 1 }}/>
          {/* bottom gradient fade — blends hero into page background (BLOQUE C) */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to bottom, transparent, var(--bg-0))', pointerEvents: 'none', zIndex: 2 }}/>

          {/* Photo */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <div style={{
              width: '100%', maxWidth: 340, marginLeft: '4%',
              WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 108%)',
              maskImage:        'linear-gradient(to bottom, black 50%, transparent 108%)',
            }}>
              <img
                src="/daniel.png"
                alt="Daniel Quintana — Estratega Digital & Comercial"
                style={{
                  width: '100%', display: 'block',
                  objectFit: 'contain', objectPosition: 'top center',
                  mixBlendMode: 'screen',
                  filter: 'contrast(1.05) brightness(1.02)',
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div style={{
            position: 'relative', zIndex: 3,
            textAlign: 'center',
            marginTop: -40,
            padding: '0 20px',
          }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(10px, 7vw, 90px)',
              lineHeight: 0.9, letterSpacing: '-0.04em',
              textShadow: '0 2px 20px rgba(0,0,0,0.92), 0 6px 40px rgba(0,0,0,0.65)',
            }}>
              Estratega<br/>
              <span style={{ letterSpacing: '0em' }}>Digital</span>{' '}
              <span style={{ fontStyle: 'italic', fontWeight: 400, fontFamily: '"Georgia", "Times New Roman", serif', color: 'var(--orange-1)', letterSpacing: '-0.02em', fontSize: '0.85em' }}>&amp;</span>
              <br/>Comercial
            </h1>
          </div>

          {/* Buttons — centered, compact, same width */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 42, width: '100%', maxWidth: 270,
              borderRadius: 'var(--r-pill)',
              background: 'var(--orange-1)', color: '#fff',
              fontWeight: 600, fontSize: 13, letterSpacing: '-0.005em',
              boxShadow: '0 8px 24px -6px rgba(255,90,31,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              whiteSpace: 'nowrap',
            }}>
              <WhatsAppIcon size={14}/> Quiero vender mejor
            </a>
            <a href="#selector" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 42, width: '100%', maxWidth: 270,
              borderRadius: 'var(--r-pill)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'var(--fg-0)', fontWeight: 600, fontSize: 13,
              whiteSpace: 'nowrap',
            }}>
              Ver servicios
            </a>
            {/* Urgency badge — below buttons (BLOQUE D) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '5px 12px 5px 9px',
                border: '1px solid rgba(255,196,0,0.3)',
                borderRadius: 'var(--r-pill)',
                background: 'rgba(255,196,0,0.07)',
                backdropFilter: 'blur(8px)',
                fontSize: 11, color: '#FFC400', fontWeight: 600,
              }}>
                <span style={{ width: 5, height: 5, background: '#FFC400', borderRadius: '50%', boxShadow: '0 0 8px rgba(255,196,0,.6)', flexShrink: 0 }}/>
                {heroBadge}
              </span>
            </div>
          </div>

          {/* Fade testimonials */}
          <FadeTestimonials />
        </div>
      </div>
    </section>
  )
}

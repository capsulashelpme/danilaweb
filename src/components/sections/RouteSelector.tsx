import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

// ── SVG Icons ─────────────────────────────────────────────────
const IconCheck = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5L20 7"/>
  </svg>
)

// Plan-specific icons (professional, no emoji)
const IconAds = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11v2h3l5 4V7L6 11H3z"/>
    <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
    <path d="M18.5 5.5a9 9 0 0 1 0 13"/>
  </svg>
)

const IconOrganic = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
)

const IconWeb = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
)

const IconGift = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
)

const IconArrowRight = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
)

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)

// ── Plans data ────────────────────────────────────────────────
export interface Plan {
  id: 'ads' | 'organico' | 'web'
  label: string
  tagline: string
  price: string          // current price raw number for display
  priceDisplay: string   // "$X,XXX MXN"
  priceOld: string       // "$X,XXX MXN" struck through
  priceNote: string
  discount: string
  accentColor: string
  Icon: ({ size }: { size?: number }) => React.ReactElement
  plan: {
    headline: string
    subhead: string
    items: string[]
    ctaLabel: string
  }
}

export const PLANS: Plan[] = [
  {
    id: 'ads',
    label: 'Quiero vender más',
    tagline: 'Llega a clientes listos para comprar',
    price: '3,990',
    priceDisplay: '$3,990 MXN',
    priceOld: '$4,990 MXN',
    priceNote: 'mensual',
    discount: '-20% OFF',
    accentColor: '#FF5A1F',
    Icon: IconAds,
    plan: {
      headline: 'Plan Publicidad Pagada',
      subhead: 'Campañas de Meta Ads diseñadas para generar ventas reales, no solo likes.',
      items: [
        '5 campañas publicitarias al mes',
        '30–50 creativos por campaña (video, foto o diseño)',
        'Planificación estratégica de contenido pagado',
        'Optimización de perfiles para convertir',
        'Manejo completo de Meta Ads',
        'Reportes de estadísticas en tiempo real',
        'Optimización continua de anuncios',
        '+ Inversión publicitaria a cargo del cliente',
      ],
      ctaLabel: 'Quiero este plan',
    },
  },
  {
    id: 'organico',
    label: 'Quiero crecer en redes',
    tagline: 'Construye autoridad sin pagar por cada clic',
    price: '5,990',
    priceDisplay: '$5,990 MXN',
    priceOld: '$6,990 MXN',
    priceNote: 'mensual',
    discount: '-14% OFF',
    accentColor: '#9B7FFF',
    Icon: IconOrganic,
    plan: {
      headline: 'Plan Estrategia Orgánica',
      subhead: 'Contenido diario con objetivo comercial claro — no publicar por publicar.',
      items: [
        '1 a 3 videos diarios en redes sociales',
        'Contenido short form optimizado para alcance',
        'Diseño gráfico para redes sociales',
        'Hasta 2 sesiones de grabación al mes',
        'Arquitectura de contenido personalizada',
        'Gestión completa de redes sociales',
        'Estrategia de conversión por plataforma',
        'Gestión de interacción con tu comunidad',
        'Reportes de estadísticas en tiempo real',
        'Optimización mensual de contenido',
      ],
      ctaLabel: 'Quiero este plan',
    },
  },
  {
    id: 'web',
    label: 'Quiero una página web',
    tagline: 'Tu negocio visible y vendiendo las 24 hrs',
    price: '3,990',
    priceDisplay: '$3,990 MXN',
    priceOld: '$4,990 MXN',
    priceNote: 'proyecto único',
    discount: '-20% OFF',
    accentColor: '#2ECC71',
    Icon: IconWeb,
    plan: {
      headline: 'Plan Página Web',
      subhead: 'Una web diseñada para convertir visitas en clientes reales.',
      items: [
        'Diseño mobile-first y carga ultrarrápida',
        'Estructura enfocada en conversión',
        'WhatsApp y formulario integrados',
        'Catálogo digital de productos (opcional)',
        'Fichas de productos con categorías',
        'Flujo sencillo para recibir pedidos',
        'Configuración de pagos en línea',
        'Panel para revisar pedidos y estadísticas',
        'Entrega en 7 días hábiles',
      ],
      ctaLabel: 'Quiero este plan',
    },
  },
]

// ── Plan drawer ───────────────────────────────────────────────
function PlanDrawer({ activeId, onClose }: { activeId: Plan['id'] | null; onClose: () => void }) {
  const isOpen = !!activeId
  const plan = PLANS.find(p => p.id === activeId)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Limpiar error cuando se cambia de plan o se cierra
  useEffect(() => { setCheckoutError(null) }, [activeId])

  const handleCheckout = async () => {
    if (!activeId || checkoutLoading) return
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Usuario no autenticado → redirigir al login
        window.location.href = '/login'
        return
      }
      const res = await supabase.functions.invoke('create-checkout', {
        body: { plan: activeId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.data?.url) {
        window.location.href = res.data.url
      } else {
        setCheckoutError('No pudimos iniciar el pago. Intenta de nuevo.')
      }
    } catch {
      setCheckoutError('No pudimos iniciar el pago. Intenta de nuevo.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: isOpen ? 'auto' : 'none' }}>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(6px)',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity .3s ease',
        }}
      />

      <AnimatePresence>
        {isOpen && plan && (
          <motion.div
            key="plan-drawer"
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={(_, info) => { if (info.offset.y > 90) onClose() }}
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              background: `
                radial-gradient(80% 50% at 100% 0%, ${plan.accentColor}18, transparent 60%),
                linear-gradient(180deg, #161006 0%, #0a0704 100%)
              `,
              borderTop: `1px solid ${plan.accentColor}40`,
              borderLeft: `1px solid ${plan.accentColor}40`,
              borderRight: `1px solid ${plan.accentColor}40`,
              borderBottom: 'none',
              borderRadius: '28px 28px 0 0',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 -24px 64px -12px rgba(0,0,0,0.7), 0 -4px 32px -8px ${plan.accentColor}28`,
            }}
          >
            {/* Drag handle */}
            <div style={{ padding: '12px 22px 0', flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.18)', margin: '0 auto', cursor: 'grab' }} />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                position: 'absolute', top: 10, right: 12,
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'grid', placeItems: 'center',
                color: 'var(--fg-2)', cursor: 'pointer', zIndex: 10,
              }}
            >
              <IconClose />
            </button>

            {/* Scrollable content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 22px',
              paddingBottom: 20,
              WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
            }}>
              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                {/* Plan badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '4px 12px',
                  borderRadius: 'var(--r-pill)',
                  background: `${plan.accentColor}18`,
                  border: `1px solid ${plan.accentColor}40`,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: plan.accentColor,
                  marginBottom: 14,
                }}>
                  <span style={{ color: plan.accentColor, display: 'flex' }}>
                    <plan.Icon size={14} />
                  </span>
                  Plan mensual
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(24px, 5vw, 32px)',
                  letterSpacing: '-0.03em', lineHeight: 1.0,
                  marginBottom: 8,
                }}>
                  {plan.plan.headline}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55 }}>
                  {plan.plan.subhead}
                </p>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />

              {/* Items label */}
              <div style={{ fontSize: 10.5, letterSpacing: '0.13em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--fg-4)', marginBottom: 12 }}>
                Qué incluye
              </div>

              {/* Items */}
              <ul style={{ listStyle: 'none', display: 'grid', gap: 8, marginBottom: 20 }}>
                {plan.plan.items.map((item, i) => {
                  const isNote = item.startsWith('+')
                  return (
                  <li
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 13px',
                      background: isNote ? 'rgba(255,90,31,0.07)' : 'rgba(255,255,255,0.04)',
                      border: isNote
                        ? '1px solid rgba(255,90,31,0.18)'
                        : '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 'var(--r-md)',
                      fontSize: isNote ? 12.5 : 13.5,
                      color: 'var(--fg-1)',
                      fontWeight: isNote ? 400 : 500,
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ color: isNote ? 'var(--fg-2)' : plan.accentColor, flexShrink: 0, marginTop: 2 }}>
                      {isNote ? '＊' : <IconCheck />}
                    </span>
                    {isNote ? item.slice(2).trim() : item}
                  </li>
                  )
                })}
              </ul>

            </div>

            {/* ── Sticky bottom: precio + incluido + CTA ── */}
            <div style={{
              position: 'sticky',
              bottom: 0,
              flexShrink: 0,
              padding: '0 22px 32px',
              background: `linear-gradient(180deg, transparent 0%, #0a0704 22%)`,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              {/* Precio */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 4px 0',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>
                    Inversión {plan.priceNote}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                      {plan.priceOld}
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 6px', borderRadius: 4,
                      background: 'var(--orange-1)',
                      fontSize: 8.5, fontWeight: 800,
                      color: '#fff', letterSpacing: '0.04em',
                      lineHeight: 1.5, whiteSpace: 'nowrap',
                    }}>
                      {plan.discount}
                    </span>
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(26px, 5vw, 34px)',
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  lineHeight: 1,
                }}>
                  {plan.priceDisplay}
                </div>
              </div>

              {/* Incluido gratis — compacto */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 11,
                padding: '12px 14px',
                background: 'rgba(46,204,113,0.07)',
                border: '1px solid rgba(46,204,113,0.2)',
                borderRadius: 12,
              }}>
                <span style={{ color: '#2ECC71', flexShrink: 0, marginTop: 1 }}>
                  <IconGift size={14} />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#2ECC71', letterSpacing: '0.07em', textTransform: 'uppercase', lineHeight: 1 }}>
                    Incluye gratis
                  </span>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                    {plan.id === 'web' ? '60 días de soporte gratis.' : 'Asesoría 30 días + Rebranding de negocio.'}
                  </span>
                </div>
              </div>

              {/* Soporte opcional — solo plan web */}
              {plan.id === 'web' && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 9,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
                      Soporte mensual
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Opcional
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                    $690<span style={{ fontSize: 10, fontWeight: 400 }}> MXN/mes</span>
                  </span>
                </div>
              )}

              {/* Error de checkout */}
              {checkoutError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(255,60,60,0.1)',
                  border: '1px solid rgba(255,60,60,0.25)',
                  fontSize: 13, color: '#ff7070', textAlign: 'center', lineHeight: 1.4,
                }}>
                  {checkoutError}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', height: 52,
                  borderRadius: 'var(--r-pill)',
                  background: checkoutLoading ? 'rgba(255,255,255,0.7)' : '#ffffff',
                  color: '#0a0a0a',
                  fontWeight: 700, fontSize: 15.5,
                  fontFamily: 'var(--font-body)',
                  boxShadow: '0 8px 24px -6px rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: checkoutLoading ? 'default' : 'pointer',
                  transition: 'opacity .15s, background .15s',
                  opacity: checkoutLoading ? 0.75 : 1,
                }}
              >
                {checkoutLoading ? 'Iniciando pago…' : `${plan.plan.ctaLabel} →`}
              </button>
              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '6px 0', fontSize: 13,
                  color: 'var(--fg-3)', fontWeight: 500, cursor: 'pointer',
                  textAlign: 'center', background: 'none', border: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Ver otras opciones
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Animated orange-black gradient keyframes for "ads" card
const ADS_GRADIENT_STYLE = `
@keyframes adsGradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.ads-card-bg {
  background: linear-gradient(135deg, #0e0e0e 0%, #1c0d04 30%, #2a1208 50%, #1c0d04 70%, #0e0e0e 100%);
  background-size: 300% 300%;
  animation: adsGradientShift 8s ease infinite;
}
@property --ba {
  syntax: '<angle>';
  initial-value: 135deg;
  inherits: false;
}
@keyframes lightOrbit {
  0%   { --ba: 135deg; }
  100% { --ba: 495deg; }
}
.ads-border-wrap {
  --ba: 135deg;
  padding: 1.2px;
  border-radius: 22px;
  background: conic-gradient(from var(--ba) at 50% 50%,
    rgba(30,10,2,0.9)       0deg,
    rgba(30,10,2,0.9)       100deg,
    rgba(120,55,15,0.7)     140deg,
    rgba(200,110,40,0.75)   165deg,
    rgba(255,200,130,0.95)  180deg,
    rgba(200,110,40,0.75)   195deg,
    rgba(120,55,15,0.7)     220deg,
    rgba(30,10,2,0.9)       260deg,
    rgba(30,10,2,0.9)       360deg
  );
  animation: lightOrbit 14s linear infinite;
  box-shadow: 0 0 14px -6px rgba(255,100,40,0.18);
}
`

// ── Goal card ─────────────────────────────────────────────────
function GoalCard({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const isAds = plan.id === 'ads'

  const inner = (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={isAds ? 'ads-card-bg' : undefined}
        style={{
          display: 'flex', flexDirection: 'column',
          padding: '16px 16px 14px',
          borderRadius: isAds ? 21 : 'var(--r-xl)',
          background: isAds ? undefined : (hovered ? 'var(--bg-3)' : 'var(--bg-2)'),
          border: isAds ? 'none' : (hovered ? '1px solid rgba(255,90,31,0.45)' : '1px solid rgba(255,255,255,0.07)'),
          boxShadow: hovered && !isAds ? '0 0 28px -8px rgba(255,90,31,0.3)' : 'none',
          transition: 'border-color .18s, box-shadow .18s',
          cursor: 'pointer', fontFamily: 'var(--font-body)',
          textAlign: 'left', width: '100%',
          position: 'relative', overflow: 'hidden',
          gap: 0,
        }}
      >
        {/* glow hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(70% 70% at 0% 100%, rgba(255,90,31,0.06), transparent)',
          opacity: hovered ? 1 : 0, transition: 'opacity .25s', pointerEvents: 'none',
        }} />

        {/* ══ FILA SUPERIOR: ícono + título/subtítulo + badge TOP RIGHT ══ */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', gap: 12,
          paddingBottom: 14,
        }}>

          {/* Ícono */}
          <div style={{
            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
            background: 'var(--orange-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px -4px rgba(255,90,31,0.5)',
          }}>
            <plan.Icon size={20} />
          </div>

          {/* Título + subtítulo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(13px, 1.6vw, 16px)',
              letterSpacing: '-0.02em', lineHeight: 1.15,
              color: '#FFFFFF',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {plan.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.4, fontWeight: 500 }}>
              {plan.tagline}
            </div>
          </div>

          {/* Badge descuento — top right, next to title */}
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 7px', borderRadius: 5,
            background: 'var(--orange-1)',
            fontSize: 8.5, fontWeight: 800,
            color: '#fff', letterSpacing: '0.04em',
            lineHeight: 1.5, whiteSpace: 'nowrap',
            flexShrink: 0, alignSelf: 'flex-start',
          }}>
            {plan.discount}
          </span>
        </div>

        {/* ══ DIVISOR ══ */}
        <div style={{ position: 'relative', zIndex: 1, height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 12 }} />

        {/* ══ FILA INFERIOR: precios izq + flecha der ══ */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', gap: 8,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 10, color: 'var(--fg-4)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
              {plan.priceOld}
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              color: '#FFFFFF', letterSpacing: '-0.025em', lineHeight: 1,
            }}>
              {plan.priceDisplay}
            </span>
          </div>

          {/* botón flecha */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: hovered ? 'var(--orange-1)' : 'rgba(255,255,255,0.07)',
            border: hovered ? 'none' : '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .2s, border-color .2s',
            color: hovered ? '#fff' : 'var(--fg-3)',
          }}>
            <IconArrowRight />
          </div>
        </div>
      </button>
  )

  return (
    <>
      {isAds && <style>{ADS_GRADIENT_STYLE}</style>}
      {isAds
        ? <div className="ads-border-wrap" style={{ width: '100%' }}>{inner}</div>
        : inner
      }
    </>
  )
}

// ── Main export ───────────────────────────────────────────────
export function RouteSelector({ drawerId, setDrawerId }: {
  drawerId: string | null
  setDrawerId: (id: string | null) => void
}) {
  return (
    <>
      <section id="selector" style={{ padding: '40px 0 60px' }}>
        <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>

          {/* Header */}
          <div className="reveal" style={{ textAlign: 'center' }}>
            <span className="eyebrow">Elige tu ruta</span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 60px)',
              lineHeight: 1.0, letterSpacing: '-0.025em',
              maxWidth: '20ch', margin: '16px auto 0',
            }}>
              ¿Qué necesitas{' '}
              <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontWeight: 400, color: 'var(--orange-1)' }}>
                resolver primero
              </em>?
            </h2>
            <p style={{
              fontSize: 'clamp(15px,1.4vw,17px)',
              color: 'var(--fg-2)', maxWidth: '46ch',
              lineHeight: 1.55, margin: '16px auto 0',
            }}>
              Elige lo que más te urge y te muestro exactamente el plan para lograrlo.
            </p>
          </div>

          {/* 3 goal cards */}
          <div
            className="reveal goal-grid"
            style={{
              marginTop: 36,
              display: 'grid',
              gap: 14,
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
          >
            {PLANS.map(plan => (
              <GoalCard
                key={plan.id}
                plan={plan}
                onClick={() => setDrawerId(plan.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Plan drawer */}
      <PlanDrawer
        activeId={drawerId as Plan['id'] | null}
        onClose={() => setDrawerId(null)}
      />
    </>
  )
}

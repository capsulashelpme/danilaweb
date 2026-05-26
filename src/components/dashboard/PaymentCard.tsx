import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'

type ManualStatus = 'paid_monthly' | 'paid_annual' | null | undefined

// ── Full-screen redirect overlay ───────────────────────────────
function RedirectOverlay({ plan }: { plan: 'monthly' | 'annual' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20,
      animation: 'co-fade-in .2s cubic-bezier(.22,1,.36,1) both',
    }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <svg viewBox="0 0 56 56" width="56" height="56" style={{ position: 'absolute', inset: 0, animation: 'co-spin 1s linear infinite' }}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5"/>
          <circle cx="28" cy="28" r="24" fill="none"
            stroke={plan === 'annual' ? '#34C759' : 'rgba(255,255,255,0.6)'}
            strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray="150.8" strokeDashoffset="113.1"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={plan === 'annual' ? '#34C759' : 'rgba(255,255,255,0.7)'} strokeWidth="1.8" strokeLinecap="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 5 }}>Preparando tu pago</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Plan {plan === 'annual' ? 'anual' : 'mensual'} · Redirigiendo a Stripe…
        </div>
      </div>
      <style>{`
        @keyframes co-fade-in { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:none} }
        @keyframes co-spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}

const fxMXN = (pesos: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(pesos)

const fx = (cents: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(cents / 100)

function PaymentHistory({ payments }: { payments: { id: string; plan: string | null; created_at: string; amount: number; status: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {payments.map(p => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.025)', borderRadius: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{p.plan === 'annual' ? 'Pago anual' : 'Pago mensual'}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{new Date(p.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: p.status === 'succeeded' ? '#34C759' : '#FF3B30' }}>{fx(p.amount)}</div>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.status === 'succeeded' ? 'Pagado' : p.status === 'failed' ? 'Fallido' : 'Pendiente'}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Card mensual — vertical, uniforme ─────────────────────────
function MonthlyCard({ onCheckout, paying, active }: { onCheckout: () => void; paying: boolean; active?: boolean }) {
  return (
    <button
      onClick={onCheckout}
      disabled={paying}
      style={{
        borderRadius: 18,
        background: 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.09)'}`,
        color: '#fff',
        padding: '20px 16px 18px',
        cursor: paying ? 'wait' : 'pointer',
        opacity: paying ? 0.55 : 1,
        transition: 'border-color .18s, background .18s',
        fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: 130,
      } as React.CSSProperties}
      onMouseEnter={e => { if (!paying) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.background = 'rgba(255,255,255,0.065)' }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
    >
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 12 }}>
        Mensual
      </span>
      <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff', marginBottom: 'auto' }}>
        {fxMXN(3990)}
      </span>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.28)', marginTop: 10 }}>
        por mes
      </span>
    </button>
  )
}

// ── Card anual — vertical, verde, uniforme ────────────────────
function AnnualCard({ onCheckout, paying, active }: { onCheckout: () => void; paying: boolean; active?: boolean }) {
  return (
    <button
      onClick={onCheckout}
      disabled={paying}
      style={{
        borderRadius: 18,
        background: 'linear-gradient(150deg, rgba(24,40,26,0.98) 0%, rgba(14,26,18,0.98) 100%)',
        border: `1.5px solid ${active ? 'rgba(52,199,89,0.38)' : 'rgba(52,199,89,0.2)'}`,
        color: '#fff',
        padding: '20px 16px 18px',
        cursor: paying ? 'wait' : 'pointer',
        opacity: paying ? 0.55 : 1,
        transition: 'border-color .18s, background .18s',
        fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 130,
      } as React.CSSProperties}
      onMouseEnter={e => { if (!paying) { e.currentTarget.style.borderColor = 'rgba(52,199,89,0.45)'; e.currentTarget.style.background = 'linear-gradient(150deg, rgba(28,48,30,0.98) 0%, rgba(16,32,20,0.98) 100%)' }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = active ? 'rgba(52,199,89,0.38)' : 'rgba(52,199,89,0.2)'; e.currentTarget.style.background = 'linear-gradient(150deg, rgba(24,40,26,0.98) 0%, rgba(14,26,18,0.98) 100%)' }}
    >
      {/* Badge −37% arriba-derecha */}
      <div style={{
        position: 'absolute', top: 11, right: 11,
        fontSize: 9.5, fontWeight: 700, letterSpacing: '0.03em',
        padding: '3px 8px', borderRadius: 100,
        background: 'rgba(52,199,89,0.13)',
        border: '1px solid rgba(52,199,89,0.28)',
        color: '#34C759',
      }}>
        −37%
      </div>

      {/* Label */}
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(52,199,89,0.65)', marginBottom: 12 }}>
        Anual
      </span>

      {/* Precio */}
      <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff', marginBottom: 5 }}>
        {fxMXN(29990)}
      </span>

      {/* Tachado */}
      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through', marginBottom: 'auto' }}>
        {fxMXN(47880)}
      </span>

      {/* Ahorro */}
      <span style={{ fontSize: 10.5, color: 'rgba(52,199,89,0.75)', fontWeight: 600, marginTop: 10 }}>
        Ahorra {fxMXN(47880 - 29990)}/año
      </span>
    </button>
  )
}

// ── Botón anual horizontal (estado: mensual activo → upgrade) ──
// Aparece solo, ancho completo, con imagen promo
function AnnualButton({ onCheckout, paying }: { onCheckout: () => void; paying: boolean }) {
  return (
    <button
      onClick={onCheckout}
      disabled={paying}
      style={{
        width: '100%',
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(28,38,28,0.97) 0%, rgba(18,28,20,0.97) 100%)',
        border: '1px solid rgba(52,199,89,0.18)',
        color: '#fff',
        padding: '14px 14px',
        cursor: paying ? 'wait' : 'pointer',
        opacity: paying ? 0.6 : 1,
        transition: 'all .18s',
        fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 14,
        textAlign: 'left' as const,
        boxShadow: '0 2px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        boxSizing: 'border-box' as const,
      }}
      onMouseEnter={e => { if (!paying) { e.currentTarget.style.border = '1px solid rgba(52,199,89,0.35)'; e.currentTarget.style.boxShadow = '0 4px 28px rgba(52,199,89,0.1), inset 0 1px 0 rgba(255,255,255,0.07)' }}}
      onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(52,199,89,0.18)'; e.currentTarget.style.boxShadow = '0 2px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)' }}
    >
      {/* Imagen promo */}
      <div style={{
        width: 56, height: 56, borderRadius: 14, flexShrink: 0,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(52,199,89,0.15) 0%, rgba(20,80,40,0.3) 100%)',
        border: '1px solid rgba(52,199,89,0.2)',
        display: 'grid', placeItems: 'center',
      }}>
        <img
          src="/annual-promo.png"
          alt="Plan anual"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 13 }}
          onError={e => {
            const el = e.currentTarget as HTMLImageElement
            el.style.display = 'none'
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            svg.setAttribute('width', '24'); svg.setAttribute('height', '24')
            svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none')
            svg.setAttribute('stroke', '#34C759'); svg.setAttribute('stroke-width', '2')
            svg.setAttribute('stroke-linecap', 'round')
            const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
            p1.setAttribute('points', '23 6 13.5 15.5 8.5 10.5 1 18')
            const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
            p2.setAttribute('points', '17 6 23 6 23 12')
            svg.appendChild(p1); svg.appendChild(p2)
            el.parentElement?.appendChild(svg)
          }}
        />
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 3, lineHeight: 1.2 }}>
          Plan Anual · {fxMXN(29990)}
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>
          <span style={{ textDecoration: 'line-through', marginRight: 4 }}>{fxMXN(47880)}</span>
          · Ahorra {fxMXN(47880 - 29990)} al año
        </div>
      </div>

      {/* Badge −37% OFF */}
      <div style={{
        flexShrink: 0, fontSize: 11, fontWeight: 700,
        padding: '5px 9px', borderRadius: 100,
        background: 'rgba(52,199,89,0.12)',
        border: '1px solid rgba(52,199,89,0.28)',
        color: '#34C759',
      }}>
        −37% OFF
      </div>
    </button>
  )
}

// ── Componente principal ───────────────────────────────────────
export function PaymentCard({
  manualStatus,
  serviceLeft,
  unpaid = false,
}: {
  manualStatus?: ManualStatus
  serviceLeft?: number | null
  unpaid?: boolean
}) {
  const { subscription, payments, loading, checkout, isActive, isPastDue } = useSubscription()
  const [paying, setPaying] = useState<'monthly' | 'annual' | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const handleCheckout = (plan: 'monthly' | 'annual') => {
    if (paying) return
    setPaying(plan)
    checkout(plan).finally(() => setPaying(null))
  }

  if (loading) return null
  if (paying) return <RedirectOverlay plan={paying} />

  // ── Estado efectivo: manual tiene prioridad, luego Stripe ──────
  const stripePlan    = isActive ? subscription?.plan : null
  const effectivePlan =
    manualStatus === 'paid_annual'  ? 'annual'
    : manualStatus === 'paid_monthly' ? 'monthly'
    : stripePlan === 'annual'         ? 'annual'
    : stripePlan === 'monthly'        ? 'monthly'
    : null

  // Mostrar opciones completas cuando: sin plan activo, ≤5 días para vencer, o vencido
  const nearExpiry  = serviceLeft !== null && serviceLeft !== undefined && serviceLeft <= 5
  const showOptions = !effectivePlan || nearExpiry || isPastDue

  // ── Plan anual activo: nada que mostrar, dashboard limpio ────────
  if (effectivePlan === 'annual' && !showOptions) {
    // Solo muestra historial si hay pagos (discreto, colapsado)
    if (payments.length === 0) return null
    return (
      <button onClick={() => setShowHistory(v => !v)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', fontSize: 11, cursor: 'pointer', textAlign: 'center', padding: 0, fontFamily: 'inherit', width: '100%' }}>
        {showHistory ? 'Ocultar historial' : `Ver historial de pagos (${payments.length})`}
        {showHistory && <PaymentHistory payments={payments} />}
      </button>
    )
  }

  // ── Plan mensual activo: solo muestra la opción de upgrade a anual ──
  if (effectivePlan === 'monthly' && !showOptions) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnnualButton onCheckout={() => handleCheckout('annual')} paying={paying !== null} />
        {payments.length > 0 && (
          <button onClick={() => setShowHistory(v => !v)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', fontSize: 11, cursor: 'pointer', textAlign: 'center', padding: 0, fontFamily: 'inherit' }}>
            {showHistory ? 'Ocultar historial' : `Ver historial de pagos (${payments.length})`}
          </button>
        )}
        {showHistory && <PaymentHistory payments={payments} />}
      </div>
    )
  }

  // ── Sin plan o próximo a vencer: ambas cards ──────────────────
  const isExpired  = nearExpiry && serviceLeft! <= 0
  const isExpiring = nearExpiry && serviceLeft! > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Encabezado ── */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 2, letterSpacing: '-0.01em' }}>
          Elige tu plan
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Cancela cuando quieras.
        </div>
      </div>

      {/* ── Aviso comercial — aparece cuando admin marca sin pago ── */}
      {(unpaid || isExpired || isExpiring || isPastDue) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '11px 13px',
          borderRadius: 13,
          background: isExpired
            ? 'rgba(255,59,48,0.07)'
            : 'rgba(255,159,10,0.07)',
          border: `1px solid ${isExpired ? 'rgba(255,59,48,0.2)' : 'rgba(255,159,10,0.2)'}`,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={isExpired ? 'rgba(255,59,48,0.8)' : 'rgba(255,159,10,0.85)'}
            strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
            {isExpired
              ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
              : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
            }
          </svg>
          <span style={{
            fontSize: 12.5, fontWeight: 600, lineHeight: 1.5,
            color: isExpired ? 'rgba(255,100,90,0.9)' : 'rgba(255,185,70,0.9)',
          }}>
            {isExpired
              ? 'Tu servicio ha vencido. Elige un plan para continuar.'
              : isExpiring
                ? `Quedan ${serviceLeft} día${serviceLeft !== 1 ? 's' : ''} de servicio. Renueva ahora.`
                : isPastDue
                  ? 'Tu suscripción tiene un pago pendiente.'
                  : 'Tu servicio está pausado. Selecciona un plan para mantenerlo activo.'}
          </span>
        </div>
      )}

      {/* ── Grid de cards — ambas iguales ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'stretch' }}>
        <MonthlyCard
          onCheckout={() => handleCheckout('monthly')}
          paying={paying !== null}
          active={paying === 'monthly'}
        />
        <AnnualCard
          onCheckout={() => handleCheckout('annual')}
          paying={paying !== null}
          active={paying === 'annual'}
        />
      </div>

      {/* ── Historial ── */}
      {payments.length > 0 && (
        <button
          onClick={() => setShowHistory(v => !v)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.18)', fontSize: 11, cursor: 'pointer', textAlign: 'center', padding: 0, fontFamily: 'inherit' }}
        >
          {showHistory ? 'Ocultar historial' : `Ver historial de pagos (${payments.length})`}
        </button>
      )}
      {showHistory && <PaymentHistory payments={payments} />}
    </div>
  )
}

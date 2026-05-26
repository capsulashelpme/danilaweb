import { useState } from 'react'

// Mini sparkline bar chart (simulated trend)
const TrendBars = ({ values, color = 'var(--orange-1)' }: { values: number[]; color?: string }) => {
  const max = Math.max(...values)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            borderRadius: 3,
            background: i === values.length - 1 ? color : `${color}55`,
            transition: 'height .3s',
          }}
        />
      ))}
    </div>
  )
}

const METRICS = [
  {
    label: 'Ventas',
    value: '$12,800 MXN',
    delta: '+22%',
    deltaUp: true,
    color: '#2ECC71',
    bars: [60, 72, 68, 80, 90, 85, 100],
    humanLabel: 'Lo que entraste este mes',
    detail: 'Ingresos totales registrados en el período seleccionado, comparado con el mes anterior.',
  },
  {
    label: 'Mensajes',
    value: '184',
    delta: '+28%',
    deltaUp: true,
    color: 'var(--orange-1)',
    bars: [40, 55, 50, 70, 80, 76, 100],
    humanLabel: 'Personas que te contactaron',
    detail: 'Total de leads que iniciaron contacto vía WhatsApp o formulario durante este período.',
  },
  {
    label: 'Inversión',
    value: '$900 MXN',
    delta: '-12%',
    deltaUp: false,
    color: '#5B9EFF',
    bars: [80, 90, 85, 88, 82, 79, 76],
    humanLabel: 'Lo que gastaste en anuncios',
    detail: 'Gasto total en pauta de Meta Ads. La reducción refleja optimización de audiencias.',
  },
  {
    label: 'Ganancia',
    value: '$11,900 MXN',
    delta: '+31%',
    deltaUp: true,
    color: '#C5A3FF',
    bars: [50, 60, 65, 72, 78, 85, 100],
    humanLabel: 'Lo que te quedó limpio',
    detail: 'Ganancia neta estimada descontando inversión publicitaria y costos operativos registrados.',
  },
]

// Meta logo icon (simplified)
const MetaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 14.5c-1.5 0-2.5-1-2.5-2.5S9 11.5 10.5 11.5c.8 0 1.5.4 2 1 .5-.6 1.2-1 2-1 1.5 0 2.5 1 2.5 2.5S16 16.5 14.5 16.5c-.8 0-1.5-.4-2-1-.5.6-1.2 1-2 1z"/>
  </svg>
)

export function DashboardPreview() {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

  return (
    <section id="dashboard" style={{ padding: '48px 0 72px' }}>
      <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>

        {/* Section header — centered */}
        <div className="reveal" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Tu panel de cliente</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(32px,5vw,60px)', lineHeight: 1.0,
            letterSpacing: '-0.025em', marginTop: 16,
          }}>
            Tus números, claros y en{' '}
            <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontWeight: 400, color: 'var(--orange-1)' }}>
              tiempo real
            </em>.
          </h2>
          <p style={{ marginTop: 18, fontSize: 'clamp(15px,1.4vw,17px)', color: 'var(--fg-2)', maxWidth: '54ch', lineHeight: 1.55, margin: '18px auto 0', padding: '0 16px' }}>
            Cada cliente tiene su propio panel: ventas, mensajes, inversión y ganancia. Todo en un solo lugar.
          </p>
        </div>

        {/* Dashboard card */}
        <div className="reveal" style={{
          marginTop: 40,
          borderRadius: 'var(--r-2xl)',
          background: 'linear-gradient(180deg, #0e0e0e, #050505)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: 12,
          boxShadow: '0 32px 80px -20px rgba(0,0,0,0.6)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* ambient glow */}
          <div style={{ position: 'absolute', top: -160, right: -160, width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,90,31,0.14), transparent 70%)', pointerEvents: 'none' }}/>

          <div style={{
            position: 'relative',
            borderRadius: 'var(--r-xl)',
            background: 'var(--bg-1)',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            padding: '22px 20px',
          }}>
            {/* Client row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--orange-1), #C93A12)', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#fff', fontSize: 13, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <path d="M3 9h18"/><path d="M9 21V9"/>
                  </svg>
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: 14, fontFamily: 'var(--font-display)', letterSpacing: '-.01em' }}>Panel de Cliente</b>
                  <small style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>Mayo 2026 · actualizado ahora</small>
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px',
                borderRadius: 'var(--r-pill)',
                background: 'rgba(46,204,113,0.1)',
                color: '#2ECC71',
                fontSize: 10.5, fontWeight: 600,
              }}>
                <span style={{ width: 6, height: 6, background: '#2ECC71', borderRadius: '50%', boxShadow: '0 0 6px rgba(46,204,113,0.4)' }}/>
                Activo
              </span>
            </div>

            {/* 4 Metric cards — clickable */}
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {METRICS.map((m) => {
                const isExpanded = expandedMetric === m.label
                return (
                  <button
                    key={m.label}
                    onClick={() => setExpandedMetric(isExpanded ? null : m.label)}
                    style={{
                      padding: isExpanded ? '16px 16px 14px' : '16px 16px 14px',
                      borderRadius: 'var(--r-md)',
                      background: isExpanded ? 'rgba(255,90,31,0.07)' : 'var(--bg-2)',
                      border: isExpanded ? '1px solid rgba(255,90,31,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', flexDirection: 'column', gap: 6,
                      minWidth: 0, textAlign: 'left', cursor: 'pointer',
                      transition: 'background .2s, border-color .2s',
                    }}
                  >
                    <span style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>{m.label}</span>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--fg-0)' }}>
                      {m.value}
                    </div>
                    <span style={{ fontSize: 10.5, color: 'var(--fg-3)', lineHeight: 1.3 }}>{m.humanLabel}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600,
                        color: m.deltaUp ? '#2ECC71' : '#E94B4B',
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          {m.deltaUp
                            ? <><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></>
                            : <><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></>
                          }
                        </svg>
                        {m.delta}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>vs. mes anterior</span>
                    </div>
                    <TrendBars values={m.bars} color={m.color}/>
                    {isExpanded && (
                      <p style={{ fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.5, marginTop: 6, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {m.detail}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Meta legend */}
            <div style={{
              marginTop: 18,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ color: 'var(--fg-3)', flexShrink: 0 }}><MetaIcon/></span>
              <p style={{ fontSize: 11.5, color: 'var(--fg-3)', lineHeight: 1.45, margin: 0 }}>
                Este panel se actualiza conforme a las métricas y políticas de Meta.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom activation line */}
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12.5, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
          Tu panel se activa desde el primer día.
        </p>
      </div>
    </section>
  )
}

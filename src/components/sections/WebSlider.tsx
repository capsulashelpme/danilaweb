import { useInfiniteSlider } from '@/hooks/useInfiniteSlider'
import { useMediaAssets } from '@/components/admin/MediaManager'

// ── Tu web lista para vender ──────────────────────────────────
interface WebDemo {
  id: string
  file: string
}

const DEMOS: WebDemo[] = [
  { id: '1', file: '/webs/1.jpeg' },
  { id: '2', file: '/webs/2.jpeg' },
  { id: '3', file: '/webs/3.jpeg' },
  { id: '4', file: '/webs/4.jpeg' },
  { id: '5', file: '/webs/5.jpeg' },
]


function WebCard({ d }: { d: WebDemo }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: 220,
        height: 320,
        flexShrink: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.1)',
        isolation: 'isolate',
        userSelect: 'none',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Browser chrome bar */}
      <div style={{
        height: 26,
        background: 'rgba(20,20,20,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 10px', gap: 5,
        flexShrink: 0, zIndex: 2, position: 'relative',
      }}>
        {['#FF5F57','#FEBC2E','#28C840'].map((c, i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: c, opacity: 0.7 }}/>
        ))}
        <div style={{
          flex: 1, height: 13, borderRadius: 4,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          marginLeft: 4,
        }}/>
      </div>

      {/* Screenshot / video */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {(d.file.includes('.mp4') || d.file.includes('.mov') || d.file.includes('.webm'))
          ? <video src={d.file} autoPlay loop muted playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
          : <img src={d.file} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
        }
      </div>
    </div>
  )
}

export function WebSlider() {
  const trackRef = useInfiniteSlider(0.028)
  const { assets: dbAssets, loaded } = useMediaAssets('diseno_web_desarrollo')

  const useDb   = loaded && dbAssets.length > 0
  const baseWeb = useDb
    ? dbAssets.map(a => ({ id: a.id, file: a.url, type: a.type }))
    : DEMOS.map(d => ({ ...d, type: 'image' as const }))
  const items = [...baseWeb, ...baseWeb, ...baseWeb]

  return (
    <section id="webs" style={{ padding: '72px 0' }}>
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="eyebrow">Diseño Web · Desarrollo</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,5vw,60px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 16 }}>
            Tu web lista para{' '}
            <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontWeight: 400, color: 'var(--orange-1)' }}>
              vender
            </em>.
          </h2>
          <p style={{ marginTop: 16, fontSize: 'clamp(14px,1.3vw,16px)', color: 'var(--fg-2)', maxWidth: '48ch', lineHeight: 1.55, margin: '16px auto 0', padding: '0 16px' }}>
            Sitios modernos, rápidos y pensados para presentar tu negocio, generar confianza y convertir visitas en clientes.
          </p>
        </div>
      </div>

      {/* Full-width slider with edge fade */}
      <div className="reveal" style={{
        width: '100%',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)',
        maskImage: 'linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)',
      }}>
        <div
          ref={trackRef}
          data-slider-track=""
          style={{
            display: 'flex',
            gap: 16,
            padding: '6px 20px 12px',
            overflowX: 'scroll',
            overflowY: 'hidden',
            scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
            cursor: 'grab',
            WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
          }}
        >
          {items.map((d, i) => (
            <WebCard key={`${d.id}-${i}`} d={{ id: d.id, file: d.file }} />
          ))}
        </div>
      </div>

    </section>
  )
}

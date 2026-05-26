import { useInfiniteSlider } from '@/hooks/useInfiniteSlider'
import { useMediaAssets } from '@/components/admin/MediaManager'
import { SliderVideo, SliderImg } from '@/components/ui/SliderMedia'

// ── Creativos locales (fallback si no hay assets en DB) ────────
interface Creative { id: string; file: string; type: 'image' | 'video' }

const CREATIVES: Creative[] = [
  { id: '1', file: '/ads/1.png',  type: 'image' },
  { id: '2', file: '/ads/2.png',  type: 'image' },
  { id: '3', file: '/ads/3.mp4',  type: 'video' },
  { id: '4', file: '/ads/4.mp4',  type: 'video' },
  { id: '5', file: '/ads/5.png',  type: 'image' },
  { id: '6', file: '/ads/6.png',  type: 'image' },
  { id: '7', file: '/ads/7.mp4',  type: 'video' },
  { id: '8', file: '/ads/8.png',  type: 'image' },
  { id: '9', file: '/ads/9.mp4',  type: 'video' },
]

const CARD_STYLE: React.CSSProperties = {
  width: '100%', height: '100%',
  objectFit: 'cover', objectPosition: 'top center', display: 'block',
}

function AdCard({ c }: { c: Creative }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative', width: 260, height: 260, flexShrink: 0,
        borderRadius: 20, overflow: 'hidden',
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.08)',
        userSelect: 'none', pointerEvents: 'none',
      }}
    >
      {c.type === 'video'
        ? <SliderVideo src={c.file} style={CARD_STYLE} />
        : <SliderImg   src={c.file} style={CARD_STYLE} />
      }
    </div>
  )
}

export function CasesSlider() {
  const trackRef = useInfiniteSlider(0.038)
  const { assets: dbAssets, loaded } = useMediaAssets('creativos_publicidad')

  const baseItems: Creative[] = loaded && dbAssets.length > 0
    ? dbAssets
        .filter(a => a.url && a.url.trim() !== '')   // filtrar URLs vacías/nulas
        .map(a => ({ id: a.id, file: a.url, type: a.type as 'image' | 'video' }))
    : CREATIVES
  const items = [...baseItems, ...baseItems, ...baseItems]

  return (
    <section id="casos" style={{ padding: '72px 0' }}>
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="eyebrow">Creativos · Publicidad</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,5vw,60px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 16 }}>
            Anuncios que{' '}
            <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontWeight: 400, color: 'var(--orange-1)' }}>
              venden
            </em>.
          </h2>
          <p style={{ marginTop: 16, fontSize: 'clamp(14px,1.3vw,16px)', color: 'var(--fg-2)', maxWidth: '48ch', lineHeight: 1.55, margin: '16px auto 0', padding: '0 16px' }}>
            Piezas visuales diseñadas para detener el scroll, comunicar rápido y llevar a tus clientes a tomar acción.
          </p>
        </div>
      </div>

      <div className="reveal" style={{
        width: '100%',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)',
        maskImage:        'linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)',
      }}>
        <div ref={trackRef} style={{ display: 'flex', gap: 14, padding: '6px 20px 10px', cursor: 'grab', willChange: 'transform' }}>
          {items.map((c, i) => <AdCard key={`${c.id}-${i}`} c={c} />)}
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <span style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-4)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          ← Desliza para ver más →
        </span>
      </div>
    </section>
  )
}

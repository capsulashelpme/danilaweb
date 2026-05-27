import { useInfiniteSlider } from '@/hooks/useInfiniteSlider'
import { useMediaAssets, type MediaAsset } from '@/components/admin/MediaManager'
import { SliderVideo, SliderImg } from '@/components/ui/SliderMedia'


function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

interface VideoItem {
  id: string
  views: string      // formatted e.g. "2.3M"
  label: string      // short topic label
  bg: string         // gradient background
  accent: string
}

const VIDEOS: VideoItem[] = [
  { id: 'v1', views: '1.8M', label: 'Estrategia de marca',   bg: 'linear-gradient(160deg, #0f0a1a 0%, #1e1030 100%)', accent: '#C5A3FF' },
  { id: 'v2', views: '3.4M', label: 'Error #1 en redes',     bg: 'linear-gradient(160deg, #1a0c04 0%, #2e1a06 100%)', accent: '#FF6A00' },
  { id: 'v3', views: '2.1M', label: 'Cómo vender sin ads',   bg: 'linear-gradient(160deg, #041218 0%, #082030 100%)', accent: '#4A9EFF' },
  { id: 'v4', views: '4.7M', label: 'Tu bio de Instagram',   bg: 'linear-gradient(160deg, #0f1a0a 0%, #1a2e10 100%)', accent: '#6EE07A' },
  { id: 'v5', views: '1.2M', label: 'Hook que para el scroll', bg: 'linear-gradient(160deg, #1a0810 0%, #2e0d1c 100%)', accent: '#FF3B6E' },
  { id: 'v6', views: '2.9M', label: 'Contenido que convierte', bg: 'linear-gradient(160deg, #100f04 0%, #1e1c06 100%)', accent: '#FFC400' },
]

// Play icon SVG
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.14v14l11-7-11-7z"/>
  </svg>
)

// Format views number with abbreviated label
function VideoCard({ v }: { v: VideoItem }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: 160,
        height: 284,   // 9:16 ratio ~ 160 × 284
        flexShrink: 0,
        borderRadius: 16,
        overflow: 'hidden',
        background: v.bg,
        border: `1px solid ${v.accent}22`,
        isolation: 'isolate',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Radial glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 40% at 50% 30%, ${v.accent}18, transparent 70%)`, zIndex: 0 }}/>

      {/* TikTok-style scan lines texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 4px)',
      }}/>

      {/* Center play button */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          display: 'grid', placeItems: 'center',
          color: '#fff',
          backdropFilter: 'blur(4px)',
        }}>
          <PlayIcon />
        </div>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 12, color: 'rgba(255,255,255,0.7)',
          textAlign: 'center', padding: '0 12px',
          lineHeight: 1.3,
        }}>{v.label}</p>
      </div>

      {/* Bottom overlay: views */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
        padding: '32px 12px 12px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
        display: 'flex', alignItems: 'flex-end', gap: 5,
      }}>
        <PlayIcon />
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 13, color: '#fff',
          letterSpacing: '-0.01em',
        }}>{v.views}</span>
      </div>

      {/* TikTok-style right action dots */}
      <div style={{
        position: 'absolute', right: 8, bottom: 60, zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        {[
          <svg key="heart" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
          <svg key="chat" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
          <svg key="share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
        ].map((icon, i) => (
          <div key={i} style={{ color: 'rgba(255,255,255,0.75)', display: 'grid', placeItems: 'center' }}>
            {icon}
          </div>
        ))}
      </div>
    </div>
  )
}

const CARD_STYLE: React.CSSProperties = {
  width: '100%', height: '100%',
  objectFit: 'cover', objectPosition: 'top center', display: 'block',
}

export function VideoSlider() {
  const trackRef = useInfiniteSlider(0.032)
  const { assets: dbAssets, loaded } = useMediaAssets('contenido_organico')

  // Mientras la DB carga: mostrar skeletons en lugar de VideoCard oscuros
  // para evitar el parpadeo entre fallback → contenido real.
  const useDb       = loaded && dbAssets.length > 0
  const useFallback = loaded && dbAssets.length === 0

  const validDb = useDb
    ? dbAssets.filter(a => a.url && a.url.trim() !== '')
    : null

  // Keys estables: sufijo -A/-B/-C en vez de índice numérico.
  // Así un refetch de Supabase que reordene los items NO causa unmount/remount
  // de los SliderVideo, evitando el flash negro al recargar estado.
  const items = validDb
    ? [
        ...validDb.map(a => ({ ...a, _key: `${a.id}-A` })),
        ...validDb.map(a => ({ ...a, _key: `${a.id}-B` })),
        ...validDb.map(a => ({ ...a, _key: `${a.id}-C` })),
      ]
    : useFallback
    ? [...VIDEOS.map(v => ({ ...v, _key: `${v.id}-A` })),
       ...VIDEOS.map(v => ({ ...v, _key: `${v.id}-B` })),
       ...VIDEOS.map(v => ({ ...v, _key: `${v.id}-C` }))]
    : null

  return (
    <section id="contenido" style={{ padding: '72px 0' }}>
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="eyebrow">Contenido Orgánico</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,5vw,60px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 16 }}>
            Contenido para{' '}
            <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontWeight: 400, color: 'var(--orange-1)' }}>
              crecer en redes
            </em>.
          </h2>
          <p style={{ marginTop: 16, fontSize: 'clamp(14px,1.3vw,16px)', color: 'var(--fg-2)', maxWidth: '48ch', lineHeight: 1.55, margin: '16px auto 0', padding: '0 16px' }}>
            Videos cortos y piezas orgánicas pensados para ganar atención, generar confianza y convertir audiencia en oportunidades reales.
          </p>
        </div>
      </div>

      {/* Full-width slider with edge fade */}
      <div className="reveal" style={{
        width: '100%',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)',
        maskImage: 'linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)',
        touchAction: 'pan-y',
      }}>
        <div
          ref={trackRef}
          data-slider-track=""
          style={{
            display: 'flex',
            gap: 14,
            padding: '6px 20px 10px',
            cursor: 'grab',
            willChange: 'transform',
          }}
        >
          {/* Mientras carga la DB: skeletons con shimmer */}
          {!items && Array.from({ length: 18 }).map((_, i) => (
            <div key={`sk-${i}`} aria-hidden="true" style={{
              width: 160, height: 284, flexShrink: 0, borderRadius: 16,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #2c2c2c 0%, #1e1e1e 50%, #2c2c2c 100%)',
              backgroundSize: '200% 100%',
              animation: 'slider-shimmer 1.6s ease infinite',
              border: '1px solid rgba(255,255,255,0.06)',
            }} />
          ))}

          {/* Contenido DB */}
          {useDb && items && (items as (MediaAsset & { _key: string })[]).map((a) => {
            const views = (a as MediaAsset & { views_count?: number }).views_count ?? 0
            return (
              <div key={a._key} aria-hidden="true" style={{
                position: 'relative', width: 160, height: 284, flexShrink: 0,
                borderRadius: 16, overflow: 'hidden', background: '#181818',
                border: '1px solid rgba(255,255,255,0.08)', userSelect: 'none', pointerEvents: 'none',
              }}>
                {a.type === 'video'
                  ? <SliderVideo src={a.url} style={CARD_STYLE} />
                  : <SliderImg   src={a.url} style={CARD_STYLE} />
                }
                {views > 0 && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
                    padding: '32px 12px 12px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    display: 'flex', alignItems: 'flex-end', gap: 5,
                  }}>
                    <PlayIcon />
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      fontSize: 13, color: '#fff', letterSpacing: '-0.01em',
                    }}>{formatViews(views)}</span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Fallback sin DB */}
          {useFallback && items && (items as (VideoItem & { _key: string })[]).map((v) => (
            <VideoCard key={v._key} v={v} />
          ))}
        </div>
      </div>

    </section>
  )
}

import { useEffect, useRef, useState } from 'react'

// ── Módulo-nivel: persiste entre re-renders y remounts ─────────
// _videoReady: URLs de video que ya reprodujeron (no vuelven a mostrar shimmer)
// _imgReady:   URLs de imagen que ya cargaron (no vuelven a mostrar shimmer)
const _videoReady = new Set<string>()
const _imgReady   = new Set<string>()

// ── Shimmer skeleton ───────────────────────────────────────────
const shimmerStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, zIndex: 1,
  background: 'linear-gradient(135deg, #2c2c2c 0%, #1e1e1e 50%, #2c2c2c 100%)',
  backgroundSize: '200% 100%',
  animation: 'slider-shimmer 1.6s ease infinite',
}

const isGif = (url: string) => url.toLowerCase().includes('.gif')

// ─────────────────────────────────────────────────────────────────────────
// SliderVideo
// src se asigna de inmediato con preload="metadata" para que el browser
// empiece a descargar antes de que el usuario llegue al video.
// El IntersectionObserver solo controla play / pause.
// ─────────────────────────────────────────────────────────────────────────
export function SliderVideo({ src, style }: { src: string; style?: React.CSSProperties }) {
  if (isGif(src)) return <SliderImg src={src} style={style} />
  return <_SliderVideo src={src} style={style} />
}

function _SliderVideo({ src, style }: { src: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState(false)
  const [hasEverPlayed, setHasEverPlayed] = useState(() => _videoReady.has(src))

  // IO: solo play/pause según visibilidad — src ya está asignado desde el start
  useEffect(() => {
    const vid = ref.current
    if (!vid || !src) return

    vid.setAttribute('playsinline', '')
    vid.setAttribute('webkit-playsinline', '')

    const tryPlay = () => {
      vid.muted = true
      vid.play().catch(() => {})
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (vid.readyState >= 2) tryPlay()
          else vid.load()
        } else {
          vid.pause()
        }
      },
      { threshold: 0.01, rootMargin: '200px 800px 200px 800px' },
    )

    io.observe(vid)
    return () => io.disconnect()
  }, [src])

  if (!src || error) {
    return <div style={{ ...style, background: '#1e1e1e', flexShrink: 0 }} />
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#181818', overflow: 'hidden' }}>
      {!hasEverPlayed && <div style={shimmerStyle} />}
      <video
        ref={ref}
        src={src}           // ← siempre asignado, no lazy
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"  // ← descarga headers y primer frame de inmediato
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        data-slider-video=""
        onLoadedMetadata={() => {
          const vid = ref.current
          if (!vid) return
          vid.muted = true
          vid.play().catch(() => {})
        }}
        onCanPlay={() => {
          ref.current?.play().catch(() => {})
        }}
        onPlay={() => {
          _videoReady.add(src)
          setHasEverPlayed(true)
        }}
        onStalled={() => {
          const vid = ref.current
          if (!vid) return
          vid.load()
          vid.play().catch(() => {})
        }}
        onError={() => setError(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'top center',
          display: 'block',
          opacity: hasEverPlayed ? 1 : 0,
          transition: 'opacity .35s ease',
          pointerEvents: 'none',
          background: 'transparent',
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// SliderImg
// src se asigna de inmediato. loading="lazy" deja que el browser decida
// cuándo descargar según su heurística (conexión, distancia al viewport, etc.)
// ─────────────────────────────────────────────────────────────────────────
export function SliderImg({ src, style }: { src: string; style?: React.CSSProperties }) {
  const [error, setError] = useState(false)
  const [hasEverLoaded, setHasEverLoaded] = useState(() => _imgReady.has(src))

  if (!src || error) {
    return <div style={{ ...style, background: '#1e1e1e', flexShrink: 0 }} />
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#181818', overflow: 'hidden' }}>
      {!hasEverLoaded && <div style={shimmerStyle} />}
      <img
        src={src}            // ← siempre asignado
        alt=""
        loading="lazy"       // ← browser nativo: más inteligente que nuestro IO
        decoding="async"
        fetchPriority="low"
        onLoad={() => {
          _imgReady.add(src)
          setHasEverLoaded(true)
        }}
        onError={() => setError(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'top center',
          display: 'block',
          opacity: hasEverLoaded ? 1 : 0,
          transition: 'opacity .35s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

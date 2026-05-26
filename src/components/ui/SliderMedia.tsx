import { useEffect, useRef, useState } from 'react'

// ── Módulo-nivel: persiste entre re-renders y remounts ───────────────────
// _activated: URLs de video que ya tuvieron src asignado
// _videoReady: URLs de video que ya reprodujeron (nunca vuelven a mostrar shimmer)
// _imgReady:   URLs de imagen que ya cargaron (nunca vuelven a mostrar shimmer)
const _activated  = new Set<string>()
const _videoReady = new Set<string>()
const _imgReady   = new Set<string>()

// ── Shimmer skeleton ─────────────────────────────────────────────────────
const shimmerStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, zIndex: 1,
  background: 'linear-gradient(135deg, #2c2c2c 0%, #1e1e1e 50%, #2c2c2c 100%)',
  backgroundSize: '200% 100%',
  animation: 'slider-shimmer 1.6s ease infinite',
}

const isGif = (url: string) => url.toLowerCase().includes('.gif')

// ─────────────────────────────────────────────────────────────────────────
// SliderVideo
// ─────────────────────────────────────────────────────────────────────────
export function SliderVideo({ src, style }: { src: string; style?: React.CSSProperties }) {
  if (isGif(src)) return <SliderImg src={src} style={style} />
  return <_SliderVideo src={src} style={style} />
}

function _SliderVideo({ src, style }: { src: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [error,  setError]  = useState(false)
  const [active, setActive] = useState(() => _activated.has(src))

  // hasEverPlayed: una vez true, NUNCA vuelve a false.
  // Controla el shimmer — si ya reprodujo alguna vez, no mostrar shimmer al volver.
  const [hasEverPlayed, setHasEverPlayed] = useState(() => _videoReady.has(src))

  // Cuando active cambia a true: promover preload y forzar carga
  useEffect(() => {
    const vid = ref.current
    if (!active || !vid) return
    vid.preload = 'metadata'
    vid.load()
  }, [active])

  // IO: lazy src + play/pause por visibilidad
  useEffect(() => {
    const vid = ref.current
    if (!vid || !src) return

    vid.setAttribute('playsinline', '')
    vid.setAttribute('webkit-playsinline', '')

    const forcePlay = () => {
      vid.muted = true
      vid.setAttribute('playsinline', '')
      vid.setAttribute('webkit-playsinline', '')
      vid.play().catch(() => {})
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          _activated.add(src)
          setActive(true)
          if (vid.readyState >= 2) {
            forcePlay()
          } else {
            // En iOS, tras una pausa larga puede necesitar reload
            vid.load()
          }
        } else {
          vid.pause()
        }
      },
      { threshold: 0.01, rootMargin: '400px 1200px 400px 1200px' }
    )

    io.observe(vid)
    return () => io.disconnect()
  }, [src])

  if (!src || error) {
    return <div style={{ ...style, background: '#1e1e1e', flexShrink: 0 }} />
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#181818', overflow: 'hidden' }}>
      {/* Shimmer solo si NUNCA ha reproducido — al volver a la sección no aparece */}
      {!hasEverPlayed && <div style={shimmerStyle} />}

      <video
        ref={ref}
        src={active ? src : undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
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
          const vid = ref.current
          if (!vid) return
          vid.muted = true
          vid.play().catch(() => {})
        }}
        onPlay={() => {
          // Registrar como "listo" a nivel módulo — persiste entre remounts
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
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
          // Visible en cuanto reprodujo alguna vez — no desaparece al hacer pausa
          opacity: hasEverPlayed ? 1 : 0,
          transition: 'opacity .4s ease',
          pointerEvents: 'none',
          background: 'transparent',
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// SliderImg
// ─────────────────────────────────────────────────────────────────────────
export function SliderImg({ src, style }: { src: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLImageElement>(null)
  const [error,  setError]  = useState(false)
  const [active, setActive] = useState(() => _imgReady.has(src))

  // hasEverLoaded: una vez true, NUNCA vuelve a false.
  // Si la imagen ya cargó en esta sesión, no mostrar shimmer al volver.
  const [hasEverLoaded, setHasEverLoaded] = useState(() => _imgReady.has(src))

  useEffect(() => {
    const img = ref.current
    if (!img || !src) return

    // Si ya cargó antes, asignar src directamente sin esperar IO
    if (_imgReady.has(src)) {
      setActive(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      { threshold: 0.01, rootMargin: '400px 1600px 400px 1600px' }
    )

    io.observe(img)
    return () => io.disconnect()
  }, [src])

  if (!src || error) {
    return <div style={{ ...style, background: '#1e1e1e', flexShrink: 0 }} />
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#181818', overflow: 'hidden' }}>
      {/* Shimmer solo si nunca ha cargado */}
      {!hasEverLoaded && <div style={shimmerStyle} />}
      <img
        ref={ref}
        src={active ? src : undefined}
        alt=""
        decoding="async"
        onLoad={() => {
          _imgReady.add(src)
          setHasEverLoaded(true)
        }}
        onError={() => setError(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
          opacity: hasEverLoaded ? 1 : 0,
          transition: 'opacity .4s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

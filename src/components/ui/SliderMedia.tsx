import { useEffect, useRef, useState } from 'react'

// ── Shimmer skeleton ─────────────────────────────────────────
const shimmerStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, zIndex: 1,
  background: 'linear-gradient(135deg, #2c2c2c 0%, #1e1e1e 50%, #2c2c2c 100%)',
  backgroundSize: '200% 100%',
  animation: 'slider-shimmer 1.6s ease infinite',
}

/**
 * SliderVideo
 * ─────────────────────────────────────────────────────────────
 * Fixes aplicados:
 * • src lazy: se asigna solo al acercarse al viewport.
 * • autoPlay + muted + playsInline + webkit-playsinline (via JS).
 * • play() explícito en onCanPlay + onLoadedMetadata (no depender
 *   solo del atributo autoPlay que iOS ignora al asignar src por JS).
 * • disablePictureInPicture + controlsList → sin botones nativos.
 * • pointer-events: none en el <video> → iOS no muestra controles.
 * • Video solo visible (opacity:1) cuando realmente está PLAYING.
 * • onPause solo oculta si src está activo (evita flash en loop).
 */
export function SliderVideo({
  src,
  style,
}: {
  src: string
  style?: React.CSSProperties
}) {
  const ref               = useRef<HTMLVideoElement>(null)
  const [error,   setError]   = useState(false)
  const [playing, setPlaying] = useState(false) // visible solo cuando reproduce
  const [active,  setActive]  = useState(false) // lazy: src activado

  // ── Helpers ─────────────────────────────────────────────────
  const forcePlay = () => {
    const vid = ref.current
    if (!vid) return
    // Atributos imperativos para iOS Safari
    vid.muted = true
    vid.setAttribute('playsinline', '')
    vid.setAttribute('webkit-playsinline', '')
    vid.play().catch(() => {})
  }

  // ── IO: lazy src + play/pause por visibilidad ──────────────
  useEffect(() => {
    const vid = ref.current
    if (!vid || !src) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)                   // activa src (1 sola vez)
          if (vid.readyState >= 2) forcePlay() // si ya tiene datos, reproducir
        } else {
          vid.pause()
        }
      },
      {
        threshold: 0.01,
        rootMargin: '400px 1200px 400px 1200px',
      }
    )

    // Atributos webkit al montar
    vid.setAttribute('playsinline', '')
    vid.setAttribute('webkit-playsinline', '')

    io.observe(vid)
    return () => io.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  if (!src || error) {
    return <div style={{ ...style, background: '#1e1e1e', flexShrink: 0 }} />
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#181818', overflow: 'hidden' }}>
      {/* Shimmer mientras el video no ha arrancado */}
      {!playing && <div style={shimmerStyle} />}

      <video
        ref={ref}
        src={active ? src : undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        // iOS Safari: oculta PiP, fullscreen y controles nativos
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        data-slider-video=""
        onLoadedMetadata={forcePlay}   // primer evento al tener metadatos
        onCanPlay={forcePlay}           // cuando tiene suficientes datos
        onPlay={() => setPlaying(true)} // video realmente reproduciendo → mostrar
        onError={() => setError(true)}
        style={{
          // Llenar el contenedor absolutamente
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
          // Visibilidad: oculto hasta que play() confirme reproducción
          opacity: playing ? 1 : 0,
          transition: 'opacity .4s ease',
          // Bloquear interacción: evita que iOS muestre controles al tocar
          pointerEvents: 'none',
          // Sin fondo negro transparente
          background: 'transparent',
        }}
      />
    </div>
  )
}

/**
 * SliderImg
 * ─────────────────────────────────────────────────────────────
 * src lazy vía IO, shimmer + fade-in al cargar.
 */
export function SliderImg({
  src,
  style,
}: {
  src: string
  style?: React.CSSProperties
}) {
  const ref               = useRef<HTMLImageElement>(null)
  const [ready,  setReady]  = useState(false)
  const [error,  setError]  = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const img = ref.current
    if (!img || !src) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      {
        threshold: 0.01,
        rootMargin: '400px 1600px 400px 1600px',
      }
    )

    io.observe(img)
    return () => io.disconnect()
  }, [src])

  if (!src || error) {
    return <div style={{ ...style, background: '#1e1e1e', flexShrink: 0 }} />
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#181818', overflow: 'hidden' }}>
      {!ready && <div style={shimmerStyle} />}
      <img
        ref={ref}
        src={active ? src : undefined}
        alt=""
        decoding="async"
        onLoad={() => setReady(true)}
        onError={() => setError(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
          opacity: ready ? 1 : 0,
          transition: 'opacity .4s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

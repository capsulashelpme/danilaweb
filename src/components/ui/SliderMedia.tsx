import { useEffect, useRef, useState } from 'react'

// ── Módulo-nivel: persiste URLs activadas entre re-renders/remounts ─
// Si un SliderVideo se desmonta y remonta (p.ej. por Realtime refetch),
// sabe que este URL ya fue activado y arranca sin esperar al IO.
const _activated = new Set<string>()

// ── Shimmer skeleton (compartido) ────────────────────────────
const shimmerStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, zIndex: 1,
  background: 'linear-gradient(135deg, #2c2c2c 0%, #1e1e1e 50%, #2c2c2c 100%)',
  backgroundSize: '200% 100%',
  animation: 'slider-shimmer 1.6s ease infinite',
}

// Detecta si una URL es GIF — siempre se renderiza como <img>
const isGif = (url: string) => url.toLowerCase().includes('.gif')

/**
 * SliderVideo
 * ─────────────────────────────────────────────────────────────
 * Flujo de carga garantizado:
 *  1. IO detecta el elemento cerca del viewport → setActive(true)
 *  2. React re-renderiza → src={url} se asigna al <video>
 *  3. useEffect [active] → vid.load() — CRÍTICO: sin esto, preload="none"
 *     hace que el browser NO empiece a cargar aunque tenga el src.
 *  4. onLoadedMetadata / onCanPlay → forcePlay() → vid.play()
 *  5. onPlay → setPlaying(true) → video visible (fade-in)
 *
 * Si la URL es un GIF, delega a SliderImg automáticamente.
 */
export function SliderVideo({
  src,
  style,
}: {
  src: string
  style?: React.CSSProperties
}) {
  // GIFs deben renderizarse como <img>, no <video>
  if (isGif(src)) return <SliderImg src={src} style={style} />

  return <_SliderVideo src={src} style={style} />
}

function _SliderVideo({
  src,
  style,
}: {
  src: string
  style?: React.CSSProperties
}) {
  const ref               = useRef<HTMLVideoElement>(null)
  const [error,   setError]   = useState(false)
  const [playing, setPlaying] = useState(false)
  // Si este src fue activado antes (aunque el componente se haya desmontado),
  // inicializar como activo para evitar pantalla negra en re-renders.
  const [active,  setActive]  = useState(() => _activated.has(src))

  // ── PASO 3: cuando el src se activa, forzar carga inmediata ─
  // Sin esto, preload="none" hace que el browser espere indefinidamente
  // aunque tenga el src asignado. vid.load() arranca la descarga.
  useEffect(() => {
    const vid = ref.current
    if (!active || !vid) return
    vid.preload = 'metadata' // promover de "none" a "metadata" una vez activo
    vid.load()               // ← la llamada crítica que faltaba
  }, [active])

  // ── PASO 1+4: IO para lazy-src + play/pause por visibilidad ─
  useEffect(() => {
    const vid = ref.current
    if (!vid || !src) return

    // Garantizar atributos webkit desde el inicio
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
          _activated.add(src)                  // persistir entre re-renders
          setActive(true)                      // activa src + dispara useEffect [active]
          if (vid.readyState >= 2) forcePlay() // si ya tiene datos, reproducir ya
        } else {
          vid.pause()
        }
      },
      {
        threshold: 0.01,
        // 400px vertical: anticipa scroll a la sección
        // 1200px horizontal: precarga ítems adyacentes del slider
        rootMargin: '400px 1200px 400px 1200px',
      }
    )

    io.observe(vid)
    return () => io.disconnect()
  }, [src])

  if (!src || error) {
    return <div style={{ ...style, background: '#1e1e1e', flexShrink: 0 }} />
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#181818', overflow: 'hidden' }}>
      {/* Shimmer mientras el video no ha arrancado todavía */}
      {!playing && <div style={shimmerStyle} />}

      <video
        ref={ref}
        src={active ? src : undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="none"     // luego se promueve a "metadata" en useEffect [active]
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        data-slider-video=""
        onLoadedMetadata={() => {
          // Cuando hay metadatos, intentar play
          const vid = ref.current
          if (!vid) return
          vid.muted = true
          vid.play().catch(() => {})
        }}
        onCanPlay={() => {
          // Cuando tiene datos suficientes, play garantizado
          const vid = ref.current
          if (!vid) return
          vid.muted = true
          vid.play().catch(() => {})
        }}
        onPlay={() => setPlaying(true)}   // confirma reproducción → mostrar
        onStalled={() => {
          // Si se traba (red lenta), reintentar load + play
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
          opacity: playing ? 1 : 0,
          transition: 'opacity .4s ease',
          pointerEvents: 'none',        // evita que iOS muestre controles al tocar
          background: 'transparent',
        }}
      />
    </div>
  )
}

/**
 * SliderImg
 * ─────────────────────────────────────────────────────────────
 * Maneja imágenes Y GIFs (ambos se cargan como <img>).
 * GIFs animan automáticamente en todos los navegadores.
 * src lazy: se asigna solo al acercarse al viewport.
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
          io.disconnect() // imagen: cargar una sola vez
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

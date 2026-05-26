import { useEffect, useRef, useState } from 'react'

/**
 * SliderVideo
 * ─────────────────────────────────────────────────────────────
 * • src NO se asigna hasta que el elemento entra en viewport
 *   (+ 600 px horizontales de margen) → 0 requests para items
 *   fuera de pantalla.
 * • autoPlay + muted + playsInline → iOS Safari permite autoplay.
 * • IntersectionObserver: play al entrar, pause al salir.
 *   Al re-entrar (loop del slider) retoma reproducción.
 * • preload="none" para no cargar datos antes de ser visible.
 * • Shimmer animado mientras carga, fade-in cuando tiene datos.
 */
export function SliderVideo({
  src,
  style,
}: {
  src: string
  style?: React.CSSProperties
}) {
  const ref        = useRef<HTMLVideoElement>(null)
  const [ready,  setReady]  = useState(false)
  const [error,  setError]  = useState(false)
  const [active, setActive] = useState(false) // ← lazy: src solo se pone al ser visible

  // ── Lazy load + play/pause por viewport ─────────────────────
  useEffect(() => {
    const vid = ref.current
    if (!vid || !src) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Primera vez visible: activar src → browser empieza a cargar
          setActive(true)
          // Si ya tiene datos (src previamente cargado), reproducir inmediatamente
          if (vid.readyState >= 2) {
            vid.play().catch(() => {})
          }
        } else {
          vid.pause()
        }
      },
      {
        threshold: 0.05,
        // 200 px vertical (anticipar scroll hasta la sección)
        // 600 px horizontal (precargar items adyacentes del slider)
        rootMargin: '200px 600px 200px 600px',
      }
    )

    io.observe(vid)
    return () => io.disconnect()
  }, [src])

  if (!src || error) {
    return (
      <div style={{
        ...style,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
      }} />
    )
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#0d0d0d' }}>
      {/* Shimmer mientras el video no tiene primer frame */}
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(135deg, #1c1c1c 0%, #111 50%, #1c1c1c 100%)',
          backgroundSize: '200% 100%',
          animation: 'slider-shimmer 1.6s ease infinite',
        }} />
      )}
      <video
        ref={ref}
        src={active ? src : undefined}
        muted
        loop
        playsInline
        autoPlay          /* cuando src se activa, el browser reproduce solo */
        preload="none"    /* sin requests hasta que src esté asignado */
        onCanPlay={() => {
          // Backup: forzar play cuando el browser esté listo
          ref.current?.play().catch(() => {})
        }}
        onLoadedData={() => setReady(true)}
        onError={() => setError(true)}
        style={{
          ...style,
          position: 'relative', zIndex: 2,
          opacity: ready ? 1 : 0,
          transition: 'opacity .4s ease',
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
        }}
      />
    </div>
  )
}

/**
 * SliderImg
 * ─────────────────────────────────────────────────────────────
 * • src NO se asigna hasta que el elemento está cerca del viewport.
 * • Shimmer + fade-in cuando termina de cargar.
 * • Sin loading="lazy" (incompatible con sliders transform-based).
 * • Errores manejados sin romper layout.
 */
export function SliderImg({
  src,
  style,
}: {
  src: string
  style?: React.CSSProperties
}) {
  const ref        = useRef<HTMLImageElement>(null)
  const [ready,  setReady]  = useState(false)
  const [error,  setError]  = useState(false)
  const [active, setActive] = useState(false) // ← lazy: src solo al acercarse al viewport

  useEffect(() => {
    const img = ref.current
    if (!img || !src) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          io.disconnect() // imagen: solo cargar una vez
        }
      },
      {
        threshold: 0.01,
        rootMargin: '200px 800px 200px 800px',
      }
    )

    io.observe(img)
    return () => io.disconnect()
  }, [src])

  if (!src || error) {
    return (
      <div style={{
        ...style,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
      }} />
    )
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#0d0d0d' }}>
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(135deg, #1c1c1c 0%, #111 50%, #1c1c1c 100%)',
          backgroundSize: '200% 100%',
          animation: 'slider-shimmer 1.6s ease infinite',
        }} />
      )}
      <img
        ref={ref}
        src={active ? src : undefined}
        alt=""
        decoding="async"
        onLoad={() => setReady(true)}
        onError={() => setError(true)}
        style={{
          ...style,
          position: 'relative', zIndex: 2,
          opacity: ready ? 1 : 0,
          transition: 'opacity .4s ease',
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
        }}
      />
    </div>
  )
}

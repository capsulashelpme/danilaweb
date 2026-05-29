import { useEffect, useRef, useState } from 'react'

// ── Módulo-nivel: persiste entre re-renders y remounts ─────────
const _activated  = new Set<string>()   // URLs que ya tuvieron src asignado
const _videoReady = new Set<string>()   // URLs que ya reprodujeron
const _imgReady   = new Set<string>()   // URLs de imagen que ya cargaron

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
//
// Estrategia de carga controlada para evitar saturar Cloudinary:
//  1. src se asigna SOLO cuando el IO dice que el video está cerca (lazy)
//  2. Una vez asignado, preload="auto" para que el browser descargue rápido
//  3. El IO también controla play/pause
//  4. Si ya cargó antes en esta sesión (_activated), src se asigna de inmediato
// ─────────────────────────────────────────────────────────────────────────
export function SliderVideo({ src, style }: { src: string; style?: React.CSSProperties }) {
  if (isGif(src)) return <SliderImg src={src} style={style} />
  return <_SliderVideo src={src} style={style} />
}

function _SliderVideo({ src, style }: { src: string; style?: React.CSSProperties }) {
  const ref     = useRef<HTMLVideoElement>(null)
  const [error, setError]           = useState(false)
  const [active, setActive]         = useState(() => _activated.has(src))
  const [hasEverPlayed, setPlayed]  = useState(() => _videoReady.has(src))

  // Cuando active pasa a true: forzar carga y play
  useEffect(() => {
    const vid = ref.current
    if (!active || !vid) return
    vid.muted = true
    vid.setAttribute('playsinline', '')
    vid.setAttribute('webkit-playsinline', '')
    if (vid.readyState >= 2) {
      vid.play().catch(() => {})
    } else {
      vid.load()
    }
  }, [active])

  // IO con margen amplio hacia los lados: activa src antes de que el usuario llegue
  useEffect(() => {
    const vid = ref.current
    if (!vid || !src) return

    // Si ya se activó antes, no necesitamos IO para asignar src
    if (_activated.has(src)) {
      setActive(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          _activated.add(src)
          setActive(true)
        } else if (active) {
          vid.pause()
        }
      },
      // rootMargin amplio en horizontal: pre-carga mientras el usuario se acerca
      { threshold: 0.01, rootMargin: '100px 600px 100px 600px' },
    )

    io.observe(vid)
    return () => io.disconnect()
  }, [src, active])

  if (!src || error) {
    return <div style={{ ...style, background: '#1e1e1e', flexShrink: 0 }} />
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#181818', overflow: 'hidden' }}>
      {!hasEverPlayed && <div style={shimmerStyle} />}
      <video
        ref={ref}
        // src solo cuando está cerca del viewport — evita 27 requests simultáneos
        src={active ? src : undefined}
        muted
        loop
        playsInline
        autoPlay
        // "auto" una vez que se asignó src: browser descarga agresivamente
        preload={active ? 'auto' : 'none'}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        data-slider-video=""
        onLoadedMetadata={() => {
          const vid = ref.current
          if (!vid) return
          vid.muted = true
          vid.play().catch(() => {})
        }}
        onCanPlay={() => { ref.current?.play().catch(() => {}) }}
        onPlay={() => { _videoReady.add(src); setPlayed(true) }}
        onStalled={() => { const v = ref.current; if (v) { v.load(); v.play().catch(() => {}) } }}
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
// src inmediato + loading="lazy" nativo: el browser gestiona la prioridad
// mejor que un IntersectionObserver manual para imágenes estáticas.
// ─────────────────────────────────────────────────────────────────────────
export function SliderImg({ src, style }: { src: string; style?: React.CSSProperties }) {
  const [error, setError]           = useState(false)
  const [hasEverLoaded, setLoaded]  = useState(() => _imgReady.has(src))

  if (!src || error) {
    return <div style={{ ...style, background: '#1e1e1e', flexShrink: 0 }} />
  }

  return (
    <div style={{ position: 'relative', ...style, background: '#181818', overflow: 'hidden' }}>
      {!hasEverLoaded && <div style={shimmerStyle} />}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => { _imgReady.add(src); setLoaded(true) }}
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

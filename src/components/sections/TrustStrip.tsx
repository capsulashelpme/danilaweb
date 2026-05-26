// TrustStrip — marquee infinito de logos de clientes
// NOTA: keyframes marquee-brands está en index.css (NO dentro del componente)
// para evitar que un re-render reinicie la animación del track.

const LOGOS = [
  { src: '/logos/1.png', alt: 'Cliente 1' },
  { src: '/logos/2.png', alt: 'Cliente 2' },
  { src: '/logos/3.png', alt: 'Cliente 3' },
  { src: '/logos/4.png', alt: 'Cliente 4' },
  { src: '/logos/5.png', alt: 'Cliente 5' },
  { src: '/logos/6.png', alt: 'Cliente 6' },
  { src: '/logos/7.png', alt: 'Cliente 7' },
  { src: '/logos/8.png', alt: 'Cliente 8' },
  { src: '/logos/9.png', alt: 'Cliente 9' },
]

// Duplicar (2×) — keyframe va de 0% a -50% (math exacta, sin decimales)
// No triplicar: con 2× y -50% el loop boundary es exactamente la mitad → sin glitch de punto flotante
const track = [...LOGOS, ...LOGOS]

export function TrustStrip() {
  return (
    <section style={{ padding: '28px 0 40px', position: 'relative' }}>
      {/* Título */}
      <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        <p style={{
          textAlign: 'center',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--fg-3)',
          fontWeight: 600,
          marginBottom: 22,
        }}>
          Marcas con las que he trabajado
        </p>
      </div>

      {/*
        Marquee — arquitectura GPU estable:
        ┌─ wrapper: overflow:hidden + mask-image
        │   La máscara vive aquí, en el mismo stacking context que el track.
        │   NO se crea una capa GPU separada para la máscara.
        └─ track: will-change:transform + translateZ(0) + backface-visibility:hidden
            Fuerza una única capa de composición estable.
            El browser NUNCA la descarta ni la recrea durante la animación.
      */}
      <div style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        // Mask en el wrapper — NO en el mismo elemento que anima el hijo
        // Separar mask-container del animated-child evita el bug de Safari
        // donde -webkit-mask-image + transform-child = capas desordenadas
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
        maskImage:       'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
        // Forzar un stacking context propio para que la máscara y el track
        // queden en la misma capa GPU (evita el dropout periódico en Safari/iOS)
        isolation: 'isolate',
        transform: 'translateZ(0)',
      }}>
        <div style={{
          display: 'flex',
          gap: 56,
          alignItems: 'center',
          width: 'max-content',
          padding: '4px 28px',
          // GPU compositing explícito — el browser nunca deprioritiza esta capa
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          // marquee-brands-2 va de 0 a -50% (2× items → loop exacto)
          animation: 'marquee-brands-2 32s linear infinite',
        }}>
          {track.map((b, i) => (
            <span
              key={i}
              style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
            >
              <img
                src={b.src}
                alt={b.alt}
                style={{
                  height: 36,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                  opacity: 0.55,
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  // Prevenir layout shifts — imagen fija en altura
                  flexShrink: 0,
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

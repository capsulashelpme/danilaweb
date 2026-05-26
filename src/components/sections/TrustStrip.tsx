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

// Triplicar para que el loop sea suave en pantallas anchas
const track = [...LOGOS, ...LOGOS, ...LOGOS]

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

      {/* Marquee */}
      <div style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 10%, #000 90%, transparent 100%)',
        maskImage:        'linear-gradient(90deg, transparent 0, #000 10%, #000 90%, transparent 100%)',
      }}>
        <div style={{
          display: 'flex',
          gap: 56,
          alignItems: 'center',
          width: 'max-content',
          padding: '4px 28px',
          // La animación está definida en index.css — nunca se reinicia por re-renders
          animation: 'marquee-brands 42s linear infinite',
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
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

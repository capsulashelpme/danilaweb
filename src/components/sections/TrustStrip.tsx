// TrustStrip — marquee infinito de logos de clientes
//
// Arquitectura del loop seamless:
//
//  ┌──────────────────────────────────────────────────────────────┐
//  │  .track  (display:flex, width:max-content, animado -50%)     │
//  │  ┌─────────────────────────┐ ┌─────────────────────────┐    │
//  │  │ .group (logos 1-9)      │ │ .group (logos 1-9)      │    │
//  │  │  gap:G  padding-right:G │ │  gap:G  padding-right:G │    │
//  │  └─────────────────────────┘ └─────────────────────────┘    │
//  └──────────────────────────────────────────────────────────────┘
//
//  padding-right:G en cada grupo → el espacio entre el último logo del
//  grupo 1 y el primero del grupo 2 es exactamente G (igual al gap interno).
//  La animación mueve exactamente el ancho de un grupo → loop sin saltos.
//
//  NOTA: @keyframes marquee-logos está en index.css

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

// Gap entre logos (en px). Debe coincidir con el padding-right de cada grupo
// para que el espacio entre grupos === espacio dentro de un grupo.
const GAP = 56

const groupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: GAP,
  // padding-right = GAP → espacio tras el último logo del grupo
  // igual al espacio entre logos dentro del grupo → loop perfecto
  paddingRight: GAP,
}

const imgStyle: React.CSSProperties = {
  height: 36,
  width: 'auto',
  objectFit: 'contain',
  filter: 'brightness(0) invert(1)',
  opacity: 0.55,
  display: 'block',
  flexShrink: 0,
  userSelect: 'none',
  pointerEvents: 'none',
}

function LogoGroup() {
  return (
    <div style={groupStyle}>
      {LOGOS.map((b, i) => (
        <img key={i} src={b.src} alt={b.alt} style={imgStyle} />
      ))}
    </div>
  )
}

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

      {/* Contenedor: overflow hidden + máscara de bordes */}
      <div style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
        maskImage:       'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
      }}>
        {/*
          Track: dos grupos idénticos lado a lado.
          La animación mueve -50% del ancho total = exactamente un grupo.
          GPU compositing explícito para que el browser nunca descarte la capa.
        */}
        <div style={{
          display: 'flex',
          width: 'max-content',
          padding: '4px 0',
          // GPU compositing — capa estable, nunca se destruye durante la animación
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden' as React.CSSProperties['backfaceVisibility'],
          animation: 'marquee-logos 30s linear infinite',
        }}>
          <LogoGroup />
          <LogoGroup />
        </div>
      </div>
    </section>
  )
}

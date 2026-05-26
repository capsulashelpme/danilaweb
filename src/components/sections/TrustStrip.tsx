// TrustStrip — marquee infinito de logos
//
// Safari iOS bug: -webkit-mask-image en un padre con hijos animados
// crea capas GPU separadas que se desincronizan → logos desaparecen.
//
// Solución: NO usar mask-image. En cambio, dos divs overlay absolutos
// (izquierda y derecha) con gradiente del color de fondo hacen el
// efecto de fade sin afectar la capa GPU de la animación.
//
// Estructura:
//   <section>
//     <div wrapper: position:relative, overflow:hidden>
//       <div track: display:flex, animation marquee-logos>
//         <LogoSet />   ← logos 1-9
//         <LogoSet />   ← logos 1-9 (copia exacta)
//       </div>
//       <div fadeLeft />   ← overlay absoluto
//       <div fadeRight />  ← overlay absoluto
//     </div>
//   </section>
//
// @keyframes marquee-logos → index.css (translate -50% = un set exacto)

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

// Un set completo de logos.
// padding-right = gap → el espacio tras el último logo del set
// coincide con el espacio entre logos dentro del set.
// Así translateX(-50%) aterriza exactamente en el inicio del set 2
// y el loop es visualmente perfecto.
function LogoSet() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      gap: 64,
      paddingRight: 64,   // debe ser igual al gap
    }}>
      {LOGOS.map((b, i) => (
        <img
          key={i}
          src={b.src}
          alt={b.alt}
          style={{
            height: 32,
            width: 'auto',
            maxWidth: 140,
            objectFit: 'contain',
            flexShrink: 0,
            display: 'block',
            filter: 'brightness(0) invert(1)',
            opacity: 0.5,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  )
}

export function TrustStrip() {
  // Color de fondo de la página — debe coincidir con --bg-0
  const bg = '#0C0C0C'

  return (
    <section style={{ padding: '28px 0 40px' }}>
      {/* Título */}
      <p style={{
        textAlign: 'center',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--fg-3)',
        fontWeight: 600,
        marginBottom: 22,
        fontFamily: 'var(--font-body)',
      }}>
        Marcas con las que he trabajado
      </p>

      {/* Wrapper: overflow hidden sin mask-image */}
      <div style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* Track animado — capa GPU propia, sin interferencia de mask */}
        <div style={{
          display: 'flex',
          width: 'max-content',
          padding: '6px 0',
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden' as React.CSSProperties['backfaceVisibility'],
          animation: 'marquee-logos 28s linear infinite',
        }}>
          <LogoSet />
          <LogoSet />
        </div>

        {/* Overlay izquierdo — gradiente encima del track, no afecta su capa GPU */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: 120,
          background: `linear-gradient(to right, ${bg} 0%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* Overlay derecho */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          width: 120,
          background: `linear-gradient(to left, ${bg} 0%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 2,
        }} />

      </div>
    </section>
  )
}

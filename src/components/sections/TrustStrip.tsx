// TrustStrip — marquee infinito de logos
// Implementación mínima y confiable para Safari iOS / Chrome / Firefox
//
// Principio: dos copias idénticas de los logos en flex.
// La animación mueve el track -50% (= exactamente una copia).
// Sin mask-image, sin will-change, sin GPU tricks — solo CSS puro.

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

export function TrustStrip() {
  return (
    <section style={{ padding: '28px 0 40px' }}>

      <p style={{
        textAlign: 'center',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--fg-3)',
        fontWeight: 600,
        marginBottom: 22,
        fontFamily: 'var(--font-body)',
        margin: '0 0 22px',
      }}>
        Marcas con las que he trabajado
      </p>

      {/* Contenedor: solo overflow hidden */}
      <div style={{ overflow: 'hidden', width: '100%' }}>

        {/* Track: flex con dos copias — animado en CSS global */}
        <div className="trust-track">

          {/* Copia 1 */}
          <div className="trust-set">
            {LOGOS.map((b, i) => (
              <img key={i} src={b.src} alt={b.alt} className="trust-logo" />
            ))}
          </div>

          {/* Copia 2 — idéntica, aria-hidden para accesibilidad */}
          <div className="trust-set" aria-hidden="true">
            {LOGOS.map((b, i) => (
              <img key={i} src={b.src} alt="" className="trust-logo" />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

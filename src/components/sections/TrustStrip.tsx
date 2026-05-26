// TrustStrip — marquee horizontal premium
// Estructura: dos grupos idénticos en un track animado.
// translateX(-50%) = exactamente un grupo → loop invisible.
// CSS classes en index.css — sin inline animation styles (más estable en Safari iOS).

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

function LogoGroup({ hidden }: { hidden?: boolean }) {
  return (
    <div className="brands-group" aria-hidden={hidden || undefined}>
      {LOGOS.map((b, i) => (
        <div key={i} className="brand-item">
          <img src={b.src} alt={hidden ? '' : b.alt} className="brand-img" />
        </div>
      ))}
    </div>
  )
}

export function TrustStrip() {
  return (
    <section className="brands-section">
      <p className="brands-title">Marcas con las que he trabajado</p>

      {/* Wrapper: overflow hidden + fade en bordes via ::before/::after en CSS */}
      <div className="brands-marquee">
        <div className="brands-track">
          <LogoGroup />
          <LogoGroup hidden />
        </div>
      </div>
    </section>
  )
}

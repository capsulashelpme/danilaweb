// TrustStrip — grid estático de logos de clientes
// Sin animación, sin carrusel, sin riesgo de bugs en Safari/iOS.

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
    <section className="trust-section">
      <p className="trust-label">Marcas con las que he trabajado</p>
      <div className="trust-grid">
        {LOGOS.map((b, i) => (
          <div key={i} className="trust-cell">
            <img src={b.src} alt={b.alt} className="trust-img" />
          </div>
        ))}
      </div>
    </section>
  )
}

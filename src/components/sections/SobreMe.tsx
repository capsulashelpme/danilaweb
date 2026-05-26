export function SobreMe() {
  return (
    <section id="sobre-mi" className="dot-grid" style={{
      padding: '16px 0 36px',
      position: 'relative',
      background: `
        radial-gradient(70% 60% at 50% 100%, rgba(255,90,31,0.08), transparent 70%),
        linear-gradient(180deg, #111110 0%, #0d0d0c 100%)
      `,
    }}>
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="reveal" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Sobre mí</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(28px, 4.5vw, 52px)',
            lineHeight: 1.05, letterSpacing: '-0.025em',
            marginTop: 14, maxWidth: '22ch', margin: '14px auto 0',
          }}>
            Desarrollo estrategias digitales para marcas que{' '}
            <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontWeight: 400, color: 'var(--orange-1)' }}>
              buscan resultados
            </em>.
          </h2>
        </div>
      </div>
    </section>
  )
}

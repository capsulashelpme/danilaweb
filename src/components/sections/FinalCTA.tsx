import { WA_LINK } from '@/lib/constants'

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M27.2 4.7A15.85 15.85 0 0 0 16 0 16 16 0 0 0 2.16 23.86L0 32l8.36-2.19A15.97 15.97 0 0 0 16 32 16 16 0 0 0 27.2 4.7zM16 29.26a13.27 13.27 0 0 1-6.77-1.85l-.48-.29-5 1.3 1.34-4.87-.32-.5A13.3 13.3 0 1 1 16 29.26zm7.3-9.95c-.4-.2-2.36-1.17-2.73-1.3-.36-.13-.63-.2-.9.2-.27.4-1.03 1.3-1.27 1.57-.23.27-.46.3-.86.1a10.93 10.93 0 0 1-3.22-2 12.07 12.07 0 0 1-2.23-2.77c-.23-.4-.02-.6.18-.8.18-.18.4-.46.6-.7.2-.23.27-.4.4-.66.13-.27.07-.5-.03-.7-.1-.2-.9-2.16-1.23-2.96-.32-.78-.65-.67-.9-.68l-.76-.02c-.27 0-.7.1-1.06.5-.36.4-1.4 1.36-1.4 3.32 0 1.96 1.43 3.85 1.63 4.12.2.27 2.82 4.3 6.83 6.04.95.4 1.7.65 2.28.84.96.3 1.83.26 2.52.16.77-.12 2.36-.97 2.7-1.9.32-.94.32-1.74.23-1.9-.1-.16-.36-.27-.76-.46z"/>
  </svg>
)

export function FinalCTA() {
  return (
    <section style={{ marginTop: 80, width: '100%' }}>
      <div
        className="dot-grid"
        style={{
          position: 'relative',
          width: '100%',
          background: `
            radial-gradient(80% 100% at 50% 0%, rgba(255,90,31,0.45), transparent 60%),
            radial-gradient(60% 60% at 100% 100%, rgba(201,58,18,0.28), transparent 70%),
            linear-gradient(180deg, #1a0d07, #0a0503)
          `,
          borderTop: '1px solid rgba(255,90,31,0.4)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '60px 24px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(34px,6vw,76px)',
            letterSpacing: '-.035em', lineHeight: 0.98,
            maxWidth: '18ch', margin: '0 auto',
          }}>
            Tu negocio no necesita verse bonito.<br/>
            Necesita{' '}
            <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontWeight: 400, color: 'var(--orange-1)' }}>
              vender mejor
            </em>.
          </h2>
          <p style={{ fontSize: 'clamp(15px,1.4vw,17px)', color: 'var(--fg-2)', margin: '22px auto 0', maxWidth: '52ch' }}>
            Construyamos una presencia digital clara, profesional y enfocada en resultados.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              height: 54, padding: '0 28px',
              borderRadius: 'var(--r-pill)',
              background: 'var(--orange-1)', color: '#fff',
              fontWeight: 700, fontSize: 15,
              boxShadow: '0 8px 24px -6px rgba(255,90,31,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              whiteSpace: 'nowrap',
            }}>
              <WhatsAppIcon size={16}/> Solicitar diagnóstico
              <span style={{ display: 'inline-grid', placeItems: 'center', width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.18)', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
              </span>
            </a>
          </div>

          {/* copyright mínimo — cierra la página */}
          <p style={{
            marginTop: 40,
            fontSize: 11, color: 'rgba(255,255,255,0.2)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
          }}>
            © 2026 Daniel Quintana · Chihuahua, México
          </p>
        </div>
      </div>
    </section>
  )
}

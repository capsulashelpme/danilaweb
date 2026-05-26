// NOT USED — el app usa LegalFooter.tsx en su lugar.
// Este archivo puede eliminarse en un futuro sprint de limpieza.

import { Link } from 'react-router-dom'
import { WA_LINK } from '@/lib/constants'

// ── Shared link style helper ──────────────────────────────────
function NavLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const base: React.CSSProperties = {
    fontSize: 'clamp(15px, 2.2vw, 20px)',
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    letterSpacing: '-0.01em',
    transition: 'color .15s',
    display: 'block',
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={base}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
      >{children}</a>
    )
  }
  return (
    <a href={href} style={base}
      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
    >{children}</a>
  )
}

function LegalLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color .15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
    >{children}</Link>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  padding: '20px 22px',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

const categoryLabel: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '0.13em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.25)',
  fontFamily: 'var(--font-mono)',
  marginBottom: 2,
}

export function Footer() {
  return (
    <footer style={{ background: '#070707', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '64px 24px 0' }}>

        {/* ── Mega nav grid ────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 12,
        }}>

          {/* SERVICIOS */}
          <div style={cardStyle}>
            <p style={categoryLabel}>Servicios</p>
            <NavLink href="#casos">Publicidad · Meta Ads</NavLink>
            <NavLink href="#contenido">Redes Sociales</NavLink>
            <NavLink href="#webs">Páginas Web</NavLink>
            <NavLink href="#selector">Consultoría Digital</NavLink>
          </div>

          {/* RESULTADOS */}
          <div style={cardStyle}>
            <p style={categoryLabel}>Resultados</p>
            <NavLink href="#casos">Creativos & Anuncios</NavLink>
            <NavLink href="#contenido">Contenido Orgánico</NavLink>
            <NavLink href="#webs">Diseño Web</NavLink>
            <NavLink href="#dashboard">Dashboard</NavLink>
          </div>

          {/* EMPRESA */}
          <div style={cardStyle}>
            <p style={categoryLabel}>Empresa</p>
            <NavLink href="#selector">¿Cómo funciona?</NavLink>
            <NavLink href={WA_LINK} external>Contacto</NavLink>
            <NavLink href="https://instagram.com/" external>Instagram</NavLink>
            <NavLink href="https://facebook.com/" external>Facebook</NavLink>
          </div>

          {/* CTA + Legal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* CTA buttons */}
            <a
              href={WA_LINK}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                padding: '13px 20px',
                borderRadius: 'var(--r-pill)',
                background: '#fff',
                color: '#000',
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: 13,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.88)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              QUIERO RESULTADOS
            </a>
            <a
              href={WA_LINK}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                padding: '13px 20px',
                borderRadius: 'var(--r-pill)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: 13,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                transition: 'border-color .15s, color .15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              AGENDAR LLAMADA
            </a>

            {/* Legal links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              <LegalLink to="/legal/terminos">Términos de uso</LegalLink>
              <LegalLink to="/legal/privacidad">Aviso de privacidad</LegalLink>
              <LegalLink to="/legal/cookies">Política de cookies</LegalLink>
              <LegalLink to="/legal/reembolsos">Política de reembolsos</LegalLink>
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', marginTop: 2 }}>
              © DANIEL QUINTANA 2026
            </p>
          </div>

        </div>

        {/* ── Giant brand wordmark ─────────────────────────────── */}
        <div style={{
          overflow: 'hidden',
          marginTop: 32,
          paddingBottom: 0,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: 24,
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(52px, 14vw, 160px)',
            letterSpacing: '-0.04em',
            lineHeight: 0.88,
            color: 'rgba(255,255,255,0.06)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            margin: 0,
          }}>
            Daniel Quintana
          </p>
        </div>

      </div>
    </footer>
  )
}

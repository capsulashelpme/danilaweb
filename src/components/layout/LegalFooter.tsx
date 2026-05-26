import { Link } from 'react-router-dom'
import { useState } from 'react'
import { WA_LINK } from '@/lib/constants'

const LEGAL = [
  { label: 'Aviso de Privacidad',   to: '/legal/privacidad'  },
  { label: 'Política de Cookies',    to: '/legal/cookies'     },
  { label: 'Política de Reembolsos', to: '/legal/reembolsos'  },
  { label: 'Términos y Condiciones', to: '/legal/terminos'    },
]

// ── Helpers mega-nav ─────────────────────────────────────────
function NavLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const style: React.CSSProperties = {
    fontSize: 'clamp(15px, 2.4vw, 21px)',
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontWeight: 500,
    letterSpacing: '-0.01em',
    transition: 'color .15s',
    display: 'block',
    lineHeight: 1.3,
  }
  const enter = (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#fff' }
  const leave = (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }
  if (external)
    return <a href={href} target="_blank" rel="noopener noreferrer" style={style} onMouseEnter={enter} onMouseLeave={leave}>{children}</a>
  // Ruta interna de React Router (empieza con /)
  if (href.startsWith('/'))
    return <Link to={href} style={style} onMouseEnter={enter} onMouseLeave={leave}>{children}</Link>
  return <a href={href} style={style} onMouseEnter={enter} onMouseLeave={leave}>{children}</a>
}

const cardStyle: React.CSSProperties = {
  borderLeft: '1.5px solid rgba(255,255,255,0.12)',
  paddingLeft: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  alignSelf: 'start',   // la línea solo llega hasta el último item
}

const catLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.22)',
  marginBottom: 2,
}

// ── Mini panel de contacto ────────────────────────────────────
function ContactPopup({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* overlay invisible */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
      />
      <div style={{
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        left: 0,
        zIndex: 1000,
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: '16px 20px',
        minWidth: 240,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Contacto directo</p>
        <a href="tel:+526143041750" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, transition: 'color .15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
        >
          <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.91-1.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
          +52 614 304 1750
        </a>
        <a href="mailto:daniel.chquintana@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, transition: 'color .15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
        >
          <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </span>
          daniel.chquintana@gmail.com
        </a>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#25D366', fontSize: 14, fontWeight: 500, transition: 'opacity .15s' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,211,102,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M27.2 4.7A15.85 15.85 0 0 0 16 0 16 16 0 0 0 2.16 23.86L0 32l8.36-2.19A15.97 15.97 0 0 0 16 32 16 16 0 0 0 27.2 4.7zM16 29.26a13.27 13.27 0 0 1-6.77-1.85l-.48-.29-5 1.3 1.34-4.87-.32-.5A13.3 13.3 0 1 1 16 29.26zm7.3-9.95c-.4-.2-2.36-1.17-2.73-1.3-.36-.13-.63-.2-.9.2-.27.4-1.03 1.3-1.27 1.57-.23.27-.46.3-.86.1a10.93 10.93 0 0 1-3.22-2 12.07 12.07 0 0 1-2.23-2.77c-.23-.4-.02-.6.18-.8.18-.18.4-.46.6-.7.2-.23.27-.4.4-.66.13-.27.07-.5-.03-.7-.1-.2-.9-2.16-1.23-2.96-.32-.78-.65-.67-.9-.68l-.76-.02c-.27 0-.7.1-1.06.5-.36.4-1.4 1.36-1.4 3.32 0 1.96 1.43 3.85 1.63 4.12.2.27 2.82 4.3 6.83 6.04.95.4 1.7.65 2.28.84.96.3 1.83.26 2.52.16.77-.12 2.36-.97 2.7-1.9.32-.94.32-1.74.23-1.9-.1-.16-.36-.27-.76-.46z"/></svg>
          </span>
          WhatsApp
        </a>
      </div>
    </>
  )
}

export function LegalFooter() {
  const [showContact, setShowContact] = useState(false)
  return (
    <footer style={{
      background: '#070707',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      paddingBottom: 120,
    }}>

      {/* ── Mega nav ──────────────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '56px 24px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 32,
          marginBottom: 32,
        }}>

          {/* SERVICIOS */}
          <div style={cardStyle}>
            <p style={catLabel}>Servicios</p>
            <NavLink href="#casos">Publicidad · Meta Ads</NavLink>
            <NavLink href="#contenido">Redes Sociales</NavLink>
            <NavLink href="#webs">Páginas Web</NavLink>
            <NavLink href="#selector">Consultoría Digital</NavLink>
          </div>

          {/* RESULTADOS */}
          <div style={cardStyle}>
            <p style={catLabel}>Resultados</p>
            <NavLink href="#casos">Creativos & Anuncios</NavLink>
            <NavLink href="#contenido">Contenido Orgánico</NavLink>
            <NavLink href="#webs">Diseño Web</NavLink>
            <NavLink href="/login">Iniciar sesión</NavLink>
          </div>

          {/* EMPRESA */}
          <div style={cardStyle}>
            <p style={catLabel}>Redes</p>
            <NavLink href="https://tiktok.com/@itsoyannis" external>TikTok</NavLink>
            {/* Contacto — abre mini popup */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowContact(v => !v)}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: 'clamp(15px, 2.4vw, 21px)',
                  color: showContact ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontWeight: 500, letterSpacing: '-0.01em',
                  transition: 'color .15s', textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { if (!showContact) e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
              >
                Contacto
              </button>
              {showContact && <ContactPopup onClose={() => setShowContact(false)} />}
            </div>
            <NavLink href="https://instagram.com/itsoyannis" external>Instagram</NavLink>
            <NavLink href="https://www.facebook.com/profile.php?id=61589395512790" external>Facebook</NavLink>
          </div>

          {/* CTA + Legal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <a
              href={WA_LINK}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                padding: '13px 16px',
                borderRadius: 50,
                background: '#fff',
                color: '#000',
                fontWeight: 700, fontSize: 12.5,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'background .15s',
                marginBottom: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.88)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              Quiero resultados
            </a>
            <a
              href={WA_LINK}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                padding: '13px 16px',
                borderRadius: 50,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.65)',
                marginBottom: 16,
                fontWeight: 700, fontSize: 12.5,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'border-color .15s, color .15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
              }}
            >
              Agendar llamada
            </a>

            {/* Legal links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 4 }}>
              {LEGAL.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.25)' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em', marginTop: 2 }}>
              © DANIEL QUINTANA 2026
            </p>
          </div>

        </div>

        {/* Wordmark gigante — llena el ancho del contenedor */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
          <p style={{
            fontWeight: 900,
            /*
              "Daniel Quintana" = ~15 caracteres.
              A -0.03em tracking, cada carácter ocupa ≈ 0.57em de ancho.
              Para llenar el contenedor: fontSize ≈ containerWidth / (15 × 0.57)
              → usamos 11.5vw como base; el clamp lo ancla en móvil (375px→43px)
                y en desktop lo limita al ancho real del max-width (1200-48px≈1152px).
            */
            fontSize: 'clamp(42px, 11.5vw, 148px)',
            letterSpacing: '-0.03em',
            lineHeight: 0.9,
            color: 'rgba(255,255,255,0.055)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            margin: 0,
            width: '100%',
          }}>
            Daniel Quintana
          </p>
        </div>
      </div>

    </footer>
  )
}

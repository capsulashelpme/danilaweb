import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { WA_LINK } from '@/lib/constants'

// ── Theme hook ─────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'light') html.setAttribute('data-theme', 'light')
    else html.removeAttribute('data-theme')
    try { localStorage.setItem('theme', theme) } catch (_e) { /* noop */ }
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}

// ── Icons ──────────────────────────────────────────────────────
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="10" r="3"/>
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
  </svg>
)

const IconWhatsApp = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M27.2 4.7A15.85 15.85 0 0 0 16 0 16 16 0 0 0 2.16 23.86L0 32l8.36-2.19A15.97 15.97 0 0 0 16 32 16 16 0 0 0 27.2 4.7zM16 29.26a13.27 13.27 0 0 1-6.77-1.85l-.48-.29-5 1.3 1.34-4.87-.32-.5A13.3 13.3 0 1 1 16 29.26zm7.3-9.95c-.4-.2-2.36-1.17-2.73-1.3-.36-.13-.63-.2-.9.2-.27.4-1.03 1.3-1.27 1.57-.23.27-.46.3-.86.1a10.93 10.93 0 0 1-3.22-2 12.07 12.07 0 0 1-2.23-2.77c-.23-.4-.02-.6.18-.8.18-.18.4-.46.6-.7.2-.23.27-.4.4-.66.13-.27.07-.5-.03-.7-.1-.2-.9-2.16-1.23-2.96-.32-.78-.65-.67-.9-.68l-.76-.02c-.27 0-.7.1-1.06.5-.36.4-1.4 1.36-1.4 3.32 0 1.96 1.43 3.85 1.63 4.12.2.27 2.82 4.3 6.83 6.04.95.4 1.7.65 2.28.84.96.3 1.83.26 2.52.16.77-.12 2.36-.97 2.7-1.9.32-.94.32-1.74.23-1.9-.1-.16-.36-.27-.76-.46z"/>
  </svg>
)

const IconInvest = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)

// Sol — modo claro
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

// Luna — modo oscuro
const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

// Casa filled bold — siempre rellena
const IconHomeFilled = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.1 1 10.5h3V21h6v-6h4v6h6V10.5h3L12 2.1z"/>
  </svg>
)

const HERO_THRESHOLD = 200 // px — how far down before header hides

// Persiste aunque el componente se remonte (auth load, etc.)
let _dockEverVisible = false

// ── Detección de fondo claro bajo el dock ─────────────────────
function parseLuminance(color: string): number | null {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return null
  const [r, g, b] = [+m[1], +m[2], +m[3]]
  // Luminancia perceptual (0 = negro, 1 = blanco)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function isDockOverLight(dockEl: HTMLElement | null): boolean {
  if (!dockEl) return false
  const rect = dockEl.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top  + rect.height / 2
  const els = document.elementsFromPoint(cx, cy) as HTMLElement[]
  for (const el of els) {
    if (el === dockEl || dockEl.contains(el)) continue
    const bg = getComputedStyle(el).backgroundColor
    const lum = parseLuminance(bg)
    if (lum !== null && lum > 0.72) return true   // umbral: fondo claro
  }
  return false
}

// ── Dock helpers ───────────────────────────────────────────────
function dockBtnBase(iconColor: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 44, height: 44, borderRadius: '50%',
    background: 'none', border: 'none',
    color: iconColor,
    cursor: 'pointer',
    transition: 'transform .15s ease, opacity .15s ease, color .45s ease',
    flexShrink: 0,
    textDecoration: 'none',
  }
}

function DockButton({ children, as: Tag = 'button', iconColor, ...props }: React.PropsWithChildren<{ as?: React.ElementType; iconColor: string; [key: string]: unknown }>) {
  const hoverColor  = iconColor.includes('0,0,0') ? '#000000' : '#ffffff'
  const leaveColor  = iconColor
  return (
    <Tag
      {...props}
      style={dockBtnBase(iconColor)}
      onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = 'scale(0.88)'
        e.currentTarget.style.opacity = '0.6'
      }}
      onMouseUp={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.opacity = '1'
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.color = hoverColor
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.opacity = '1'
        e.currentTarget.style.color = leaveColor
      }}
      onTouchStart={(e: React.TouchEvent<HTMLElement>) => {
        e.currentTarget.style.transform = 'scale(0.88)'
        e.currentTarget.style.opacity = '0.6'
      }}
      onTouchEnd={(e: React.TouchEvent<HTMLElement>) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.opacity = '1'
      }}
    >
      {children}
    </Tag>
  )
}

function DockDivider({ iconColor }: { iconColor: string }) {
  const dividerColor = iconColor.includes('0,0,0')
    ? 'rgba(0,0,0,0.18)'
    : 'rgba(255,255,255,0.15)'
  return (
    <div style={{ width: 1, height: 20, background: dividerColor, flexShrink: 0, margin: '0 2px', transition: 'background .45s ease' }} />
  )
}

export function Topbar() {
  const { session, profile } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const [visible, setVisible] = useState(() => _dockEverVisible)
  const [loginOpacity, setLoginOpacity] = useState(1)
  const [isLight, setIsLight] = useState(false)
  const lastYRef = useRef(0)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dockRef = useRef<HTMLElement | null>(null)

  // Long press 2s en el logo oculto → admin login
  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      window.location.href = '/admin/login'
    }, 2000)
  }
  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
  }

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      // Fade login button: fully visible at 0, gone at 160px
      setLoginOpacity(Math.max(0, 1 - y / 160))
      if (y > HERO_THRESHOLD && !_dockEverVisible) { _dockEverVisible = true; setVisible(true) }
      lastYRef.current = y
      // Detectar si el dock está sobre fondo claro
      setIsLight(isDockOverLight(dockRef.current))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* ── Floating "Iniciar sesión" — top right, fades on scroll, hidden if logged in ── */}
      {/* ── Botón tema — esquina superior izquierda, siempre visible ── */}
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        style={{
          display: 'none', // oculto temporalmente — no eliminar
          position: 'fixed', top: 18, left: 20, zIndex: 50,
          width: 36, height: 36, borderRadius: '50%',
          background: theme === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)',
          border: theme === 'light' ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.12)',
          color: theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all .25s ease',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>

      <div style={{
        position: 'fixed', top: 18, right: 20, zIndex: 50,
        opacity: session ? 0 : loginOpacity,
        pointerEvents: (session || loginOpacity < 0.05) ? 'none' : 'auto',
        transition: 'opacity .3s ease',
      }}>
        {/* Invisible long-press area para admin */}
        <span
          style={{ position: 'absolute', left: -40, top: 0, width: 40, height: '100%', cursor: 'default' }}
          onMouseDown={startLongPress} onMouseUp={cancelLongPress} onMouseLeave={cancelLongPress}
          onTouchStart={startLongPress} onTouchEnd={cancelLongPress} onTouchCancel={cancelLongPress}
          onContextMenu={e => e.preventDefault()}
        />
        <a
          href="/login"
          aria-label="Iniciar sesión"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            height: 38, padding: '0 4px',
            background: 'none',
            border: 'none',
            borderRadius: 100,
            color: 'var(--fg-1)',
            fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer', flexShrink: 0,
            textDecoration: 'none',
            fontFamily: 'var(--font-body)',
            letterSpacing: '-0.01em',
            transition: 'color .2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-0)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-1)' }}
        >
          <span>Iniciar sesión</span>
          <IconUser />
        </a>
      </div>

      {/* ── Floating bottom dock — liquid glass ── */}
      <nav
        ref={dockRef as React.RefObject<HTMLElement>}
        aria-label="Acciones rápidas"
        style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: `translateX(-50%) translateY(${visible ? '0' : '120px'})`,
          zIndex: 60,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'transform .45s cubic-bezier(.34,1.56,.64,1), opacity .3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 10px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {(() => {
          const ic = isLight ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.85)'
          return (
            <>
              {/* Home */}
              <DockButton as="a" href="#" aria-label="Ir al inicio" iconColor={ic}>
                <IconHomeFilled />
              </DockButton>

              <DockDivider iconColor={ic} />

              {/* Perfil */}
              <DockButton as="a" href={session ? (profile?.is_admin ? '/admin' : '/dashboard') : '/login'} aria-label={session ? 'Mi panel' : 'Iniciar sesión'} iconColor={ic}>
                <IconUser />
              </DockButton>

              <DockDivider iconColor={ic} />

              {/* WhatsApp */}
              <DockButton as="a" href={WA_LINK} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp" iconColor={ic}>
                <IconWhatsApp />
              </DockButton>

              <DockDivider iconColor={ic} />

              {/* Elige tu ruta */}
              <DockButton
                as="button"
                aria-label="Elige tu ruta"
                iconColor={ic}
                onClick={() => {
                  const el = document.getElementById('selector')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <IconInvest />
              </DockButton>

              {/* Tema claro/oscuro — oculto temporalmente, no eliminar */}
              <span style={{ display: 'none' }}>
                <DockDivider iconColor={ic} />
                <DockButton
                  as="button"
                  aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  iconColor={ic}
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? <IconSun /> : <IconMoon />}
                </DockButton>
              </span>
            </>
          )
        })()}
      </nav>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'

// Logos reales — repetidos para llenar el marquee continuo
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

// Duplicar para el loop infinito del marquee
const doubled = [...LOGOS, ...LOGOS]

export function TrustStrip() {
  const hintRef = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const el = hintRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        // Once it leaves the viewport (was visible, now isn't) → hide forever
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setGone(true)
          obs.disconnect()
        }
      },
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section style={{ padding: '28px 0 16px', position: 'relative' }}>
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

      <div style={{
        width: '100%', overflow: 'hidden', position: 'relative',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%)',
        maskImage: 'linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%)',
      }}>
        <div style={{
          display: 'flex', gap: 56, alignItems: 'center',
          width: 'max-content',
          padding: '0 28px',
          animation: 'marquee-brands 42s linear infinite',
        }}>
          {doubled.map((b, i) => (
            <span key={i} style={{
              display: 'flex', alignItems: 'center',
              flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              <img
                src={b.src}
                alt={b.alt}
                style={{
                  height: 36,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                  opacity: 0.55,
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Scroll hint — desaparece al salir del viewport, no regresa */}
      <div ref={hintRef} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        marginTop: 32, paddingBottom: 8,
        opacity: gone ? 0 : undefined,
        pointerEvents: gone ? 'none' : undefined,
        animation: gone ? undefined : 'hint-fade-in 1.2s cubic-bezier(.22,1,.36,1) 1.2s both',
        transition: gone ? 'opacity .3s ease' : undefined,
      }}>
        <span style={{
          fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--fg-3)', fontWeight: 500,
        }}>
          Desliza para ver más
        </span>
        <svg
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="var(--fg-3)" strokeWidth="1.8" strokeLinecap="round"
          style={{ animation: 'hint-bounce 1.6s ease-in-out infinite' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <style>{`
        @keyframes marquee-brands {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(-50%,0,0); }
        }
        @keyframes hint-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hint-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(5px); }
        }
      `}</style>
    </section>
  )
}

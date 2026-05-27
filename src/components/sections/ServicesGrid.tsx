type IconName = 'target' | 'layout' | 'speaker' | 'sparkle' | 'cog' | 'chart'

const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => {
  const paths: Record<IconName, React.ReactNode> = {
    target:  <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    layout:  <><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 9h18"/><path d="M9 21V9"/></>,
    speaker: <><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15 8a5 5 0 0 1 0 8"/></>,
    sparkle: <><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></>,
    cog:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    chart:   <><path d="M3 3v18h18"/><path d="M7 14l4-4 4 3 5-6"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

const SERVICES = [
  { icon: 'target'  as IconName, title: 'Estrategia comercial',   desc: 'Plan claro. Qué, por qué, en qué orden.',       tag: '01 / Plan' },
  { icon: 'layout'  as IconName, title: 'Páginas que venden',     desc: 'Mobile-first, rápidas y enfocadas a convertir.',  tag: '02 / Build' },
  { icon: 'speaker' as IconName, title: 'Meta Ads',               desc: 'Segmentación quirúrgica. Mensajes que venden.',   tag: '03 / Ads' },
  { icon: 'sparkle' as IconName, title: 'Creativos',              desc: 'Piezas que paran el scroll y empujan a actuar.',  tag: '04 / Creative' },
  { icon: 'cog'     as IconName, title: 'Automatización',         desc: 'Respuestas y reportes que trabajan por ti.',      tag: '05 / Systems' },
  { icon: 'chart'   as IconName, title: 'Dashboard de cliente',   desc: 'Panel privado para ver avances en tiempo real.',  tag: '06 / Insight' },
]

export function ServicesGrid() {
  return (
    <section id="servicios" style={{ padding: '56px 0' }}>
      <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        <div className="reveal" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Servicios</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,5vw,60px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 16, maxWidth: '22ch', margin: '16px auto 0' }}>
            Todo lo que tu negocio necesita para{' '}
            <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontWeight: 400, color: 'var(--orange-1)' }}>crecer</em>.
          </h2>
          <p style={{ marginTop: 18, fontSize: 'clamp(15px,1.4vw,17px)', color: 'var(--fg-2)', maxWidth: '52ch', lineHeight: 1.55, margin: '18px auto 0' }}>
            Eliges lo que necesitas hoy. El resto se integra cuando sea momento.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', marginTop: 40 }}>
          {SERVICES.map((s, i) => (
            <div key={i} className="reveal" style={{
              position: 'relative',
              padding: '22px 22px 20px',
              borderRadius: 'var(--r-xl)',
              background: 'var(--bg-2)',
              border: '1px solid var(--card-border)',
              overflow: 'hidden',
              isolation: 'isolate',
              transition: 'background .2s, border-color .2s',
              minWidth: 0,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-3)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,90,31,0.12)', border: '1px solid rgba(255,90,31,0.4)', display: 'grid', placeItems: 'center', color: 'var(--orange-1)', marginBottom: 18 }}>
                <Icon name={s.icon} size={18}/>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-.015em', marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 16 }}>{s.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px dashed var(--card-border)', fontSize: 11.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--orange-1)', fontWeight: 600 }}>{s.tag}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

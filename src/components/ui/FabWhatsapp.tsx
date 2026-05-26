import { WA_LINK } from '@/lib/constants'

const WhatsAppIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M27.2 4.7A15.85 15.85 0 0 0 16 0 16 16 0 0 0 2.16 23.86L0 32l8.36-2.19A15.97 15.97 0 0 0 16 32 16 16 0 0 0 27.2 4.7zM16 29.26a13.27 13.27 0 0 1-6.77-1.85l-.48-.29-5 1.3 1.34-4.87-.32-.5A13.3 13.3 0 1 1 16 29.26zm7.3-9.95c-.4-.2-2.36-1.17-2.73-1.3-.36-.13-.63-.2-.9.2-.27.4-1.03 1.3-1.27 1.57-.23.27-.46.3-.86.1a10.93 10.93 0 0 1-3.22-2 12.07 12.07 0 0 1-2.23-2.77c-.23-.4-.02-.6.18-.8.18-.18.4-.46.6-.7.2-.23.27-.4.4-.66.13-.27.07-.5-.03-.7-.1-.2-.9-2.16-1.23-2.96-.32-.78-.65-.67-.9-.68l-.76-.02c-.27 0-.7.1-1.06.5-.36.4-1.4 1.36-1.4 3.32 0 1.96 1.43 3.85 1.63 4.12.2.27 2.82 4.3 6.83 6.04.95.4 1.7.65 2.28.84.96.3 1.83.26 2.52.16.77-.12 2.36-.97 2.7-1.9.32-.94.32-1.74.23-1.9-.1-.16-.36-.27-.76-.46z"/>
  </svg>
)

export function FabWhatsapp() {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hablar por WhatsApp"
      style={{
        position: 'fixed',
        bottom: 18, right: 18,
        zIndex: 60,
        display: 'inline-flex', alignItems: 'center', gap: 10,
        height: 50, padding: '0 18px 0 14px',
        borderRadius: 'var(--r-pill)',
        background: '#25D366',
        color: '#052e15',
        fontWeight: 700, fontSize: 14,
        boxShadow: '0 12px 32px -8px rgba(37,211,102,0.5), 0 4px 12px rgba(0,0,0,0.3)',
        transition: 'transform .15s, box-shadow .2s',
        maxWidth: 'calc(100vw - 36px)',
        textDecoration: 'none',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = '0 16px 40px -8px rgba(37,211,102,0.6)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = '0 12px 32px -8px rgba(37,211,102,0.5), 0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      <WhatsAppIcon size={22}/>
      <span style={{ display: 'none' }} className="[@media(min-width:520px)]:!inline">
        Hablar por WhatsApp
      </span>
    </a>
  )
}

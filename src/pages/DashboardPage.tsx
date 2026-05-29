import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useMetrics } from '@/hooks/useMetrics'
import { supabase } from '@/lib/supabase'
import { PaymentCard } from '@/components/dashboard/PaymentCard'
import { ProductsSheet } from '@/components/sections/ProductsSheet'

// ── Formatters ─────────────────────────────────────────────────
const fx = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
const fn = (n: number) =>
  new Intl.NumberFormat('es-MX').format(Math.round(n))


// ── SVG Icons ──────────────────────────────────────────────────
const ic = (d: string, size = 18) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
)
const IconSpend   = () => ic('M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6')
const IconTarget  = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconReach = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconClick = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polyline points="15 10 20 10 20 20 4 20 4 10 9 10"/>
    <polyline points="12 15 12 3"/><polyline points="9 6 12 3 15 6"/>
  </svg>
)
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <polyline points="9 21 9 12 15 12 15 21"/>
  </svg>
)
const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const IconEdit = () => ic('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', 14)
const IconSort = () => ic('M3 6h18M7 12h10M11 18h2', 14)

// ── Insight ────────────────────────────────────────────────────
// ── Animated number ────────────────────────────────────────────
function AnimNum({ value, format }: { value: number; format: (n: number) => string }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!value) { setV(0); return }
    let cur = 0; let i = 0
    const steps = 40; const inc = value / steps
    const t = setInterval(() => {
      i++; cur += inc
      if (i >= steps) { setV(value); clearInterval(t) }
      else setV(cur)
    }, 16)
    return () => clearInterval(t)
  }, [value])
  return <>{format(v)}</>
}

// ── Hero Sales Card ────────────────────────────────────────────


// ── KPI Card ───────────────────────────────────────────────────
function KpiCard({ sub, value, format, accent, icon, loading, delay = 0 }: {
  label?: string; sub: string; value: number
  format: (n: number) => string; accent: string
  icon: React.ReactNode; loading?: boolean; delay?: number
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02, boxShadow: `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px ${accent}22` }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', duration: 0.3, bounce: 0.18 }}
      style={{
        borderRadius: 24, padding: '20px 22px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.055)',
        position: 'relative', overflow: 'hidden', minWidth: 0,
        animation: `fadeUp .45s cubic-bezier(.22,1,.36,1) ${delay}s both`,
        cursor: 'default',
      }}>
      {/* Ícono arriba-derecha, sutil */}
      <div style={{ position: 'absolute', top: 16, right: 16, color: accent, opacity: 0.55 }}>{icon}</div>
      {/* Número protagonista */}
      {loading ? (
        <div style={{ height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.08)', animation: 'pulse 1.4s ease infinite', marginBottom: 6 }} />
      ) : (
        <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1, marginBottom: 6 }}>
          <AnimNum value={value} format={format} />
        </div>
      )}
      {/* Label abajo */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', fontWeight: 500 }}>{sub}</div>
    </motion.div>
  )
}

// ── ROI Panel ─────────────────────────────────────────────────
function RoiPanel({ spend, sales }: { spend: number; sales: number }) {
  const profit = sales - spend
  const roi    = spend > 0 ? ((sales - spend) / spend) * 100 : 0
  const good   = roi >= 0
  const pct    = Math.min(Math.max((sales / (spend || 1)) * 50, 2), 100) // cap at 100%

  // Mini sparkline bars (decorative)
  const bars   = [40, 55, 45, 70, 60, 85, pct].map(h => Math.max(h, 8))

  return (
    <motion.div
      whileHover={{ scale: 1.008, boxShadow: good ? '0 16px 48px rgba(52,199,89,0.12)' : '0 16px 48px rgba(255,69,58,0.12)' }}
      transition={{ type: 'spring', duration: 0.35, bounce: 0.12 }}
      style={{
        borderRadius: 20, overflow: 'hidden', position: 'relative',
        background: good
          ? 'linear-gradient(135deg, rgba(52,199,89,0.1) 0%, rgba(255,255,255,0.04) 60%)'
          : 'linear-gradient(135deg, rgba(255,69,58,0.1) 0%, rgba(255,255,255,0.04) 60%)',
        border: `1px solid ${good ? 'rgba(52,199,89,0.2)' : 'rgba(255,69,58,0.2)'}`,
        animation: 'fadeUp .45s cubic-bezier(.22,1,.36,1) .3s both',
        cursor: 'default',
      }}>
      {/* Animated ambient glow */}
      <div className={good ? 'roi-glow-green' : 'roi-glow-red'} />

      <div style={{ padding: '22px 22px 20px', position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Retorno de inversión</div>
            <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif', fontWeight: 700, fontSize: 'clamp(28px,8vw,42px)', letterSpacing: '-0.03em', color: good ? '#34C759' : '#FF453A', lineHeight: 1 }}>
              {good ? '+' : ''}{roi.toFixed(0)}%
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Por cada peso invertido</div>
          </div>

          {/* Mini sparkline chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52, paddingBottom: 2 }}>
            {bars.map((h, i) => (
              <div key={i} style={{
                width: 5, borderRadius: 3,
                height: `${h}%`,
                background: i === bars.length - 1
                  ? (good ? '#34C759' : '#FF453A')
                  : (good ? 'rgba(52,199,89,0.25)' : 'rgba(255,69,58,0.25)'),
                transition: 'height .6s cubic-bezier(.22,1,.36,1)',
              }} />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{
            height: '100%', borderRadius: 100,
            background: good ? 'linear-gradient(90deg, rgba(52,199,89,0.6), #34C759)' : 'linear-gradient(90deg, rgba(255,69,58,0.6), #FF453A)',
            width: `${Math.min(pct, 100)}%`,
            transition: 'width 1.2s cubic-bezier(.22,1,.36,1)',
            boxShadow: good ? '0 0 8px rgba(52,199,89,0.5)' : '0 0 8px rgba(255,69,58,0.5)',
          }} />
        </div>

        {/* 3-col stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 }}>
          {[
            { label: 'Invertido',     value: fx(spend),  color: 'rgba(255,159,10,1)' },
            { label: 'Ganancia neta', value: fx(profit), color: good ? '#34C759' : '#FF453A' },
            { label: 'Ventas totales',value: fx(sales),  color: '#fff' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Campaign types ─────────────────────────────────────────────
type SortMode = 'results' | 'spend' | 'clients'

function sortCampaigns(
  campaigns: ReturnType<typeof useMetrics>['data']['campaigns'],
  mode: SortMode,
) {
  const list = [...campaigns]
  if (mode === 'results') return list.sort((a, b) => (b.results - a.results))
  if (mode === 'spend')   return list.sort((a, b) => (b.spend   - a.spend))
  // 'clients' → más reciente primero
  return list.sort((a, b) => {
    const da = a.date_start ? new Date(a.date_start).getTime() : 0
    const db = b.date_start ? new Date(b.date_start).getTime() : 0
    return db - da
  })
}

// ── Campaign Row ───────────────────────────────────────────────
function CampaignRow({ c, i }: { c: ReturnType<typeof useMetrics>['data']['campaigns'][0]; i: number }) {
  const isActive = (c.manual_status ?? c.effective_status) === 'ACTIVE'

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
      transition={{ duration: 0.18 }}
      style={{
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderRadius: 12,
        animation: `fadeUp .4s cubic-bezier(.22,1,.36,1) ${0.04 + i * 0.05}s both`,
      }}>
      {/* Status circle */}
      <div style={{ width: 36, height: 36, borderRadius: 11, background: isActive ? 'rgba(52,199,89,0.1)' : 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', flexShrink: 0, position: 'relative' }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: isActive ? '#34C759' : 'rgba(255,255,255,0.25)',
          boxShadow: isActive ? '0 0 0 0 rgba(52,199,89,0.4)' : 'none',
          animation: isActive ? 'campaignPulse 2s ease infinite' : 'none',
        }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {c.campaign_name ?? 'Campaña'}
        </span>
        {/* Status badge */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
            background: isActive ? '#34C759' : 'rgba(255,255,255,0.3)',
          }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? 'rgba(52,199,89,0.8)' : 'rgba(255,255,255,0.3)', letterSpacing: '0.03em' }}>
            {isActive ? 'Activa' : 'Pausada'}
          </span>
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,159,10,1)', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>{fx(c.spend)}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{fn(c.results)} mensajes</span>
      </div>
    </motion.div>
  )
}

// ── Sort chip ──────────────────────────────────────────────────
function SortChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="sort-chip"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', duration: 0.22, bounce: 0.35 }}
      style={{
        padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
        background: active ? 'rgba(255,159,10,1)' : 'rgba(255,255,255,0.07)',
        color: active ? '#000' : 'rgba(255,255,255,0.5)',
        transition: 'background .15s, color .15s',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </motion.button>
  )
}

// ── Connect Account Card ───────────────────────────────────────
const SUPABASE_URL_CLIENT  = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_CLIENT = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function ConnectAccountCard({ onConnected }: { onConnected: () => void }) {
  const [actId, setActId]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [err, setErr]         = useState<string | null>(null)

  const handleSave = async () => {
    const raw = actId.trim()
    if (!raw) return
    const norm = raw.startsWith('act_') ? raw : `act_${raw}`
    setSaving(true); setErr(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaving(false); return }

    const { error } = await supabase.from('client_ad_accounts').upsert({
      profile_id: session.user.id,
      meta_ad_account_id: norm,
      active: true,
      assigned_at: new Date().toISOString(),
    }, { onConflict: 'profile_id' })

    if (error) { setErr('No se pudo guardar. Verifica el ID.'); setSaving(false); return }

    setSaving(false)
    setSaved(true)

    // Disparar sync automático
    setSyncing(true)
    let syncOk = false
    try {
      const res = await fetch(`${SUPABASE_URL_CLIENT}/functions/v1/sync-meta-metrics`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_CLIENT,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      // Intentar parsear la respuesta para detectar errores de Meta
      let body: Record<string, unknown> = {}
      try { body = await res.json() } catch (_) { /* no JSON */ }

      const hasMetaError =
        !res.ok ||
        (body as { error?: string }).error != null ||
        (body as { meta_error?: string }).meta_error != null ||
        ((body as { results?: unknown[] }).results?.length === 0 && !res.ok)

      if (hasMetaError) {
        // Cuenta inválida — revertir y mostrar error
        setSyncing(false)
        setSaved(false)
        setErr('ID de cuenta incorrecto. Verifica el número en Meta Ads Manager e intenta de nuevo.')
        // Borrar el registro inválido de la BD para no dejarlo guardado
        await supabase.from('client_ad_accounts')
          .delete()
          .eq('profile_id', session.user.id)
        return
      }
      syncOk = true
    } catch (_) {
      // Error de red — dejar pasar, no bloquear al usuario
      syncOk = true
    }
    setSyncing(false)
    if (syncOk) onConnected() // refresca métricas y dispara tour
  }

  if (saved) return (
    <div style={{ textAlign: 'center', padding: '36px 24px', borderRadius: 18, background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.15)', animation: 'fadeUp .4s ease both' }}>
      <div style={{ fontSize: 28, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
        {syncing
          ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(52,199,89,0.6)" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
        }
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#34C759', marginBottom: 6 }}>
        {syncing ? 'Cargando tus resultados…' : '¡Todo listo!'}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
        {syncing ? 'Conectando con Meta Ads, un momento.' : 'Tus campañas aparecerán aquí en breve.'}
      </div>
    </div>
  )

  return (
    <div style={{ borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 20px', animation: 'fadeUp .45s ease .3s both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,159,10,0.12)', display: 'grid', placeItems: 'center', color: 'rgba(255,159,10,0.9)', flexShrink: 0 }}>
          <IconTarget />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Conecta tu cuenta de Meta</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Agrega tu ID de negocio para ver tus resultados</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

      {/* Input */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>
          ID de tu cuenta publicitaria
        </label>
        <input
          type="text" value={actId}
          onChange={e => { setActId(e.target.value); setErr(null) }}
          placeholder="act_123456789 o solo el número"
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          style={{
            width: '100%', height: 48, padding: '0 14px', boxSizing: 'border-box',
            borderRadius: 12, background: 'rgba(255,255,255,0.05)',
            border: err ? '1.5px solid rgba(255,59,48,0.5)' : '1.5px solid rgba(255,255,255,0.09)',
            color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'monospace',
            letterSpacing: '0.02em', transition: 'border-color .2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(255,159,10,0.5)' }}
          onBlur={e => { e.target.style.borderColor = err ? 'rgba(255,59,48,0.5)' : 'rgba(255,255,255,0.09)' }}
        />
        {err && <div style={{ fontSize: 11, color: '#FF3B30', marginTop: 5 }}>{err}</div>}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 6, lineHeight: 1.5 }}>
          Lo encuentras en <span style={{ color: 'rgba(255,159,10,0.7)' }}>Meta Ads Manager</span> → esquina superior izquierda.
        </div>
      </div>

      {/* CTA */}
      <motion.button
        onClick={handleSave} disabled={saving || !actId.trim()}
        whileTap={actId.trim() && !saving ? { scale: 0.96 } : {}}
        transition={{ type: 'spring', duration: 0.22, bounce: 0.3 }}
        style={{
          width: '100%', height: 46, borderRadius: 12, border: 'none',
          background: actId.trim() && !saving ? 'rgba(255,159,10,1)' : 'rgba(255,159,10,0.25)',
          color: actId.trim() && !saving ? '#000' : 'rgba(255,255,255,0.3)',
          fontWeight: 700, fontSize: 14, cursor: saving ? 'wait' : actId.trim() ? 'pointer' : 'default',
          fontFamily: 'inherit', transition: 'background .2s, color .2s',
        }}
      >
        {saving ? 'Guardando…' : 'Conectar mi cuenta →'}
      </motion.button>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────
export function DashboardPage() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, loading, refetch } = useMetrics()

  const paymentResult = searchParams.get('payment')
  const [toastExiting, setToastExiting] = useState(false)
  useEffect(() => {
    if (paymentResult) {
      setToastExiting(false)
      const exitTimer = setTimeout(() => setToastExiting(true), 4500)
      const removeTimer = setTimeout(() => setSearchParams({}), 5200)
      return () => { clearTimeout(exitTimer); clearTimeout(removeTimer) }
    }
  }, [paymentResult])

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const [label,          setLabel]          = useState<string | null>(null)
  const [sales,          setSales]          = useState<number>(0)
  const [showAll,        setShowAll]        = useState(false)
  const [sortMode,       setSortMode]       = useState<SortMode>('results')
  const [serviceStartDate, setServiceStartDate] = useState<string | null>(null)
  const [serviceEndDate,   setServiceEndDate]   = useState<string | null>(null)
  const [paymentStatus,    setPaymentStatus]    = useState<'paid_monthly' | 'paid_annual' | null>(null)
  // true = el cliente ya conectó su cuenta de Meta (muestra planes y dashboard completo)
  const [hasMetaAccount,   setHasMetaAccount]   = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !mounted) return
      const uid = session.user.id

      // ── Carga inicial ─────────────────────────────────────────
      const { data: acc } = await supabase
        .from('client_ad_accounts')
        .select('label, total_sales, sales_updated_by, sales_updated_at, service_start_date, service_end_date, payment_status, meta_ad_account_id')
        .eq('profile_id', uid)
        .maybeSingle()
      if (acc && mounted) {
        setLabel(acc.label)
        setSales(acc.total_sales ?? 0)
        setServiceStartDate(acc.service_start_date ?? null)
        setServiceEndDate(acc.service_end_date ?? null)
        setPaymentStatus(acc.payment_status ?? null)
        setHasMetaAccount(!!(acc.meta_ad_account_id))
      }

      if (!mounted) return

      // ── Realtime: actualiza ventas y estado de pago sin recargar ──
      // Nombre único por montaje para evitar reutilizar un canal ya suscrito
      channel = supabase
        .channel(`db-acc-${uid}-${Date.now()}`)
      channel
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'client_ad_accounts',
            filter: `profile_id=eq.${uid}`,
          },
          (payload) => {
            if (!mounted) return
            const row = payload.new as Record<string, unknown>
            if (typeof row.total_sales === 'number') setSales(row.total_sales)
            setPaymentStatus((row.payment_status as 'paid_monthly' | 'paid_annual' | null) ?? null)
            if (row.service_start_date !== undefined)
              setServiceStartDate((row.service_start_date as string | null) ?? null)
            if (row.service_end_date !== undefined)
              setServiceEndDate((row.service_end_date as string | null) ?? null)
            if (row.label) setLabel(row.label as string)
            if (row.meta_ad_account_id) setHasMetaAccount(true)
          }
        )
        .subscribe()
    }

    init()

    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const handleSaved = (n: number) => {
    setSales(n)
  }

  const [showProducts, setShowProducts] = useState(false)

  // ── Hero edit (ventas) ─────────────────────────────────────────
  const [heroEditing, setHeroEditing] = useState(false)
  const [heroRaw,     setHeroRaw]     = useState('')
  const [heroSaving,  setHeroSaving]  = useState(false)
  const [heroOk,      setHeroOk]      = useState(false)

  const openHeroEdit  = () => { setHeroRaw(sales > 0 ? String(sales) : ''); setHeroEditing(true); setHeroOk(false) }
  const closeHeroEdit = () => setHeroEditing(false)
  const saveHeroEdit  = async () => {
    const n = parseFloat(heroRaw.replace(/[^0-9.]/g, ''))
    if (isNaN(n)) return
    setHeroSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setHeroSaving(false); return }
    await supabase.from('client_ad_accounts').update({
      total_sales: n, sales_updated_by: 'client', sales_updated_at: new Date().toISOString(),
    }).eq('profile_id', session.user.id)
    setHeroSaving(false); setHeroEditing(false); setHeroOk(true)
    handleSaved(n)
    setTimeout(() => setHeroOk(false), 3000)
  }

  // Saludo dinámico (zona horaria Chihuahua)
  const greetingTime = (() => {
    const h = parseInt(new Date().toLocaleString('es-MX', { timeZone: 'America/Chihuahua', hour: 'numeric', hour12: false }), 10)
    if (h >= 6  && h < 12) return 'Buenos días'
    if (h >= 12 && h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  })()
  const greetingEmoji = (() => {
    const h = parseInt(new Date().toLocaleString('es-MX', { timeZone: 'America/Chihuahua', hour: 'numeric', hour12: false }), 10)
    if (h >= 6  && h < 12) return '☀️'
    if (h >= 12 && h < 19) return '🌤️'
    return '🌙'
  })()

  // ── Onboarding tour ───────────────────────────────────────────
  const [tourStep,    setTourStep]    = useState<number | null>(null) // null = no activo
  const TOUR_KEY = profile?.id ? `dq_tour_done_${profile.id}` : null

  const startTour = useCallback(() => {
    if (!TOUR_KEY) return
    if (localStorage.getItem(TOUR_KEY)) return   // ya lo vio
    setTourStep(0)
    // Reproducir sonido del tour
    try {
      const audio = new Audio('/sounds/tour.mp3')
      audio.volume = 0.7
      audio.play().catch(() => {/* autoplay bloqueado — silencioso */})
    } catch (_) { /* silencioso */ }
  }, [TOUR_KEY])

  const dismissTour = () => {
    if (TOUR_KEY) localStorage.setItem(TOUR_KEY, '1')
    setTourStep(null)
  }

  const TOUR_STEPS = [
    {
      key: 'metrics',
      title: 'Métricas en tiempo real',
      body: 'Inversión, alcance, clics y mensajes se actualizan automáticamente desde Meta Ads. Sin demoras.',
      accent: 'rgba(255,159,10,1)',
      accentBg: 'rgba(255,159,10,0.1)',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,159,10,1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/>
          <polyline points="6 10 9 7 12 10 15 7 18 10"/>
        </svg>
      ),
      stats: [
        { label: 'Alcance', value: '12.4K', color: 'rgba(255,159,10,1)' },
        { label: 'Clics',   value: '1,830', color: '#fff' },
        { label: 'Mensajes',value: '247',   color: 'rgba(52,199,89,1)' },
      ],
    },
    {
      key: 'roi',
      title: 'Tu retorno de inversión',
      body: 'El panel de ROI compara lo que invertiste en publicidad contra las ventas reales que generaste.',
      accent: 'rgba(52,199,89,1)',
      accentBg: 'rgba(52,199,89,0.1)',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(52,199,89,1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
      stats: [
        { label: 'Invertido', value: '$5,200', color: 'rgba(255,159,10,1)' },
        { label: 'Ventas',    value: '$18,600', color: '#fff' },
        { label: 'ROI',       value: '+257%',   color: 'rgba(52,199,89,1)' },
      ],
    },
    {
      key: 'reports',
      title: 'Reportes PDF por campaña',
      body: 'Descarga un reporte profesional de cualquier campaña con un solo toque. Listo para compartir.',
      accent: 'rgba(10,132,255,1)',
      accentBg: 'rgba(10,132,255,0.1)',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(10,132,255,1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="11" x2="12" y2="17"/>
          <polyline points="9 14 12 17 15 14"/>
        </svg>
      ),
      stats: [
        { label: 'Formato',    value: 'PDF',      color: 'rgba(10,132,255,1)' },
        { label: 'Campaña',    value: 'Individual', color: '#fff' },
        { label: 'Descarga',   value: '1 toque',  color: 'rgba(255,159,10,1)' },
      ],
    },
  ]

  const sorted  = sortCampaigns(data.campaigns, sortMode)
  // Todas las campañas para el picker de PDF, ordenadas: mayor inversión primero
  const pickerCampaigns = [...(data.campaigns ?? [])]
    .sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0))
  const visible = showAll ? sorted : sorted.slice(0, 3)
  const greeting = label || profile?.full_name || 'bienvenido'
  const hasRoi   = sales > 0 && data.spend > 0

  // Service expiry
  const serviceLeft = serviceEndDate
    ? Math.ceil((new Date(serviceEndDate + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    : null
  const totalDays = (serviceStartDate && serviceEndDate)
    ? Math.ceil((new Date(serviceEndDate + 'T00:00:00').getTime() - new Date(serviceStartDate + 'T00:00:00').getTime()) / 86400000)
    : null
  const progressPct = (totalDays && totalDays > 0 && serviceLeft !== null)
    ? Math.min(100, Math.max(0, Math.round(((totalDays - serviceLeft) / totalDays) * 100)))
    : null
  const showExpiry = serviceLeft !== null && serviceLeft <= 5

  const SORT_OPTS: { id: SortMode; label: string }[] = [
    { id: 'results', label: 'Mejor resultado' },
    { id: 'spend',   label: 'Mayor inversión' },
    { id: 'clients', label: 'Más clientes' },
  ]

  const [syncing, setSyncing]           = useState(false)
  const [syncedAt, setSyncedAt]         = useState<Date | null>(null)
  const [syncToastOut, setSyncToastOut] = useState(false)
  const syncClicksRef = useRef<number[]>([])  // timestamps de clicks recientes

  const showSyncToast = useCallback(() => {
    setSyncToastOut(false)
    setSyncedAt(new Date())
    setTimeout(() => setSyncToastOut(true), 4500)
    setTimeout(() => setSyncedAt(null),     5100)
  }, [])

  const syncAndRefetch = useCallback(async () => {
    if (syncing) return

    // ── Lógica de cuándo mostrar el toast ──────────────────────
    const FIRST_TIME_KEY = 'dq_sync_first_done'
    const isFirstTime = !localStorage.getItem(FIRST_TIME_KEY)

    if (isFirstTime) {
      localStorage.setItem(FIRST_TIME_KEY, '1')
      showSyncToast()
    } else {
      // Registra este click y limpia los de más de 10 segundos
      const now = Date.now()
      syncClicksRef.current = [...syncClicksRef.current, now].filter(t => now - t < 10_000)
      if (syncClicksRef.current.length >= 3) {
        syncClicksRef.current = []   // reset para no repetir hasta que vuelva a acumular
        showSyncToast()
      }
    }

    setSyncing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-meta-metrics`, {
          method: 'POST',
          headers: {
            apikey:        import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (_) { /* silencioso */ }
    setSyncing(false)
  }, [syncing, showSyncToast])

  const [generatingPdf,       setGeneratingPdf]       = useState(false)
  const [showCampaignPicker,  setShowCampaignPicker]  = useState(false)
  const [pdfCampaignLoading,  setPdfCampaignLoading]  = useState<string | null>(null)

  const generatePDF = useCallback(async () => {
    if (generatingPdf) return
    setGeneratingPdf(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const W = 210, ML = 18, MR = 18, CW = W - ML - MR
      const now = new Date()
      const monthName = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
      const dateStr   = now.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      const clientName = label || profile?.full_name || 'Cliente'

      // ── Paleta ────────────────────────────────────────────────
      const orange: [number,number,number] = [255, 90, 31]
      const black:  [number,number,number] = [15,  15,  15]
      const gray1:  [number,number,number] = [80,  80,  80]
      const gray2:  [number,number,number] = [140, 140, 140]
      const gray3:  [number,number,number] = [230, 230, 230]
      const white:  [number,number,number] = [255, 255, 255]

      let y = 0

      // ── Header band ───────────────────────────────────────────
      doc.setFillColor(...orange)
      doc.rect(0, 0, W, 38, 'F')

      doc.setTextColor(...white)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Daniel Quintana', ML, 14)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text('Marketing Digital', ML, 20)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(`Reporte mensual · ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`, ML, 30)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text(`Cliente: ${clientName}`, W - MR, 30, { align: 'right' })

      y = 50

      // ── Helper: section title ─────────────────────────────────
      const sectionTitle = (title: string) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...orange)
        doc.text(title.toUpperCase(), ML, y)
        doc.setDrawColor(...orange)
        doc.setLineWidth(0.4)
        doc.line(ML, y + 1.5, ML + CW, y + 1.5)
        y += 8
        doc.setTextColor(...black)
      }

      // ── Helper: separator line ────────────────────────────────
      const separator = () => {
        doc.setDrawColor(...gray3)
        doc.setLineWidth(0.3)
        doc.line(ML, y, ML + CW, y)
        y += 6
      }

      // ── Sección 1: Resumen del mes ────────────────────────────
      sectionTitle('Resumen del mes')

      const metrics: { label: string; value: string; sub?: string }[] = [
        { label: 'Inversión total',     value: fx(data.spend),       sub: 'últimos 30 días' },
        { label: 'Alcance total',       value: fn(data.reach),       sub: 'personas únicas' },
        { label: 'Impresiones',         value: fn(data.impressions), sub: 'vistas totales' },
        { label: 'Clics',               value: fn(data.clicks),      sub: `CTR ${data.ctr.toFixed(2)}%` },
        { label: 'Resultados obtenidos',value: fn(data.results),     sub: 'leads / compras' },
        { label: 'Costo por resultado', value: fx(data.cost_per_result), sub: 'promedio' },
        ...(hasRoi ? [{ label: 'Ventas registradas', value: fx(sales), sub: 'acumulado' }] : []),
      ]

      const colW = CW / 2
      metrics.forEach((m, i) => {
        const x = ML + (i % 2) * colW
        if (i % 2 === 0 && i !== 0) y += 16
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(15)
        doc.setTextColor(...black)
        doc.text(m.value, x, y)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...gray1)
        doc.text(m.label, x, y + 5)
        if (m.sub) {
          doc.setFontSize(7.5)
          doc.setTextColor(...gray2)
          doc.text(m.sub, x, y + 9.5)
        }
      })
      y += 22
      separator()

      // ── Sección 2: Campañas ───────────────────────────────────
      sectionTitle('Campañas del periodo')

      if (data.campaigns.length === 0) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)
        doc.setTextColor(...gray2)
        doc.text('Sin campañas en este periodo.', ML, y)
        y += 10
      } else {
        // Cabecera tabla
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...gray1)
        doc.text('CAMPAÑA', ML, y)
        doc.text('INVERSIÓN', ML + CW * 0.55, y, { align: 'right' })
        doc.text('RESULTADOS', ML + CW * 0.75, y, { align: 'right' })
        doc.text('C/RESULTADO', ML + CW, y, { align: 'right' })
        y += 4
        doc.setDrawColor(...gray3)
        doc.setLineWidth(0.3)
        doc.line(ML, y, ML + CW, y)
        y += 5

        data.campaigns.slice(0, 10).forEach((c, i) => {
          if (i % 2 === 0) {
            doc.setFillColor(248, 248, 248)
            doc.rect(ML - 2, y - 3.5, CW + 4, 8, 'F')
          }
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(...black)
          const name = (c.campaign_name ?? 'Sin nombre').slice(0, 38)
          doc.text(name, ML, y)
          doc.text(fx(c.spend), ML + CW * 0.55, y, { align: 'right' })
          doc.text(fn(c.results), ML + CW * 0.75, y, { align: 'right' })
          const cpr = c.results > 0 ? fx(c.spend / c.results) : '—'
          doc.text(cpr, ML + CW, y, { align: 'right' })
          y += 8
        })
      }
      y += 4
      separator()

      // ── Sección 3: Observaciones ──────────────────────────────
      sectionTitle('Observaciones')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...gray1)
      const obs = [
        `Frecuencia promedio: ${data.frequency.toFixed(2)} impresiones por persona.`,
        `CPC promedio: ${fx(data.cpc)} por clic.`,
        ...(hasRoi
          ? [`Retorno estimado: ${((sales / data.spend) * 100).toFixed(0)}% sobre la inversión.`]
          : ['Registra tus ventas en el dashboard para calcular el retorno sobre inversión.']),
        'Este reporte cubre los últimos 30 días de actividad publicitaria.',
      ]
      obs.forEach(line => {
        doc.text(`• ${line}`, ML, y, { maxWidth: CW })
        y += 6
      })

      // ── Footer ────────────────────────────────────────────────
      const pageH = 297
      doc.setFillColor(...gray3)
      doc.rect(0, pageH - 18, W, 18, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...gray1)
      doc.text(`Reporte generado el ${dateStr}`, ML, pageH - 10)
      doc.text('daniel.chquintana@gmail.com  ·  +52 614 304 1750', W - MR, pageH - 10, { align: 'right' })

      // ── Descarga ──────────────────────────────────────────────
      const fileName = `reporte-${(label || 'cliente').toLowerCase().replace(/\s+/g, '-')}-${now.toISOString().slice(0,7)}.pdf`
      doc.save(fileName)
    } catch (e) {
      console.error('Error generando PDF:', e)
    }
    setGeneratingPdf(false)
  }, [data, sales, label, profile, hasRoi, generatingPdf])

  // ── PDF por campaña individual ─────────────────────────────────
  const generateCampaignPDF = useCallback(async (c: ReturnType<typeof useMetrics>['data']['campaigns'][0]) => {
    if (pdfCampaignLoading) return
    setPdfCampaignLoading(c.campaign_id ?? c.id)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const W = 210, ML = 18, MR = 18, CW = W - ML - MR
      const now = new Date()
      const dateStr   = now.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      const clientName = label || profile?.full_name || 'Cliente'

      const orange: [number,number,number] = [255, 90, 31]
      const black:  [number,number,number] = [15,  15,  15]
      const gray1:  [number,number,number] = [80,  80,  80]
      const gray2:  [number,number,number] = [140, 140, 140]
      const gray3:  [number,number,number] = [230, 230, 230]
      const white:  [number,number,number] = [255, 255, 255]

      let y = 0

      // ── Header ────────────────────────────────────────────────
      doc.setFillColor(...orange)
      doc.rect(0, 0, W, 38, 'F')
      doc.setTextColor(...white)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Daniel Quintana', ML, 14)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text('Marketing Digital', ML, 20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Reporte de campaña', ML, 30)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text(`Cliente: ${clientName}`, W - MR, 30, { align: 'right' })

      y = 50

      // ── Nombre campaña ────────────────────────────────────────
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...black)
      const campName = c.campaign_name ?? 'Campaña'
      const wrapped = doc.splitTextToSize(campName, CW)
      doc.text(wrapped, ML, y)
      y += wrapped.length * 8 + 2

      // Fechas y estado
      const dateRange = c.date_start && c.date_stop
        ? `${new Date(c.date_start).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} — ${new Date(c.date_stop).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : 'Últimos 30 días'
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...gray2)
      doc.text(`Período: ${dateRange}`, ML, y)
      const displayStatus = c.manual_status ?? c.effective_status
      if (displayStatus) {
        doc.text(`Estado: ${displayStatus}`, W - MR, y, { align: 'right' })
      }
      y += 8

      // Separador
      doc.setDrawColor(...gray3)
      doc.setLineWidth(0.3)
      doc.line(ML, y, ML + CW, y)
      y += 10

      // ── Sección: Métricas ──────────────────────────────────────
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...orange)
      doc.text('MÉTRICAS DE RENDIMIENTO', ML, y)
      doc.setDrawColor(...orange)
      doc.setLineWidth(0.4)
      doc.line(ML, y + 1.5, ML + CW, y + 1.5)
      y += 10

      const cpr = c.results > 0 ? fx(c.spend / c.results) : '—'
      const metrics: { label: string; value: string; sub: string }[] = [
        { label: 'Inversión',         value: fx(c.spend),              sub: 'importe gastado' },
        { label: 'Alcance',           value: fn(c.reach ?? 0),         sub: 'personas únicas' },
        { label: 'Impresiones',       value: fn(c.impressions ?? 0),   sub: 'vistas totales' },
        { label: 'Clics',             value: fn(c.clicks ?? 0),        sub: `CTR ${(c.ctr ?? 0).toFixed(2)}%` },
        { label: 'Resultados',        value: fn(c.results),            sub: c.result_type ?? 'conversiones' },
        { label: 'Costo por resultado',value: cpr,                     sub: 'promedio' },
        { label: 'Frecuencia',        value: (c.frequency ?? 0).toFixed(2), sub: 'impresiones/persona' },
        { label: 'CPC',               value: fx(c.cpc ?? 0),           sub: 'costo por clic' },
      ]

      const colW = CW / 2
      metrics.forEach((m, i) => {
        const x = ML + (i % 2) * colW
        if (i % 2 === 0 && i !== 0) y += 18
        // Zebra background
        if (i % 4 < 2) {
          doc.setFillColor(248, 248, 248)
          doc.rect(x - 2, y - 5, colW - 2, 18, 'F')
        }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(15)
        doc.setTextColor(...black)
        doc.text(m.value, x, y)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...gray1)
        doc.text(m.label, x, y + 5)
        doc.setFontSize(7.5)
        doc.setTextColor(...gray2)
        doc.text(m.sub, x, y + 9.5)
      })
      y += 24

      // Separador
      doc.setDrawColor(...gray3)
      doc.setLineWidth(0.3)
      doc.line(ML, y, ML + CW, y)
      y += 8

      // ── Observaciones ─────────────────────────────────────────
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...orange)
      doc.text('OBSERVACIONES', ML, y)
      doc.setDrawColor(...orange)
      doc.setLineWidth(0.4)
      doc.line(ML, y + 1.5, ML + CW, y + 1.5)
      y += 10

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...gray1)
      const obs = [
        `Frecuencia: cada persona vio el anuncio ${(c.frequency ?? 0).toFixed(2)} veces en promedio.`,
        `CPC de ${fx(c.cpc ?? 0)} por cada clic recibido.`,
        c.results > 0
          ? `Se obtuvieron ${fn(c.results)} resultado${c.results !== 1 ? 's' : ''} a un costo promedio de ${cpr}.`
          : 'Esta campaña no registró resultados directos en el período.',
        'Los datos provienen directamente de Meta Ads API (últimos 30 días).',
      ]
      obs.forEach(line => {
        doc.text(`• ${line}`, ML, y, { maxWidth: CW })
        y += 6
      })

      // ── Footer ────────────────────────────────────────────────
      const pageH = 297
      doc.setFillColor(...gray3)
      doc.rect(0, pageH - 18, W, 18, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...gray1)
      doc.text(`Reporte generado el ${dateStr}`, ML, pageH - 10)
      doc.text('daniel.chquintana@gmail.com  ·  +52 614 304 1750', W - MR, pageH - 10, { align: 'right' })

      // ── Descarga ──────────────────────────────────────────────
      const slug = (c.campaign_name ?? 'campaña').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
      const fileName = `reporte-${slug}-${now.toISOString().slice(0,7)}.pdf`
      doc.save(fileName)
    } catch (e) {
      console.error('Error generando PDF de campaña:', e)
    }
    setPdfCampaignLoading(null)
    setShowCampaignPicker(false)
  }, [pdfCampaignLoading, label, profile])

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif', position: 'relative', overflowX: 'hidden' }}>

      {/* ── Fondo animado naranja — solo en la primera mitad ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '80vh',          // cubre hasta ~ROI, luego se desvanece
        pointerEvents: 'none', zIndex: 0,
        // gradiente vertical: color arriba → negro abajo
        maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
      }}>
        <div className="db-hero-glow" />
      </div>

      {/* ── Payment toast ── */}
      {paymentResult === 'success' && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%',
          zIndex: 70, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderRadius: 100,
          background: 'rgba(20,20,20,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(52,199,89,0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
          animation: toastExiting
            ? 'toastOut .6s cubic-bezier(.4,0,1,1) forwards'
            : 'toastIn .4s cubic-bezier(.22,1,.36,1) both',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#34C759' }}>
            {paymentStatus === 'paid_annual' ? 'Plan anual activado correctamente.' : paymentStatus === 'paid_monthly' ? 'Plan mensual activado correctamente.' : '¡Pago exitoso! Tu suscripción está activa.'}
          </span>
        </div>
      )}
      {paymentResult === 'cancelled' && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%',
          zIndex: 70, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderRadius: 100,
          background: 'rgba(20,20,20,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,159,10,0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
          animation: toastExiting
            ? 'toastOut .6s cubic-bezier(.4,0,1,1) forwards'
            : 'toastIn .4s cubic-bezier(.22,1,.36,1) both',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9F0A" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#FF9F0A' }}>Pago cancelado. Puedes intentarlo cuando quieras.</span>
        </div>
      )}

      {/* ── Sync toast ── */}
      {syncedAt && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          zIndex: 70, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderRadius: 100,
          background: 'rgba(20,20,20,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
          maxWidth: 'calc(100vw - 48px)',
          animation: syncToastOut
            ? 'toastOut .6s cubic-bezier(.4,0,1,1) forwards'
            : 'toastIn .4s cubic-bezier(.22,1,.36,1) both',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
            Meta puede tardar hasta 2 h en actualizar.
          </span>
        </div>
      )}

      {/* ── Onboarding tour ── */}
      <AnimatePresence>
        {tourStep !== null && (() => {
        const step = TOUR_STEPS[tourStep]
        const isLast = tourStep === TOUR_STEPS.length - 1
        return (
          <motion.div
            key="tour-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
            position: 'fixed', inset: 0, zIndex: 300,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 16px 120px',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 16,  scale: 0.96 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.2 }}
              style={{
                width: '100%', maxWidth: 400,
                borderRadius: 28,
                background: 'rgba(14,14,14,0.98)',
                border: `1px solid ${step.accent}26`,
                padding: '0 0 20px',
                boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`,
                overflow: 'hidden',
              }}
            >
              {/* Colored header band */}
              <div style={{
                padding: '26px 24px 22px',
                background: step.accentBg,
                borderBottom: `1px solid ${step.accent}18`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              }}>
                {/* Icon circle */}
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: step.accentBg,
                  border: `1.5px solid ${step.accent}30`,
                  display: 'grid', placeItems: 'center',
                  animation: 'tourIconPop .5s cubic-bezier(.34,1.56,.64,1) .1s both',
                  boxShadow: `0 8px 24px ${step.accent}20`,
                }}>
                  {step.icon}
                </div>

                {/* Mini stats bar */}
                <div style={{
                  display: 'flex', gap: 6, width: '100%',
                  animation: 'tourFadeIn .4s ease .2s both',
                }}>
                  {step.stats.map((s, i) => (
                    <div key={s.label} style={{
                      flex: 1, textAlign: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 12, padding: '9px 6px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      animation: `tourFadeIn .35s ease ${0.15 + i * 0.07}s both`,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: s.color, letterSpacing: '-0.02em', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text content */}
              <div style={{ padding: '20px 24px 4px', animation: 'tourFadeIn .4s ease .15s both' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', marginBottom: 8, lineHeight: 1.3 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
                  {step.body}
                </div>
              </div>

              {/* Progress + buttons */}
              <div style={{ padding: '16px 24px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Dots */}
                <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                  {TOUR_STEPS.map((_, i) => (
                    <div key={i} style={{
                      height: 4, borderRadius: 2,
                      width: i === tourStep ? 20 : 4,
                      background: i === tourStep ? step.accent : 'rgba(255,255,255,0.12)',
                      transition: 'all .3s cubic-bezier(.22,1,.36,1)',
                    }} />
                  ))}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: 'spring', duration: 0.22, bounce: 0.3 }}
                    onClick={dismissTour}
                    style={{
                      flex: 1, height: 44, borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.09)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.35)',
                      fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Omitir
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', duration: 0.22, bounce: 0.3 }}
                    onClick={() => isLast ? dismissTour() : setTourStep(tourStep + 1)}
                    style={{
                      flex: 2, height: 44, borderRadius: 14, border: 'none',
                      background: step.accent,
                      color: step.key === 'metrics' ? '#000' : '#fff',
                      fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    {isLast ? (
                      <>¡Listo<span style={{ fontSize: 16 }}>🚀</span></>
                    ) : (
                      <>Siguiente <span style={{ opacity: 0.7 }}>→</span></>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )
      })()}
      </AnimatePresence>

      {/* ── Campaign picker overlay ── */}
      {showCampaignPicker && (
        <div
          onClick={() => setShowCampaignPicker(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 55 }}
        />
      )}

      {/* ── Campaign picker popup ── */}
      {showCampaignPicker && (
        <div style={{
          position: 'fixed',
          bottom: 112,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 56,
          minWidth: 300,
          maxWidth: 'calc(100vw - 28px)',
          maxHeight: '60vh',
          overflowY: 'auto',
          background: 'rgba(20,20,20,0.96)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20,
          boxShadow: '0 16px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
          animation: 'pickerIn .2s cubic-bezier(.22,1,.36,1) both',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Descargar reporte de:
            </span>
          </div>

          {/* Reporte general */}
          <button
            onClick={(e) => { e.stopPropagation(); generatePDF() }}
            disabled={generatingPdf}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 16px', background: 'none', border: 'none',
              cursor: generatingPdf ? 'wait' : 'pointer',
              textAlign: 'left', transition: 'background .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,90,31,0.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {generatingPdf
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,90,31,0.8)" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,90,31,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Reporte general</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Todas las campañas · últimos 30 días</div>
            </div>
          </button>

          {/* Divisor */}
          {pickerCampaigns.length > 0 && (
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 16px' }} />
          )}

          {/* Campañas individuales */}
          {pickerCampaigns.length === 0 ? (
            <div style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              Sin campañas disponibles
            </div>
          ) : (
            pickerCampaigns.map((c) => {
              const isLoading = pdfCampaignLoading === (c.campaign_id ?? c.id)
              const isActive  = (c.manual_status ?? c.effective_status) === 'ACTIVE'
              return (
                <button
                  key={c.campaign_id ?? c.id}
                  onClick={(e) => { e.stopPropagation(); generateCampaignPDF(c) }}
                  disabled={!!pdfCampaignLoading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', background: 'none', border: 'none',
                    cursor: pdfCampaignLoading ? 'wait' : 'pointer',
                    textAlign: 'left', transition: 'background .12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(10,132,255,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {isLoading
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(10,132,255,0.8)" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(10,132,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(c.campaign_name ?? 'Campaña').length > 32
                        ? (c.campaign_name ?? 'Campaña').slice(0, 32) + '…'
                        : (c.campaign_name ?? 'Campaña')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: isActive ? 'rgba(52,199,89,0.9)' : 'rgba(255,255,255,0.28)',
                        background: isActive ? 'rgba(52,199,89,0.1)' : 'rgba(255,255,255,0.06)',
                        padding: '2px 6px', borderRadius: 100,
                      }}>
                        {isActive ? 'Activa' : 'Pausada'}
                      </span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{c.spend > 0 ? fx(c.spend) : '—'}</span>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}

      {/* ── Bottom dock ── */}
      <nav style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 60, display: 'flex', alignItems: 'center', gap: 4,
        padding: '8px 10px',
        background: 'rgba(20,20,20,0.85)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 100,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        {([
          { icon: <IconHome />, label: 'Inicio', action: () => navigate('/') },
          { icon: <IconRefresh />, label: 'Actualizar', action: syncAndRefetch },
          { icon: <IconDownload />, label: 'Reporte PDF', action: () => setShowCampaignPicker(v => !v) },
          { icon: <IconLogout />, label: 'Salir', action: () => setShowLogoutConfirm(true), danger: true },
        ] as { icon: React.ReactNode; label: string; action: () => void; danger?: boolean }[]).map((btn, i, arr) => (
          <React.Fragment key={btn.label}>
            <button
              onClick={btn.action}
              aria-label={btn.label}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'none', border: 'none',
                color: btn.danger ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.75)',
                cursor: 'pointer', display: 'grid', placeItems: 'center',
                transition: 'color .15s, transform .15s',
                flexShrink: 0, position: 'relative',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = btn.danger ? '#FF5050' : '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = btn.danger ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.75)' }}
            >
              {(btn.label === 'Reporte PDF' && generatingPdf) || (btn.label === 'Actualizar' && syncing)
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : btn.icon}
              {/* Expiry dot on home button */}
              {btn.label === 'Inicio' && showExpiry && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 7, height: 7, borderRadius: '50%',
                  background: serviceLeft! <= 0 ? '#FF3B30' : '#FF9F0A',
                  border: '1.5px solid rgba(20,20,20,0.9)',
                  animation: 'pulse 2s ease infinite',
                }} />
              )}
            </button>
            {i < arr.length - 1 && (
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', flexShrink: 0, margin: '0 2px' }} />
            )}
          </React.Fragment>
        ))}
      </nav>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 120px', display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', zIndex: 1, isolation: 'isolate' }}>


        {/* ── 1. Hero section ── */}
        <div style={{ padding: '100px 0 32px', textAlign: 'center', animation: 'fadeUp .4s cubic-bezier(.22,1,.36,1) both' }}>

          {/* Saludo con emoji dinámico */}
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: 4, letterSpacing: '-0.01em' }}>
            {greetingTime}, {greeting} {greetingEmoji}
          </div>
          {/* @username — solo si existe, pequeño y discreto */}
          {profile?.username && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: 'monospace', letterSpacing: '0.04em', marginBottom: 8 }}>
              @{profile.username}
            </div>
          )}

          {/* Número protagonista */}
          <div style={{
            fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
            fontSize: 'clamp(52px,14vw,72px)', fontWeight: 800,
            letterSpacing: '-0.05em', color: '#fff', lineHeight: 1, marginBottom: 6,
          }}>
            {loading ? '—' : (sales > 0 ? fx(sales) : '$0')}
          </div>

          {/* Subtítulo limpio */}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginBottom: 12 }}>
            Ventas registradas
          </div>

          {/* Editar — centrado, debajo del subtítulo */}
          <button
            onClick={openHeroEdit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 100, border: '1px solid rgba(255,159,10,0.3)', background: heroOk ? 'rgba(52,199,89,0.1)' : 'rgba(255,159,10,0.08)', color: heroOk ? 'rgba(52,199,89,0.9)' : 'rgba(255,159,10,0.85)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', marginBottom: 28 }}
          >
            {heroOk
              ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Guardado</>
              : <><IconEdit />Editar ventas</>
            }
          </button>

          {/* Pills de acción — Sync / Soporte / Inicio */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {[
              {
                label: 'Sync',
                icon: syncing
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  : <IconRefresh />,
                action: syncAndRefetch,
                disabled: syncing,
              },
              {
                label: 'Soporte',
                icon: <svg width="13" height="13" viewBox="0 0 32 32" fill="currentColor"><path d="M27.2 4.7A15.85 15.85 0 0 0 16 0 16 16 0 0 0 2.16 23.86L0 32l8.36-2.19A15.97 15.97 0 0 0 16 32 16 16 0 0 0 27.2 4.7zM16 29.26a13.27 13.27 0 0 1-6.77-1.85l-.48-.29-5 1.3 1.34-4.87-.32-.5A13.3 13.3 0 1 1 16 29.26zm7.3-9.95c-.4-.2-2.36-1.17-2.73-1.3-.36-.13-.63-.2-.9.2-.27.4-1.03 1.3-1.27 1.57-.23.27-.46.3-.86.1a10.93 10.93 0 0 1-3.22-2 12.07 12.07 0 0 1-2.23-2.77c-.23-.4-.02-.6.18-.8.18-.18.4-.46.6-.7.2-.23.27-.4.4-.66.13-.27.07-.5-.03-.7-.1-.2-.9-2.16-1.23-2.96-.32-.78-.65-.67-.9-.68l-.76-.02c-.27 0-.7.1-1.06.5-.36.4-1.4 1.36-1.4 3.32 0 1.96 1.43 3.85 1.63 4.12.2.27 2.82 4.3 6.83 6.04.95.4 1.7.65 2.28.84.96.3 1.83.26 2.52.16.77-.12 2.36-.97 2.7-1.9.32-.94.32-1.74.23-1.9-.1-.16-.36-.27-.76-.46z"/></svg>,
                action: () => window.open('https://wa.me/526143041750?text=Hola%2C%20necesito%20soporte%20con%20mi%20dashboard.', '_blank'),
                disabled: false,
              },
              {
                label: 'Inicio',
                icon: <IconHome />,
                action: () => navigate('/'),
                disabled: false,
              },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                disabled={btn.disabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  height: 40, padding: '0 18px', borderRadius: 100,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: btn.disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                  fontSize: 13, fontWeight: 600, cursor: btn.disabled ? 'wait' : 'pointer',
                  fontFamily: 'inherit', transition: 'all .15s',
                }}
                onMouseEnter={e => { if (!btn.disabled) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = btn.disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)' }}
              >
                {btn.icon}{btn.label}
              </button>
            ))}
          </div>

          {/* ── Productos ── */}
          <div style={{ marginTop: 24, paddingBottom: 4 }}>
            <button
              onClick={() => setShowProducts(true)}
              style={{
                width: '100%', height: 56, borderRadius: 20,
                border: '1.5px solid rgba(255,90,31,0.4)',
                background: 'linear-gradient(135deg, rgba(255,90,31,0.18) 0%, rgba(255,90,31,0.08) 100%)',
                color: '#FF5A1F',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all .2s',
                boxShadow: '0 0 0 0 rgba(255,90,31,0)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,90,31,0.28) 0%, rgba(255,90,31,0.14) 100%)'
                e.currentTarget.style.borderColor = 'rgba(255,90,31,0.65)'
                e.currentTarget.style.boxShadow = '0 0 24px rgba(255,90,31,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,90,31,0.18) 0%, rgba(255,90,31,0.08) 100%)'
                e.currentTarget.style.borderColor = 'rgba(255,90,31,0.4)'
                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(255,90,31,0)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Mis productos
            </button>
          </div>
        </div>

        {/* ── ProductsSheet ── */}
        {profile?.id && (
          <ProductsSheet
            open={showProducts}
            onClose={() => setShowProducts(false)}
            profileId={profile.id}
            currentSales={sales}
            onSalesUpdated={handleSaved}
          />
        )}

        {/* ── Edit ventas overlay ── */}
        <AnimatePresence>
        {heroEditing && (
          <motion.div
            key="hero-edit-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={closeHeroEdit}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.94,  y: 8  }}
              transition={{ type: 'spring', duration: 0.38, bounce: 0.22 }}
              style={{ width: '100%', maxWidth: 340, borderRadius: 24, background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', padding: '28px 24px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Actualizar ventas</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.5 }}>
                Ingresa el total de ventas generadas en los últimos 30 días.
              </div>
              <input
                type="number"
                value={heroRaw}
                onChange={e => setHeroRaw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveHeroEdit()}
                autoFocus
                placeholder="Ej. 12500"
                style={{ width: '100%', height: 54, padding: '0 16px', boxSizing: 'border-box', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 22, fontWeight: 700, outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.02em', colorScheme: 'dark' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={closeHeroEdit} style={{ flex: 1, height: 46, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancelar
                </button>
                <button onClick={saveHeroEdit} disabled={heroSaving} style={{ flex: 1, height: 46, borderRadius: 14, border: 'none', background: heroSaving ? 'rgba(255,159,10,0.5)' : 'rgba(255,159,10,1)', color: '#000', fontWeight: 700, fontSize: 14, cursor: heroSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {heroSaving
                    ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Guardando…</>
                    : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* ── 1b. Expiry strip (only when ≤5 days) ── */}
        {showExpiry && (
          <div style={{
            marginBottom: 16, padding: '12px 16px', borderRadius: 14,
            background: serviceLeft! <= 0 ? 'rgba(255,59,48,0.1)' : 'rgba(255,159,10,0.08)',
            border: `1px solid ${serviceLeft! <= 0 ? 'rgba(255,59,48,0.3)' : 'rgba(255,159,10,0.25)'}`,
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'fadeUp .4s cubic-bezier(.22,1,.36,1) both',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={serviceLeft! <= 0 ? '#FF3B30' : '#FF9F0A'} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: progressPct !== null ? 6 : 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: serviceLeft! <= 0 ? '#FF3B30' : '#FF9F0A' }}>
                  {serviceLeft! <= 0
                    ? 'Tu servicio ha vencido'
                    : `${serviceLeft} día${serviceLeft !== 1 ? 's' : ''} restante${serviceLeft !== 1 ? 's' : ''}`}
                </span>
                {totalDays !== null && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>de {totalDays} días</span>
                )}
              </div>
              {progressPct !== null && (
                <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${progressPct}%`, background: serviceLeft! <= 0 ? '#FF3B30' : '#FF9F0A', transition: 'width .4s ease' }} />
                </div>
              )}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                {serviceLeft! <= 0 ? 'Actualiza tu plan para continuar.' : 'Renueva pronto para no perder continuidad.'}
              </span>
            </div>
          </div>
        )}

        {/* ── 4. KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 32 }}>
          <KpiCard label="Invertido"  sub="en publicidad"          value={data.spend}   format={fx} accent="rgba(255,159,10,1)"   icon={<IconSpend />}  loading={loading} delay={0.1}  />
          <KpiCard label="Mensajes"   sub="conversaciones iniciadas"   value={data.results} format={fn} accent="rgba(52,199,89,1)"    icon={<IconTarget />} loading={loading} delay={0.14} />
          <KpiCard label="Alcance"    sub="te vieron al menos 1x"  value={data.reach}   format={fn} accent="rgba(191,90,242,1)"   icon={<IconReach />}  loading={loading} delay={0.18} />
          <KpiCard label="Clics"      sub="entraron a ver más"     value={data.clicks}  format={fn} accent="rgba(10,132,255,1)"   icon={<IconClick />}  loading={loading} delay={0.22} />
        </div>

        {/* ── 4b. Payment buttons ── */}
        {!loading && (
          <div id="servicios" style={{ marginBottom: 20 }}>
            <PaymentCard
              manualStatus={paymentStatus}
              serviceLeft={serviceLeft}
              unpaid={paymentStatus === null}
            />
          </div>
        )}

        {/* ── 5. ROI Panel ── */}
        {hasRoi && (() => {
          const roi = ((sales - data.spend) / data.spend) * 100
          const roiMsg =
            roi >= 200 ? 'Tus anuncios están generando un retorno sobresaliente. 🚀'
            : roi >= 50 ? 'Tus campañas van tomando fuerza y ya están generando movimiento.'
            : roi >= 0  ? 'Los resultados van avanzando. Seguimos optimizando juntos.'
            : 'Aún hay oportunidad de mejorar los resultados, sigamos optimizando.'
          return (
            <div style={{ marginBottom: 28 }}>
              <p style={{
                textAlign: 'center', margin: '0 0 14px',
                fontSize: 13, fontWeight: 500, lineHeight: 1.55,
                color: roi >= 200 ? 'rgba(52,199,89,0.75)'
                     : roi >= 50  ? 'rgba(255,255,255,0.45)'
                     : roi >= 0   ? 'rgba(255,255,255,0.35)'
                     : 'rgba(255,159,10,0.65)',
                letterSpacing: '-0.005em',
              }}>
                {roiMsg}
              </p>
              <RoiPanel spend={data.spend} sales={sales} />
            </div>
          )
        })()}

        {/* ── 7. Empty state + self-onboarding ── */}
        {!loading && data.campaigns.length === 0 && !hasMetaAccount && (
          <ConnectAccountCard onConnected={() => { setHasMetaAccount(true); refetch(); startTour() }} />
        )}

        {/* ── 8. Campañas ── */}
        {data.campaigns.length > 0 && (
          <div style={{ animation: 'fadeUp .45s cubic-bezier(.22,1,.36,1) .28s both' }}>

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}><IconSort /></span>
                <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Campañas</span>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.07)', padding: '2px 9px', borderRadius: 100 }}>
                {data.campaigns.length} total
              </span>
            </div>

            {/* Sort chips */}
            <div className="sort-chips" style={{ marginBottom: 14 }}>
              {SORT_OPTS.map(o => (
                <SortChip key={o.id} label={o.label} active={sortMode === o.id} onClick={() => { setSortMode(o.id); setShowAll(false) }} />
              ))}
            </div>

            {/* Campaign list */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              {visible.map((c, i) => (
                <div key={c.id} style={{ borderBottom: i < visible.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <CampaignRow c={c} i={i} />
                </div>
              ))}
            </div>

            {/* Ver más */}
            {sorted.length > 3 && (
              <motion.button
                onClick={() => setShowAll(v => !v)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.09)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', duration: 0.22, bounce: 0.25 }}
                style={{ width: '100%', marginTop: 10, height: 44, borderRadius: 13, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
              >
                {showAll ? 'Ver menos' : `Ver ${sorted.length - 3} campaña${sorted.length - 3 !== 1 ? 's' : ''} más`}
              </motion.button>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 32 }}>
          Meta Ads · DOGMA · Datos en tiempo real
        </div>
      </main>

      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }

        /* ── Fondo naranja animado (hero del dashboard cliente) ── */
        .db-hero-glow {
          position: absolute;
          width: 180%; height: 180%;
          top: -40%; left: -40%;
          background: radial-gradient(
            ellipse at 50% 30%,
            rgba(255,120,30,0.14) 0%,
            rgba(255,90,0,0.10)  35%,
            transparent 68%
          );
          filter: blur(40px);
          animation: dbGlowDrift 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes dbGlowDrift {
          0%   { transform: translate(0%,    0%)  scale(1);    opacity: 1; }
          33%  { transform: translate(8%,   -5%)  scale(1.08); opacity: 0.75; }
          66%  { transform: translate(-6%,   8%)  scale(1.04); opacity: 0.9; }
          100% { transform: translate(4%,   -10%) scale(1.12); opacity: 0.65; }
        }
        @keyframes pickerIn  { from{opacity:0;transform:translateX(-50%) translateY(10px) scale(0.97)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes tourSlideUp { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes tourIconPop { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
        @keyframes tourFadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes toastIn  { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes toastOut { from{opacity:1;transform:translateX(-50%) translateY(0)} to{opacity:0;transform:translateX(-50%) translateY(10px)} }
        @keyframes pulse          { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes campaignPulse  { 0%{box-shadow:0 0 0 0 rgba(52,199,89,0.45)} 70%{box-shadow:0 0 0 7px rgba(52,199,89,0)} 100%{box-shadow:0 0 0 0 rgba(52,199,89,0)} }

        /* ── Sales glow: amplio, bien difuminado, movimiento orgánico ── */
        .sales-glow {
          position: absolute;
          width: 160%; height: 160%;
          top: -30%; left: -30%;
          background: radial-gradient(
            ellipse at 55% 45%,
            rgba(255,159,10,0.22) 0%,
            rgba(255,120,0,0.10) 35%,
            transparent 70%
          );
          filter: blur(28px);
          animation: salesGlowDrift 9s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes salesGlowDrift {
          0%   { transform: translate(0%,  0%)  scale(1);    opacity: 1; }
          50%  { transform: translate(6%,  4%)  scale(1.06); opacity: 0.8; }
          100% { transform: translate(-4%, 7%)  scale(1.1);  opacity: 0.65; }
        }

        /* ── Sales ripple: glow radial difuso, no círculo plano ── */
        .sales-ripple {
          position: absolute;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255,200,60,0.75) 0%,
            rgba(255,159,10,0.45) 30%,
            rgba(255,100,0,0.15) 60%,
            transparent 100%
          );
          filter: blur(6px);
          transform: translate(-50%,-50%) scale(0.1);
          animation: salesRippleGlow 1100ms cubic-bezier(.2,.8,.3,1) forwards;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes salesRippleGlow {
          0%   { opacity: 1;    transform: translate(-50%,-50%) scale(0.1); filter: blur(4px); }
          35%  { opacity: 0.75; transform: translate(-50%,-50%) scale(7);   filter: blur(18px); }
          100% { opacity: 0;    transform: translate(-50%,-50%) scale(14);  filter: blur(32px); }
        }

        /* ── ROI glow: amplio, color del estado, muy difuminado ── */
        .roi-glow-green, .roi-glow-red {
          position: absolute;
          width: 160%; height: 160%;
          top: -30%; left: -30%;
          filter: blur(36px);
          animation-duration: 13s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          pointer-events: none;
        }
        .roi-glow-green {
          background: radial-gradient(
            ellipse at 60% 40%,
            rgba(52,199,89,0.2) 0%,
            rgba(30,160,60,0.09) 40%,
            transparent 72%
          );
          animation-name: roiDriftGreen;
        }
        .roi-glow-red {
          background: radial-gradient(
            ellipse at 60% 40%,
            rgba(255,69,58,0.2) 0%,
            rgba(200,40,30,0.09) 40%,
            transparent 72%
          );
          animation-name: roiDriftRed;
        }
        @keyframes roiDriftGreen {
          0%   { transform: translate(0%,  0%)  scale(1);   opacity:0.9; }
          100% { transform: translate(5%,  6%)  scale(1.08);opacity:0.6; }
        }
        @keyframes roiDriftRed {
          0%   { transform: translate(0%,  0%)  scale(1);   opacity:0.9; }
          100% { transform: translate(5%,  6%)  scale(1.08);opacity:0.6; }
        }

        /* ── Sort chips ── */
        .sort-chips { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; scrollbar-width:none; }
        .sort-chips::-webkit-scrollbar { display:none; }
        .sort-chip { flex-shrink:0; white-space:nowrap; }

        @media(min-width:560px){ .kpi-grid{ grid-template-columns:repeat(4,1fr) !important } }
      `}</style>

      {/* ── Logout confirm modal ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            key="logout-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.94,  y: 8  }}
              transition={{ type: 'spring', duration: 0.38, bounce: 0.22 }}
              style={{ width: '100%', maxWidth: 340, borderRadius: 24, background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', padding: '28px 24px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
              <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', marginBottom: 8 }}>¿Cerrar sesión?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, marginBottom: 24 }}>
                Tu sesión se cerrará en este dispositivo.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, height: 46, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancelar
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={async () => { setShowLogoutConfirm(false); await signOut() }} style={{ flex: 1, height: 46, borderRadius: 14, border: 'none', background: 'rgba(255,69,58,0.85)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cerrar sesión
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

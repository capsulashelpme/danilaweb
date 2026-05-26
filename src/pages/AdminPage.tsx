import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { ProductsSheet } from '@/components/sections/ProductsSheet'
import { MediaManager } from '@/components/admin/MediaManager'

// ── Types ──────────────────────────────────────────────────────
type ClientStatus = 'active' | 'paused' | 'no_account' | 'error' | 'pending'
type SalesUpdatedBy = 'admin' | 'client'

interface SubInfo {
  plan: 'monthly' | 'annual' | null
  status: string
  current_period_end: string | null
}

interface Client {
  id: string
  full_name: string
  business_name: string
  username: string | null
  created_at: string
  // ads
  meta_ad_account_id: string | null
  label: string | null
  active: boolean | null
  total_sales: number
  sales_updated_by: SalesUpdatedBy | null
  sales_updated_at: string | null
  last_meta_sync_at: string | null
  internal_notes: string | null
  service_start_date: string | null
  service_end_date: string | null
  payment_status: 'paid_monthly' | 'paid_annual' | null
  // subscription
  sub: SubInfo | null
}

interface LastPayment {
  amount: number
  plan: 'monthly' | 'annual' | null
  created_at: string
  status: string
}

interface EditState {
  act: string; label: string; sales: string; notes: string; serviceStartDate: string; serviceEndDate: string
  username: string
}

interface Performance {
  spend: number; results: number; cost_per_result: number; reach: number
}

interface CampaignItem {
  campaign_id: string | null
  campaign_name: string | null
  effective_status: string | null
  manual_status: string | null   // solo lo escribe el admin — el sync nunca lo toca
  spend: number
  results: number
}

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// ── Helpers ────────────────────────────────────────────────────
const fx = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
const fn = (n: number) => new Intl.NumberFormat('es-MX').format(Math.round(n))

function timeAgo(iso: string | null): string {
  if (!iso) return 'Nunca'
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)   return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`
  if (diff < 86400)return `Hace ${Math.floor(diff / 3600)}h`
  if (diff < 604800)return `Hace ${Math.floor(diff / 86400)}d`
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function clientStatus(c: Client): ClientStatus {
  if (!c.meta_ad_account_id) return 'no_account'
  if (c.active === false) return 'paused'
  return 'active'
}

// ── Colors ─────────────────────────────────────────────────────
const C = {
  bg:       '#060606',
  card:     'rgba(255,255,255,0.035)',
  cardHi:   'rgba(255,255,255,0.055)',
  border:   'rgba(255,255,255,0.055)',
  orange:   '#FF6B1A',
  green:    '#30D158',
  red:      '#FF453A',
  amber:    '#FFB340',
  blue:     '#4A9EFF',
  muted:    'rgba(255,255,255,0.32)',
  faint:    'rgba(255,255,255,0.15)',
}

// ── Micro Icons ────────────────────────────────────────────────
const Ico = {
  sync:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  spin:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'adm-spin .7s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
  trash:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
  warn:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  warnLg:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  check:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  chevron: (open: boolean) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}><polyline points="6 9 12 15 18 9"/></svg>,
  users:   () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  dollar:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  target:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  reach:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  home:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>,
  logout:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  play:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  user:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  shield:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  calendar:() => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  card:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  campaign:() => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  stats:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>,
  chat:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  config:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}

// ── Status badge ───────────────────────────────────────────────
function Badge({ status }: { status: ClientStatus }) {
  const map: Record<ClientStatus, { label: string; color: string; bg: string }> = {
    active:     { label: 'Activo',    color: C.green,  bg: `${C.green}18`  },
    paused:     { label: 'Pausado',   color: C.amber,  bg: `${C.amber}18`  },
    no_account: { label: 'Sin cuenta',color: C.faint,  bg: 'rgba(255,255,255,0.07)' },
    error:      { label: 'Error',     color: C.red,    bg: `${C.red}18`    },
    pending:    { label: 'Pendiente', color: C.blue,   bg: `${C.blue}18`   },
  }
  const { label, color, bg } = map[status]
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: bg, border: `1px solid ${color}30`, color, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

// ── Stat card ──────────────────────────────────────────────────
function StatCard({ n, label, color, icon, wide = false }: { n: string | number; label: string; color: string; icon: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{
      gridColumn: wide ? '1 / -1' : undefined,
      borderRadius: 24, padding: wide ? '24px 26px' : '20px 22px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.055)',
      display: 'flex', flexDirection: 'column', gap: 0,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle color hint top-right */}
      <div style={{ position: 'absolute', top: 16, right: 16, color, opacity: 0.55 }}>{icon}</div>
      <div style={{
        fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
        fontSize: wide ? 46 : 32, fontWeight: 800,
        letterSpacing: '-0.04em', color: '#fff', lineHeight: 1,
        marginBottom: 6,
      }}>{n}</div>
      <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

// ── Performance card ───────────────────────────────────────────
function PerfCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ borderRadius: 22, padding: '20px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.055)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 14, right: 14, color, opacity: 0.55 }}>{icon}</div>
      <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

// ── Admin Page ─────────────────────────────────────────────────
export function AdminPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients]         = useState<Client[]>([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState<string | null>(null)
  const [syncing, setSyncing]         = useState(false)
  const [removing, setRemoving]       = useState<string | null>(null)
  const [flash, setFlash]             = useState<{ ok: boolean; msg: string } | null>(null)
  const [editMap, setEditMap]         = useState<Record<string, EditState>>({})
  const [perf, setPerf]               = useState<Performance>({ spend: 0, results: 0, cost_per_result: 0, reach: 0 })
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting]         = useState(false)
  const [lastPayments, setLastPayments] = useState<Record<string, LastPayment>>({})
  const [markingPay, setMarkingPay]     = useState<string | null>(null) // clientId en progreso
  const [blockedAccts, setBlockedAccts] = useState<Set<string>>(new Set()) // act_ IDs sin acceso Meta
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // ── Tab de navegación ──
  type AdminTab = 'stats' | 'clients' | 'opinions' | 'config'
  const [tab, setTab] = useState<AdminTab>('stats')

  // ── Testimonios pendientes ──
  interface TestimonialRow { id: string; name: string; biz: string; service: string | null; text: string; stars: number; status: string; created_at: string }
  const [testimonials,    setTestimonials]    = useState<TestimonialRow[]>([])
  const [loadingTestim,   setLoadingTestim]   = useState(false)
  const [updatingTestim,  setUpdatingTestim]  = useState<string | null>(null)

  const loadTestimonials = async () => {
    setLoadingTestim(true)
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
    setTestimonials(data ?? [])
    setLoadingTestim(false)
  }

  const updateTestimonialStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingTestim(id)
    const { error } = await supabase.from('testimonials').update({ status }).eq('id', id)
    if (error) { toast(false, 'Error al actualizar opinión'); setUpdatingTestim(null); return }
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    setUpdatingTestim(null)
    toast(true, status === 'approved' ? 'Opinión aprobada ✓' : 'Opinión rechazada')
  }

  const deleteTestimonial = async (id: string) => {
    setUpdatingTestim(id)
    await supabase.from('testimonials').delete().eq('id', id)
    setTestimonials(prev => prev.filter(t => t.id !== id))
    setUpdatingTestim(null)
    toast(true, 'Opinión eliminada')
  }

  const toast = (ok: boolean, msg: string) => { setFlash({ ok, msg }); setTimeout(() => setFlash(null), 5000) }

  // Mapea errores técnicos de DB a mensajes amigables (evita exponer estructura interna)
  const dbError = (msg: string) => {
    if (msg.includes('duplicate') || msg.includes('unique')) return 'Este dato ya existe.'
    if (msg.includes('foreign key')) return 'No se puede eliminar, tiene datos asociados.'
    if (msg.includes('permission') || msg.includes('policy')) return 'Sin permiso para esta acción.'
    return 'Error al guardar. Intenta de nuevo.'
  }

  const load = async () => {
    setLoading(true)
    const { data: profiles } = await supabase
      .from('profiles').select('id, full_name, business_name, username, created_at')
      .eq('is_admin', false).order('created_at', { ascending: false })

    const { data: accounts } = await supabase
      .from('client_ad_accounts')
      .select('profile_id, meta_ad_account_id, label, active, total_sales, sales_updated_by, sales_updated_at, last_meta_sync_at, internal_notes, service_start_date, service_end_date, payment_status')

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('profile_id, plan, status, current_period_end')

    // Last payment per client
    const { data: allPayments } = await supabase
      .from('payments')
      .select('profile_id, amount, plan, created_at, status')
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })

    const payMap: Record<string, LastPayment> = {}
    ;(allPayments ?? []).forEach(p => {
      if (!payMap[p.profile_id]) payMap[p.profile_id] = { amount: p.amount, plan: p.plan, created_at: p.created_at, status: p.status }
    })
    setLastPayments(payMap)

    const map    = Object.fromEntries((accounts ?? []).map(a => [a.profile_id, a]))
    const subMap = Object.fromEntries((subs ?? []).map(s => [s.profile_id, s]))

    const rows: Client[] = (profiles ?? []).map(p => ({
      ...p,
      meta_ad_account_id: map[p.id]?.meta_ad_account_id ?? null,
      label:              map[p.id]?.label ?? null,
      active:             map[p.id]?.active ?? null,
      total_sales:        map[p.id]?.total_sales ?? 0,
      sales_updated_by:   map[p.id]?.sales_updated_by ?? null,
      sales_updated_at:   map[p.id]?.sales_updated_at ?? null,
      last_meta_sync_at:  map[p.id]?.last_meta_sync_at ?? null,
      internal_notes:      map[p.id]?.internal_notes ?? null,
      service_start_date:  map[p.id]?.service_start_date ?? null,
      service_end_date:    map[p.id]?.service_end_date ?? null,
      payment_status:      map[p.id]?.payment_status ?? null,
      sub:                subMap[p.id] ? { plan: subMap[p.id].plan, status: subMap[p.id].status, current_period_end: subMap[p.id].current_period_end } : null,
    }))
    setClients(rows)

    const m: Record<string, EditState> = {}
    rows.forEach(r => {
      m[r.id] = {
        act:              r.meta_ad_account_id ?? '',
        label:            r.label ?? r.business_name ?? '',
        sales:            r.total_sales?.toString() ?? '',
        notes:            r.internal_notes ?? '',
        serviceStartDate: r.service_start_date ?? '',
        serviceEndDate:   r.service_end_date ?? '',
        username:         r.username ?? '',
      }
    })
    setEditMap(m)

    // Aggregate performance from meta_metrics
    const { data: metrics } = await supabase.from('meta_metrics').select('spend, results, reach, cost_per_result')
    if (metrics && metrics.length > 0) {
      const totalSpend   = metrics.reduce((s, m) => s + (m.spend || 0), 0)
      const totalResults = metrics.reduce((s, m) => s + (m.results || 0), 0)
      const totalReach   = metrics.reduce((s, m) => s + (m.reach || 0), 0)
      setPerf({ spend: totalSpend, results: totalResults, cost_per_result: totalResults ? totalSpend / totalResults : 0, reach: totalReach })
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
    loadTestimonials()

    // Realtime: refrescar lista de testimonios cuando cambie cualquier fila
    const ch = supabase
      .channel('admin-testimonials-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        loadTestimonials()
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [])

  // ── Guardar TODO: username + cuenta + campos de cliente ───────
  const saveAll = async (id: string) => {
    setSaving(id)
    const client = clients.find(c => c.id === id)
    const { act, label, sales, notes } = editMap[id] ?? {}

    // 1. Guardar @username si tiene valor
    const raw = (editMap[id]?.username ?? '').trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '')
    if (raw) {
      const { data: existing } = await supabase
        .from('profiles').select('id').ilike('username', raw).neq('id', id).maybeSingle()
      if (existing) {
        setSaving(null)
        toast(false, `@${raw} ya está en uso por otro cliente`)
        return
      }
      const { error: ue } = await supabase.from('profiles').update({ username: raw }).eq('id', id)
      if (ue) { setSaving(null); toast(false, ue.message); return }
      setClients(prev => prev.map(c => c.id === id ? { ...c, username: raw } : c))
    }

    // 2. Guardar client_ad_accounts
    const actTrimmed = (act ?? '').trim()
    const hasAccount = !!client?.meta_ad_account_id

    // Si no hay cuenta y no hay act_id escrito, solo guardamos el username
    if (!hasAccount && !actTrimmed) {
      setSaving(null)
      if (raw) toast(true, 'Cambios guardados correctamente')
      else toast(false, 'Ingresa el Ad Account ID para guardar')
      return
    }

    const norm = actTrimmed
      ? (actTrimmed.startsWith('act_') ? actTrimmed : `act_${actTrimmed}`)
      : client!.meta_ad_account_id!

    const { error } = await supabase.from('client_ad_accounts').upsert({
      profile_id: id, meta_ad_account_id: norm,
      label: (label ?? '').trim() || null, active: true,
      assigned_by: profile?.id,
      total_sales: parseFloat(sales ?? '') || 0,
      sales_updated_by: 'admin',
      sales_updated_at: new Date().toISOString(),
      internal_notes: (notes ?? '').trim() || null,
      service_start_date: editMap[id]?.serviceStartDate || null,
      service_end_date:   editMap[id]?.serviceEndDate   || null,
    }, { onConflict: 'profile_id' })

    setSaving(null)
    if (error) toast(false, dbError(error.message))
    else { toast(true, 'Cambios guardados correctamente'); load() }
  }

  // ── Utilidad: calcular fecha fin desde inicio + plan ──────────
  const calcEnd = (start: string, status: 'paid_monthly' | 'paid_annual') => {
    const d = new Date(start + 'T00:00:00')
    d.setDate(d.getDate() + (status === 'paid_annual' ? 365 : 30))
    return d.toISOString().split('T')[0]
  }

  // ── Validar formato de fecha YYYY-MM-DD ──────────────────────
  const isValidDate = (s: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime())

  // ── Guardar periodo en tiempo real (inicio cambia → recalcula fin) ──
  const updateServicePeriod = async (id: string, rawStart: string) => {
    // Sanitizar: si el valor no es una fecha válida YYYY-MM-DD, tratar como vacío
    const startDate = rawStart && isValidDate(rawStart) ? rawStart : ''
    const client = clients.find(c => c.id === id)
    const payStatus = client?.payment_status ?? null
    const endDate = (startDate && payStatus) ? calcEnd(startDate, payStatus) : null

    // Actualiza UI inmediatamente
    setEditMap(prev => ({
      ...prev,
      [id]: { ...prev[id], serviceStartDate: startDate, serviceEndDate: endDate ?? '' },
    }))
    setClients(prev => prev.map(c =>
      c.id === id ? { ...c, service_start_date: startDate || null, service_end_date: endDate } : c
    ))

    // Persiste en DB
    await supabase.from('client_ad_accounts').update({
      service_start_date: startDate || null,
      service_end_date:   endDate,
    }).eq('profile_id', id)
  }

  // ── Marcar pago (también recalcula fechas si hay inicio) ──────
  const markPayment = async (id: string, status: 'paid_monthly' | 'paid_annual' | null) => {
    setMarkingPay(id)
    const today = new Date().toISOString().split('T')[0]
    const existingStart = editMap[id]?.serviceStartDate || today
    const startDate = status ? existingStart : null
    const endDate   = (status && startDate) ? calcEnd(startDate, status) : null

    // Actualiza UI inmediatamente
    setEditMap(prev => ({
      ...prev,
      [id]: { ...prev[id], serviceStartDate: startDate ?? '', serviceEndDate: endDate ?? '' },
    }))
    setClients(prev => prev.map(c =>
      c.id === id ? { ...c, payment_status: status, service_start_date: startDate, service_end_date: endDate } : c
    ))

    await supabase.from('client_ad_accounts').update({
      payment_status:     status,
      service_start_date: startDate,
      service_end_date:   endDate,
    }).eq('profile_id', id)

    setMarkingPay(null)
  }

  const removeAccount = async (id: string, name: string) => {
    setRemoving(id)
    await supabase.from('client_ad_accounts').delete().eq('profile_id', id)
    await supabase.from('meta_metrics').delete().eq('profile_id', id)
    setRemoving(null)
    toast(true, `${name} desconectado`)
    load()
  }

  const deleteClient = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    const { id, name } = confirmDelete

    const r1 = await supabase.from('meta_metrics').delete().eq('profile_id', id)
    const r2 = await supabase.from('client_ad_accounts').delete().eq('profile_id', id)
    const r3 = await supabase.from('profiles').delete().eq('id', id)

    setDeleting(false)
    setConfirmDelete(null)

    const err = r1.error?.message || r2.error?.message || r3.error?.message
    if (err) { toast(false, `Error: ${err}`); return }

    toast(true, `${name} eliminado`)
    load()
  }

  const syncNow = async () => {
    setSyncing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-meta-metrics`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      })
      const json = await res.json()
      if (json.ok) {
        // Update last_meta_sync_at for connected clients
        const connected = clients.filter(c => !!c.meta_ad_account_id).map(c => c.id)
        if (connected.length > 0) {
          await supabase.from('client_ad_accounts').update({ last_meta_sync_at: new Date().toISOString() }).in('profile_id', connected)
        }
        const results: Record<string,unknown>[] = json.results ?? []
        const blocked = results.filter(r => (r.error as string ?? '').includes('access blocked'))
        const realErr = results.filter(r => r.error && !(r.error as string).includes('access blocked'))
        const ok      = results.filter(r => !r.error)

        // Guarda qué act_ IDs están bloqueados para mostrar badge en tarjeta
        setBlockedAccts(new Set(blocked.map(r => r.meta_ad_account_id as string).filter(Boolean)))

        // Solo muestra errores reales (no los de permisos Meta)
        if (realErr.length) {
          toast(false, realErr.map(r => `${r.meta_ad_account_id}: ${r.error}`).join(' · '))
        } else if (json.processed === 0) {
          toast(true, json.message ?? 'Sin cuentas activas')
        } else if (ok.length) {
          toast(true, `Sync completa · ${ok.length} cuenta${ok.length !== 1 ? 's' : ''} actualizada${ok.length !== 1 ? 's' : ''}`)
        } else {
          // Todas bloqueadas — sync técnicamente ok, sin datos nuevos
          toast(true, 'Sync completa')
        }
        load()
      } else toast(false, json.error ?? 'Error en sync')
    } catch (e) { toast(false, String(e)) }
    setSyncing(false)
  }

  // Derived stats
  const totalSales     = clients.reduce((s, c) => s + (c.total_sales || 0), 0)
  const connected      = clients.filter(c => !!c.meta_ad_account_id).length
  const active         = clients.filter(c => clientStatus(c) === 'active').length
  const needsAttention = clients.filter(c => clientStatus(c) !== 'active')
  const subActive      = clients.filter(c => c.sub?.status === 'active').length
  const subPastDue     = clients.filter(c => c.sub?.status === 'past_due').length

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif', position: 'relative', overflowX: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: -100, right: -60, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${C.orange}15 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -80, left: -60, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${C.blue}08 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />

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
        {/* Inicio */}
        <button onClick={() => navigate('/')} aria-label="Inicio"
          style={{ width: 44, height: 44, borderRadius: '50%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'color .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)' }}>
          <Ico.home />
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />

        {/* ── Tabs de sección ── */}
        {([
          { id: 'stats'   as AdminTab, label: 'Resumen',       icon: <Ico.stats />  },
          { id: 'clients' as AdminTab, label: 'Clientes',      icon: <Ico.users />  },
          { id: 'opinions'as AdminTab, label: 'Opiniones',     icon: <Ico.chat />   },
          { id: 'config'  as AdminTab, label: 'Configuración', icon: <Ico.config /> },
        ]).map(t => {
          const isActive = tab === t.id
          const pending  = t.id === 'opinions' ? testimonials.filter(x => x.status === 'pending').length : 0
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-label={t.label}
              style={{
                position: 'relative',
                height: 44, padding: '0 14px', borderRadius: 999,
                background: isActive ? `${C.orange}18` : 'none',
                border: isActive ? `1px solid ${C.orange}40` : '1px solid transparent',
                color: isActive ? C.orange : 'rgba(255,255,255,0.55)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)' }}
            >
              {t.icon}
              <span style={{ display: 'none' /* label solo para ARIA */ }}>{t.label}</span>
              {pending > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: C.orange, border: '1.5px solid rgba(6,6,6,0.9)' }} />
              )}
            </button>
          )
        })}

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />

        {/* Sync */}
        <button onClick={syncNow} disabled={syncing} aria-label="Sincronizar"
          style={{ width: 44, height: 44, borderRadius: '50%', background: 'none', border: 'none', color: syncing ? C.orange : 'rgba(255,255,255,0.55)', cursor: syncing ? 'wait' : 'pointer', display: 'grid', placeItems: 'center', transition: 'color .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.orange }}
          onMouseLeave={e => { if (!syncing) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)' }}>
          {syncing ? <Ico.spin /> : <Ico.sync />}
        </button>

        {/* Salir */}
        <button onClick={() => setShowLogoutConfirm(true)} aria-label="Salir"
          style={{ width: 44, height: 44, borderRadius: '50%', background: 'none', border: 'none', color: 'rgba(255,80,80,0.55)', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'color .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF5050' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,80,80,0.55)' }}>
          <Ico.logout />
        </button>
      </nav>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 120px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* ══════════════════════════════════════════
            TAB: ESTADÍSTICAS
        ══════════════════════════════════════════ */}
        {tab === 'stats' && <>

        {/* ── Hero section ── */}
        <div style={{ padding: '120px 0 32px', textAlign: 'center' }}>
          {/* Greeting */}
          <div style={{ fontSize: 15, color: C.muted, fontWeight: 500, marginBottom: 8, letterSpacing: '-0.01em' }}>
            {(() => {
              const hour = parseInt(new Date().toLocaleString('es-MX', { timeZone: 'America/Chihuahua', hour: 'numeric', hour12: false }), 10)
              if (hour >= 6  && hour < 12) return 'Buenos días, Dani ☀️'
              if (hour >= 12 && hour < 19) return 'Buenas tardes, Dani 🌤️'
              return 'Buenas noches, Dani 🌙'
            })()}
          </div>
          {/* Main number */}
          <div style={{
            fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
            fontSize: 'clamp(52px, 14vw, 72px)', fontWeight: 800,
            letterSpacing: '-0.05em', color: '#fff', lineHeight: 1,
            marginBottom: 6,
          }}>
            {loading ? '—' : fx(totalSales)}
          </div>
          <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>Ventas registradas</div>

          {/* ── Acción rápida pills ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28 }}>
            {[
              {
                label: 'Sync',
                icon: syncing
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'adm-spin .7s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
                action: syncNow,
                disabled: syncing,
              },
              {
                label: 'Meta Ads',
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
                action: () => window.open('https://adsmanager.facebook.com', '_blank'),
                disabled: false,
              },
              {
                label: 'Inicio',
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>,
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
                  color: btn.disabled ? C.muted : 'rgba(255,255,255,0.8)',
                  fontSize: 13, fontWeight: 600, cursor: btn.disabled ? 'wait' : 'pointer',
                  fontFamily: 'inherit', transition: 'all .15s',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => { if (!btn.disabled) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = btn.disabled ? C.muted : 'rgba(255,255,255,0.8)' }}
              >
                {btn.icon}{btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Resumen (mini stats row) ── */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Resumen</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
            <StatCard n={clients.length} label="Clientes totales"      color={C.orange} icon={<Ico.users />} />
            <StatCard n={active}         label="Clientes activos"      color={C.green}  icon={<Ico.check />} />
            <StatCard n={connected}      label="Cuentas conectadas"    color={C.blue}   icon={<Ico.target />} />
            <StatCard n={subActive}      label="Suscripciones activas" color={C.green}  icon={<Ico.check />} />
            {subPastDue > 0 && <StatCard n={subPastDue} label="Pagos pendientes" color={C.red} icon={<Ico.warnLg />} />}
          </div>
        </section>

        {/* ── Pagos recientes ── */}
        {Object.keys(lastPayments).length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <SectionLabel>Pagos recientes</SectionLabel>
            <div style={{ marginTop: 14, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {clients
                .filter(c => lastPayments[c.id])
                .sort((a, b) => new Date(lastPayments[b.id].created_at).getTime() - new Date(lastPayments[a.id].created_at).getTime())
                .slice(0, 5)
                .map((c, i, arr) => {
                  const p = lastPayments[c.id]
                  const fx2 = (cents: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(cents / 100)
                  return (
                    <div key={c.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(48,209,88,0.08)', display: 'grid', placeItems: 'center', color: C.green, flexShrink: 0 }}>
                        <Ico.card />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label || c.full_name || '—'}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          {p.plan === 'annual' ? 'Anual' : 'Mensual'} · {new Date(p.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.green, fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>{fx2(p.amount)}</div>
                    </div>
                  )
                })}
            </div>
          </section>
        )}

        {/* ── Performance ── */}
        {perf.spend > 0 && (
          <section style={{ marginBottom: 32 }}>
            <SectionLabel>Meta Ads · últimos 30 días</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              <PerfCard label="Inversión total"      value={fx(perf.spend)}           icon={<Ico.dollar />} color={C.orange} />
              <PerfCard label="Resultados"           value={fn(perf.results)}         icon={<Ico.target />} color={C.green} />
              <PerfCard label="Alcance total"        value={fn(perf.reach)}           icon={<Ico.reach />}  color={C.blue} />
              <PerfCard label="Costo / resultado"    value={perf.cost_per_result > 0 ? fx(perf.cost_per_result) : '—'} icon={<Ico.target />} color={C.amber} />
            </div>
          </section>
        )}

        {/* ── Alerts ── */}
        {needsAttention.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <SectionLabel>Requieren atención</SectionLabel>
            <div style={{ marginTop: 14, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,179,64,0.15)`, overflow: 'hidden' }}>
              {needsAttention.map((c, i) => (
                <div key={c.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < needsAttention.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: clientStatus(c) === 'paused' ? C.amber : C.faint, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label || c.full_name || '—'}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{clientStatus(c) === 'no_account' ? 'Sin cuenta publicitaria' : 'Sync pausada'}</div>
                  </div>
                  <Badge status={clientStatus(c)} />
                </div>
              ))}
            </div>
          </section>
        )}

        </> /* fin tab stats */}

        {/* ══════════════════════════════════════════
            TAB: CLIENTES
        ══════════════════════════════════════════ */}
        {tab === 'clients' && (
          <section style={{ paddingTop: 100 }}>
            <SectionLabel>Clientes</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {loading ? [1,2].map(i => <div key={i} style={{ height: 80, borderRadius: 22, background: C.card, animation: 'adm-pulse 1.4s ease infinite' }} />) :
                clients.length === 0 ? <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted, fontSize: 14 }}>No hay clientes aún.</div> :
                clients.map(c => (
                  <ClientCard key={c.id} client={c} edit={editMap[c.id] ?? { act: '', label: '', sales: '', notes: '', serviceEndDate: '', username: '' }}
                    saving={saving === c.id} removing={removing === c.id}
                    markingPay={markingPay === c.id}
                    metaBlocked={c.meta_ad_account_id ? blockedAccts.has(c.meta_ad_account_id) : false}
                    lastPayment={lastPayments[c.id]}
                    onAct={v => setEditMap(p => ({ ...p, [c.id]: { ...p[c.id], act: v } }))}
                    onLabel={v => setEditMap(p => ({ ...p, [c.id]: { ...p[c.id], label: v } }))}
                    onSales={v => setEditMap(p => ({ ...p, [c.id]: { ...p[c.id], sales: v } }))}
                    onNotes={v => setEditMap(p => ({ ...p, [c.id]: { ...p[c.id], notes: v } }))}
                    onUsername={v => setEditMap(p => ({ ...p, [c.id]: { ...p[c.id], username: v.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30) } }))}
                    onServicePeriodChange={(start) => updateServicePeriod(c.id, start)}
                    onSave={() => saveAll(c.id)}
                    onRemove={() => removeAccount(c.id, c.label ?? c.full_name ?? 'cliente')}
                    onDelete={() => setConfirmDelete({ id: c.id, name: c.label ?? c.full_name ?? 'cliente' })}
                    onMarkPayment={(status) => markPayment(c.id, status)}
                  />
                ))
              }
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            TAB: OPINIONES
        ══════════════════════════════════════════ */}
        {tab === 'opinions' && (
          <section style={{ paddingTop: 100 }}>
            <SectionLabel>Opiniones de clientes</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {loadingTestim ? (
                [1,2].map(i => <div key={i} style={{ height: 80, borderRadius: 16, background: C.card, animation: 'adm-pulse 1.4s ease infinite' }} />)
              ) : testimonials.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted, fontSize: 14 }}>No hay opiniones aún.</div>
              ) : testimonials.map(t => {
                const isBusy = updatingTestim === t.id
                const statusColor = t.status === 'approved' ? C.green : t.status === 'rejected' ? C.red : C.orange
                const statusLabel = t.status === 'approved' ? 'Aprobada' : t.status === 'rejected' ? 'Rechazada' : 'Pendiente'
                return (
                  <div key={t.id} style={{ background: C.card, borderRadius: 18, padding: '16px 18px', border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{t.name} <span style={{ color: C.muted, fontWeight: 400, fontSize: 12 }}>· {t.biz}</span></div>
                        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                          {t.service ?? '—'} · {new Date(t.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: `${statusColor}18`, borderRadius: 999, padding: '3px 10px', flexShrink: 0 }}>
                        {statusLabel}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < t.stars ? C.orange : C.border}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                    <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.5, margin: '0 0 14px' }}>"{t.text}"</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {t.status !== 'approved' && (
                        <button disabled={isBusy} onClick={() => updateTestimonialStatus(t.id, 'approved')}
                          style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `${C.green}18`, color: C.green, fontWeight: 600, fontSize: 12.5, opacity: isBusy ? 0.5 : 1 }}>
                          ✓ Aprobar
                        </button>
                      )}
                      {t.status !== 'rejected' && (
                        <button disabled={isBusy} onClick={() => updateTestimonialStatus(t.id, 'rejected')}
                          style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `${C.red}18`, color: C.red, fontWeight: 600, fontSize: 12.5, opacity: isBusy ? 0.5 : 1 }}>
                          ✕ Rechazar
                        </button>
                      )}
                      <button disabled={isBusy} onClick={() => deleteTestimonial(t.id)}
                        style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`, cursor: 'pointer', background: 'transparent', color: C.muted, fontWeight: 600, fontSize: 12.5, opacity: isBusy ? 0.5 : 1 }}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            TAB: CONFIGURACIÓN
        ══════════════════════════════════════════ */}
        {tab === 'config' && (
          <section style={{ paddingTop: 100 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>
                Configuración
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Contenido de la web
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
                Sube o elimina imágenes y videos. Los cambios se reflejan en la web al instante, sin tocar código.
              </div>
            </div>

            {/* ── Badge del encabezado ── */}
            <HeroBadgeEditor />

            <div style={{ height: 32 }} />
            <MediaManager />
          </section>
        )}

      </main>

      {/* ── Toast notification (top-center, iOS style) ── */}
      {flash && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 300,
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '11px 16px',
          borderRadius: 100,
          background: flash.ok ? 'rgba(15,30,18,0.92)' : 'rgba(30,10,10,0.92)',
          border: `1px solid ${flash.ok ? 'rgba(48,209,88,0.25)' : 'rgba(255,69,58,0.25)'}`,
          color: flash.ok ? C.green : C.red,
          fontSize: 13, fontWeight: 600,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${flash.ok ? 'rgba(48,209,88,0.08)' : 'rgba(255,69,58,0.08)'}`,
          whiteSpace: 'nowrap', maxWidth: '90vw',
          animation: 'adm-toast-in .25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <span style={{ display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            {flash.ok ? <Ico.check /> : <Ico.warn />}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{flash.msg}</span>
          <button onClick={() => setFlash(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18, lineHeight: 1, opacity: 0.5, padding: '0 0 0 4px', flexShrink: 0 }}>×</button>
        </div>
      )}

      {/* ── Confirm delete modal ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 360, borderRadius: 24, background: '#1A1A1A', border: `1px solid ${C.border}`, padding: '28px 24px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${C.red}15`, display: 'grid', placeItems: 'center', marginBottom: 16 }}>
              <Ico.trash />
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', marginBottom: 8 }}>¿Eliminar cliente?</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 24 }}>
              Se eliminará <strong style={{ color: '#fff' }}>{confirmDelete.name}</strong> junto con todas sus métricas, cuenta publicitaria y datos asociados.<br />
              <span style={{ color: C.red }}>Esta acción no se puede deshacer.</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, height: 46, borderRadius: 14, border: `1px solid ${C.border}`, background: C.cardHi, color: C.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={deleteClient} disabled={deleting} style={{ flex: 1, height: 46, borderRadius: 14, border: 'none', background: deleting ? `${C.red}55` : C.red, color: '#fff', fontWeight: 700, fontSize: 14, cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {deleting ? <><Ico.spin />Eliminando…</> : 'Eliminar cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Logout confirm modal ── */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 340, borderRadius: 24, background: '#1A1A1A', border: `1px solid ${C.border}`, padding: '28px 24px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', animation: 'adm-overlay-in .2s ease both' }}>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', marginBottom: 8 }}>¿Cerrar sesión?</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 24 }}>
              Tu sesión se cerrará en este dispositivo.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, height: 46, borderRadius: 14, border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.04)', color: C.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={async () => { setShowLogoutConfirm(false); await signOut(); navigate('/') }} style={{ flex: 1, height: 46, borderRadius: 14, border: 'none', background: 'rgba(255,69,58,0.85)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes adm-spin       { to { transform:rotate(360deg) } }
        @keyframes adm-pulse      { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes adm-campPulse  { 0%{box-shadow:0 0 0 0 rgba(48,209,88,0.5)} 70%{box-shadow:0 0 0 5px rgba(48,209,88,0)} 100%{box-shadow:0 0 0 0 rgba(48,209,88,0)} }
        @keyframes adm-toast-in   { from { opacity:0; transform:translateX(-50%) translateY(-10px) scale(0.92) } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1) } }
        @keyframes adm-overlay-in { from { opacity:0 } to { opacity:1 } }
        @keyframes adm-drawer-in  { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>
    </div>
  )
}

// ── Section label ──────────────────────────────────────────────
// ── Editor del badge del encabezado ──────────────────────────
function HeroBadgeEditor() {
  const [text,    setText]    = useState('')
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.from('site_settings').select('value').eq('key', 'hero_badge').single()
      .then(({ data }) => {
        if (!mounted) return
        if (data?.value) setText(data.value)
        setLoading(false)
      })

    // Realtime — escucha cambios del admin para actualizar el editor en vivo
    const ch = supabase
      .channel(`hero-badge-editor-${Date.now()}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.hero_badge',
      }, (payload) => {
        if (!mounted) return
        const v = (payload.new as { value?: string }).value
        if (v != null && v !== '') { setText(v); setSaved(true); setTimeout(() => setSaved(false), 2000) }
      })
      .subscribe()

    return () => { mounted = false; supabase.removeChannel(ch) }
  }, [])

  const save = async () => {
    if (!text.trim()) return
    setSaving(true)
    setSaveErr(null)
    // UPDATE explícito (la fila siempre existe gracias al seed de la migración)
    const { error } = await supabase
      .from('site_settings')
      .update({ value: text.trim(), updated_at: new Date().toISOString() })
      .eq('key', 'hero_badge')
    setSaving(false)
    if (error) { setSaveErr('Error al guardar: ' + error.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '18px 20px', marginBottom: 4,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>
        Badge del encabezado
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12, lineHeight: 1.5 }}>
        El texto del indicador amarillo que aparece en el inicio de la web.<br/>
        Ej: "2 espacios disponibles", "Agenda tu llamada", "Cupos llenos"…
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={loading ? '' : text}
          onChange={e => { setText(e.target.value); setSaved(false) }}
          placeholder="2 espacios disponibles"
          maxLength={60}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '10px 14px',
            color: '#fff', fontSize: 13, outline: 'none',
          }}
          onKeyDown={e => { if (e.key === 'Enter') save() }}
        />
        <button
          onClick={save}
          disabled={saving || loading}
          style={{
            padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: saved ? 'rgba(46,204,113,0.15)' : C.orange,
            color: saved ? '#2ecc71' : '#fff',
            fontWeight: 700, fontSize: 13, flexShrink: 0,
            transition: 'background .2s, color .2s',
          }}
        >
          {saving ? '…' : saved ? '✓ Guardado' : 'Guardar'}
        </button>
      </div>
      {saveErr && <div style={{ marginTop: 7, fontSize: 11, color: C.red }}>{saveErr}</div>}
      {/* Preview */}
      {text && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: C.muted }}>Vista previa:</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 11px 4px 8px',
            border: '1px solid rgba(255,196,0,0.3)',
            borderRadius: 999,
            background: 'rgba(255,196,0,0.07)',
            fontSize: 11, color: '#FFC400', fontWeight: 600,
          }}>
            <span style={{ width: 5, height: 5, background: '#FFC400', borderRadius: '50%', flexShrink: 0 }}/>
            {text}
          </span>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      {children}
    </div>
  )
}

// ── Subscription badge ─────────────────────────────────────────
function SubBadge({ sub, paymentStatus }: {
  sub: SubInfo | null
  paymentStatus: 'paid_monthly' | 'paid_annual' | null
}) {
  // Prioridad 1: estado de Stripe (más confiable)
  if (sub && sub.status !== 'inactive') {
    const daysLeft = sub.current_period_end
      ? Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / 86400000)
      : null
    if (sub.status === 'past_due') return (
      <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,59,48,0.15)', color: '#FF3B30', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
        Pago pendiente
      </span>
    )
    if (sub.status === 'canceled') return (
      <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
        Cancelado
      </span>
    )
    if (daysLeft !== null && daysLeft <= 5) return (
      <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,159,10,0.15)', color: '#FF9F0A', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
        Vence en {daysLeft}d
      </span>
    )
    return (
      <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(52,199,89,0.12)', color: '#34C759', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        {sub.plan === 'annual' ? 'Anual' : 'Mensual'}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
    )
  }

  // Prioridad 2: pago manual marcado por el admin
  if (paymentStatus === 'paid_monthly') return (
    <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(52,199,89,0.12)', color: '#34C759', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      Mensual
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  )
  if (paymentStatus === 'paid_annual') return (
    <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(52,199,89,0.12)', color: '#34C759', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      Anual
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  )

  // Sin pago en ningún lado
  return (
    <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
      Sin pago
    </span>
  )
}

// ── Sección colapsable interna del drawer ─────────────────────
function DrawerSection({ title, defaultOpen = false, children, accent }: { title: string; defaultOpen?: boolean; children: React.ReactNode; accent?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  const ac = accent ?? 'rgba(255,255,255,0.18)'
  return (
    <div style={{ borderRadius: 18, background: open ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 10, overflow: 'hidden', transition: 'background .2s' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', padding: '15px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: open ? ac : 'rgba(255,255,255,0.12)', transition: 'background .2s', flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: open ? '#fff' : 'rgba(255,255,255,0.45)', letterSpacing: '-0.01em', transition: 'color .2s' }}>{title}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={open ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'} strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div style={{ padding: '0 18px 18px' }}>{children}</div>}
    </div>
  )
}

// ── Client Card ────────────────────────────────────────────────
function ClientCard({ client, edit, saving, removing, lastPayment, markingPay, metaBlocked, onAct, onLabel, onSales, onNotes, onUsername, onServicePeriodChange, onSave, onRemove, onDelete, onMarkPayment }: {
  client: Client; edit: EditState
  saving: boolean; removing: boolean; markingPay: boolean; metaBlocked: boolean
  lastPayment: LastPayment | undefined
  onAct:(v:string)=>void; onLabel:(v:string)=>void; onSales:(v:string)=>void; onNotes:(v:string)=>void; onUsername:(v:string)=>void
  onServicePeriodChange:(start:string)=>void
  onSave:()=>void; onRemove:()=>void; onDelete:()=>void
  onMarkPayment:(status:'paid_monthly'|'paid_annual'|null)=>void
}) {
  const [open, setOpen] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const status = clientStatus(client)
  const name   = client.label || client.full_name || '—'
  const hue    = (client.id.charCodeAt(0) * 19 + client.id.charCodeAt(2) * 7) % 360

  // ── Campañas del cliente ─────────────────────────────────────
  const [campaigns,       setCampaigns]       = useState<CampaignItem[]>([])
  const [loadingCamps,    setLoadingCamps]    = useState(false)
  const [togglingCamp,    setTogglingCamp]    = useState<string | null>(null)

  useEffect(() => {
    if (!open || !client.meta_ad_account_id) return
    const fetch = async () => {
      setLoadingCamps(true)
      const { data } = await supabase
        .from('meta_metrics')
        .select('campaign_id, campaign_name, effective_status, manual_status, spend, results')
        .eq('profile_id', client.id)
        .order('spend', { ascending: false })
      setCampaigns((data as CampaignItem[]) ?? [])
      setLoadingCamps(false)
    }
    fetch()
  }, [open, client.id, client.meta_ad_account_id])

  const toggleCampaignStatus = async (camp: CampaignItem) => {
    if (!camp.campaign_id || togglingCamp) return
    setTogglingCamp(camp.campaign_id)
    // Determina el estado actual visible (manual tiene prioridad)
    const currentStatus = camp.manual_status ?? camp.effective_status
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    // Escribe SOLO en manual_status — el sync nunca toca esta columna
    await supabase
      .from('meta_metrics')
      .update({ manual_status: newStatus })
      .eq('profile_id', client.id)
      .eq('campaign_id', camp.campaign_id)
    setCampaigns(prev => prev.map(c =>
      c.campaign_id === camp.campaign_id ? { ...c, manual_status: newStatus } : c
    ))
    setTogglingCamp(null)
  }

  const daysBetween = (a: string, b: string) =>
    Math.ceil((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)

  // Días restantes: fin − hoy
  const serviceLeft = client.service_end_date
    ? Math.ceil((new Date(client.service_end_date + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    : null

  // Total días del contrato (inicio → fin), para la barra de progreso
  const totalDays = (client.service_start_date && client.service_end_date)
    ? daysBetween(client.service_start_date, client.service_end_date)
    : null

  // % transcurrido
  const progressPct = (totalDays && totalDays > 0 && serviceLeft !== null)
    ? Math.min(100, Math.max(0, Math.round(((totalDays - serviceLeft) / totalDays) * 100)))
    : null

  return (
    <>
    {/* ── Fila de la lista de clientes ── */}
    <div style={{ borderRadius: 20, background: 'rgba(255,255,255,0.035)', border: `1px solid rgba(255,255,255,0.06)`, overflow: 'hidden' }}>
      <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `hsl(${hue},20%,14%)`, border: `1px solid hsl(${hue},20%,20%)`, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16, color: `hsl(${hue},35%,55%)`, flexShrink: 0, letterSpacing: '-0.01em' }}>
          {name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
            {client.username && <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)' }}>@{client.username}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1, flexWrap: 'wrap' }}>
            {client.total_sales > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(48,209,88,0.8)', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>{fx(client.total_sales)}</span>}
            {serviceLeft !== null && serviceLeft <= 5 && <span style={{ fontSize: 11, color: serviceLeft <= 0 ? 'rgba(255,69,58,0.85)' : 'rgba(255,179,64,0.85)', fontWeight: 600 }}>{serviceLeft <= 0 ? 'Vencido' : `${serviceLeft}d restantes`}</span>}
            {client.last_meta_sync_at && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Sync {timeAgo(client.last_meta_sync_at)}</span>}
            {!client.last_meta_sync_at && !client.total_sales && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>{client.business_name || 'Sin datos'}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Badge status={status} />
            <SubBadge sub={client.sub} paymentStatus={client.payment_status} />
          </div>
          {metaBlocked && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: 'rgba(255,159,10,0.06)', color: 'rgba(255,159,10,0.5)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sin acceso Meta</span>}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" style={{ marginTop: 2 }}><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </button>
    </div>

    {/* ── Bottom Sheet ── */}
    {open && (
      <>
        {/* Overlay */}
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'adm-overlay-in .22s ease forwards' }} />

        {/* Drawer */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 160,
          height: '82vh',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)',
          borderRadius: '28px 28px 0 0',
          border: '1px solid rgba(255,255,255,0.10)',
          borderBottom: 'none',
          boxShadow: '0 -24px 80px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'adm-drawer-in .38s cubic-bezier(.16,1,.3,1) forwards',
        }}>

          {/* ── Header del drawer ── */}
          <div style={{ flexShrink: 0, padding: '10px 20px 0' }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.12)', margin: '0 auto 16px' }} />

            {/* Identidad del cliente */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Avatar grande */}
              <div style={{ width: 48, height: 48, borderRadius: 15, background: `linear-gradient(135deg, hsl(${hue},30%,16%), hsl(${hue},25%,11%))`, border: `1.5px solid hsl(${hue},25%,22%)`, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18, color: `hsl(${hue},50%,62%)`, flexShrink: 0, letterSpacing: '-0.02em', boxShadow: `0 4px 16px hsl(${hue},30%,10%)` }}>
                {name[0].toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                  <Badge status={status} />
                  <SubBadge sub={client.sub} paymentStatus={client.payment_status} />
                  {client.username && <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>@{client.username}</span>}
                </div>
              </div>

              {/* Cerrar */}
              <button onClick={() => setOpen(false)} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.11)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          {/* ── Scrollable content — padding-bottom amplio para que el dock no tape ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 140px' }}>

            {/* ── 1. Fechas de servicio ── */}
            <DrawerSection title="Fechas de servicio" accent={C.blue}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}><Ico.calendar />Inicio de servicio</div>
                  <input type="date" value={edit.serviceStartDate} onChange={e => onServicePeriodChange(e.target.value)}
                    style={{ width: '100%', height: 44, padding: '0 14px', boxSizing: 'border-box', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', colorScheme: 'dark', transition: 'border-color .15s', cursor: 'pointer' }}
                    onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = `0 0 0 3px ${C.blue}18` }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none' }}
                  />
                  {!client.payment_status && edit.serviceStartDate && <div style={{ fontSize: 10, color: 'rgba(255,179,64,0.7)', marginTop: 4 }}>Elige el estado de pago para calcular el fin</div>}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Ico.calendar />Fin de servicio</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>{client.payment_status === 'paid_annual' ? '+365 días' : client.payment_status === 'paid_monthly' ? '+30 días' : 'auto'}</span>
                  </div>
                  <div style={{ width: '100%', height: 44, padding: '0 14px', boxSizing: 'border-box', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: edit.serviceEndDate ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center' }}>
                    {edit.serviceEndDate ? new Date(edit.serviceEndDate + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '— sin calcular —'}
                  </div>
                  {serviceLeft !== null && (
                    <div style={{ marginTop: 8 }}>
                      {progressPct !== null && (
                        <div style={{ height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginBottom: 5, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, width: `${progressPct}%`, background: serviceLeft <= 0 ? C.red : serviceLeft <= 5 ? C.amber : C.green, transition: 'width .4s ease' }} />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: serviceLeft <= 0 ? C.red : serviceLeft <= 5 ? C.amber : C.green }}>{serviceLeft <= 0 ? 'Vencido' : `${serviceLeft} día${serviceLeft !== 1 ? 's' : ''} restantes`}</span>
                        {totalDays !== null && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>de {totalDays} días</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DrawerSection>

            {/* ── 2. Estado de pago ── */}
            <DrawerSection title="Estado de pago" accent={C.green}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {([
                  { id: 'paid_monthly' as const, label: 'Mensual',  activeColor: C.blue  },
                  { id: 'paid_annual'  as const, label: 'Anual',    activeColor: C.green },
                  { id: null,                    label: 'Sin pago', activeColor: C.red   },
                ]).map(opt => {
                  const isSelected = client.payment_status === opt.id
                  return (
                    <button key={String(opt.id)} onClick={() => onMarkPayment(opt.id)} disabled={markingPay || isSelected}
                      style={{ height: 34, borderRadius: 10, border: `1px solid ${isSelected ? `${opt.activeColor}40` : 'rgba(255,255,255,0.07)'}`, background: isSelected ? `${opt.activeColor}12` : 'rgba(255,255,255,0.02)', color: isSelected ? opt.activeColor : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, cursor: markingPay || isSelected ? 'default' : 'pointer', fontFamily: 'inherit', opacity: markingPay ? 0.5 : 1, transition: 'all .15s' }}>
                      {markingPay ? '…' : opt.label}
                    </button>
                  )
                })}
              </div>
            </DrawerSection>

            {/* ── 3. Configuración ── (abierta por defecto) */}
            <DrawerSection title="Configuración del cliente" defaultOpen accent={C.orange}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <Field label="Ad Account ID" value={edit.act} onChange={onAct} placeholder="act_123456789" accent={C.orange} mono />
                <Field label="Nombre para saludo" value={edit.label} onChange={onLabel} placeholder="Ej. Bocados" accent={C.blue} />
                <Field label="Ventas totales MXN" value={edit.sales} onChange={onSales} placeholder="0" type="number" accent={C.green} />
                <Field label="Notas internas" value={edit.notes} onChange={onNotes} placeholder="Solo tú las ves" accent={C.faint} />
                {!client.meta_ad_account_id && (
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
                    Encuéntralo en <a href="https://adsmanager.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: `${C.orange}99` }}>Ads Manager</a> → esquina superior izquierda.
                  </p>
                )}
                {/* @username */}
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>@Usuario (login)</div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 12, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', pointerEvents: 'none' }}>@</span>
                    <input type="text" value={edit.username} onChange={e => onUsername(e.target.value)} placeholder={client.full_name.toLowerCase().replace(/[^a-z0-9_.]/g, '')} maxLength={30}
                      style={{ width: '100%', height: 42, paddingLeft: 28, paddingRight: 10, boxSizing: 'border-box', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.09)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'monospace', letterSpacing: '0.02em', transition: 'border-color .2s' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.25)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)' }}
                    />
                  </div>
                  {client.username && <p style={{ margin: '5px 0 0', fontSize: 10.5, color: 'rgba(255,255,255,0.22)' }}>Actual: <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>@{client.username}</span></p>}
                </div>

                {/* Botón principal: guardar todo */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <button onClick={onSave} disabled={saving} style={{ flex: 1, height: 48, borderRadius: 14, border: 'none', background: saving ? `${C.orange}55` : C.orange, color: '#fff', fontWeight: 700, fontSize: 14.5, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background .15s', letterSpacing: '-0.01em' }}>
                    {saving
                      ? <><Ico.spin />Guardando…</>
                      : <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Guardar cambios
                        </>
                    }
                  </button>
                  {client.meta_ad_account_id && (
                    <button onClick={onRemove} disabled={removing} title="Desconectar cuenta Meta" style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid rgba(255,179,64,0.2)`, background: `rgba(255,179,64,0.06)`, color: 'rgba(255,179,64,0.6)', cursor: removing ? 'not-allowed' : 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,179,64,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,179,64,0.06)' }}>
                      {removing ? <Ico.spin /> : <Ico.sync />}
                    </button>
                  )}
                  <button onClick={onDelete} title="Eliminar cliente" style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid rgba(255,69,58,0.2)`, background: `rgba(255,69,58,0.06)`, color: 'rgba(255,69,58,0.6)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.06)' }}>
                    <Ico.trash />
                  </button>
                </div>
              </div>
            </DrawerSection>

            {/* ── 4. Campañas ── */}
            {client.meta_ad_account_id && (
              <DrawerSection title="Campañas" accent={C.amber}>
                {loadingCamps ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}><Ico.spin />Cargando…</div>
                ) : campaigns.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Sin campañas sincronizadas</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {campaigns.map((camp, i) => {
                      const isActive = (camp.manual_status ?? camp.effective_status) === 'ACTIVE'
                      const isToggling = togglingCamp === camp.campaign_id
                      return (
                        <div key={camp.campaign_id ?? i} style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i < campaigns.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: isActive ? C.green : 'rgba(255,255,255,0.18)', animation: isActive ? 'adm-campPulse 2s ease infinite' : 'none' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{camp.campaign_name ?? 'Campaña'}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>
                              {camp.spend > 0 ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(camp.spend) : '$0'} · {camp.results ?? 0} resultados
                            </div>
                          </div>
                          <button onClick={() => toggleCampaignStatus(camp)} disabled={!!togglingCamp}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 100, border: `1px solid ${isActive ? `${C.green}30` : 'rgba(255,255,255,0.09)'}`, background: isActive ? `${C.green}08` : 'rgba(255,255,255,0.03)', color: isActive ? C.green : 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, cursor: togglingCamp ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'all .15s', flexShrink: 0, opacity: togglingCamp && !isToggling ? 0.4 : 1 }}>
                            {isToggling ? <Ico.spin /> : isActive ? <><Ico.pause />Pausar</> : <><Ico.play />Activar</>}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </DrawerSection>
            )}

            {/* ── 5. Información general ── */}
            {(client.sub || lastPayment || client.meta_ad_account_id) && (
              <DrawerSection title="Información general" accent={C.muted}>
                {client.meta_ad_account_id && <Row label="Ad Account" value={client.meta_ad_account_id} mono />}
                {client.total_sales > 0 && <>
                  <Row label="Ventas registradas" value={fx(client.total_sales)} color={C.green} />
                  <RowWithIcon label="Actualizado por" value={client.sales_updated_by === 'client' ? 'Cliente' : 'Admin'} icon={client.sales_updated_by === 'client' ? <Ico.user /> : <Ico.shield />} />
                  <Row label="Última actualización" value={timeAgo(client.sales_updated_at)} />
                </>}
                {client.last_meta_sync_at && <Row label="Última sync" value={timeAgo(client.last_meta_sync_at)} />}
                {client.sub && client.sub.status !== 'inactive' && <>
                  <Row label="Plan Stripe" value={client.sub.plan === 'annual' ? 'Anual' : client.sub.plan === 'monthly' ? 'Mensual' : '—'} />
                  <RowWithIcon label="Estado Stripe" value={client.sub.status === 'active' ? 'Activo' : client.sub.status === 'past_due' ? 'Pago pendiente' : client.sub.status === 'canceled' ? 'Cancelado' : client.sub.status} icon={client.sub.status === 'active' ? <Ico.check /> : client.sub.status === 'past_due' ? <Ico.warn /> : undefined} color={client.sub.status === 'active' ? C.green : client.sub.status === 'past_due' ? C.amber : C.muted} />
                  {client.sub.current_period_end && <Row label="Stripe vence" value={new Date(client.sub.current_period_end).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })} />}
                </>}
                {lastPayment && <>
                  <Row label="Último pago" value={new Date(lastPayment.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} color={C.green} />
                  <Row label="Monto" value={fx(lastPayment.amount / 100)} color={C.green} />
                </>}
              </DrawerSection>
            )}

            {/* ── Productos del cliente ── */}
            <DrawerSection title="Productos del cliente" accent="#FF5A1F">
              <button
                onClick={() => setShowProducts(true)}
                style={{
                  width: '100%', height: 44, borderRadius: 14,
                  border: '1px solid rgba(255,90,31,0.35)',
                  background: 'rgba(255,90,31,0.1)',
                  color: '#FF5A1F', fontWeight: 700, fontSize: 13.5,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,90,31,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,90,31,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,90,31,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,90,31,0.35)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Gestionar productos
              </button>
            </DrawerSection>

          </div>
        </div>
      </>
    )}

    {/* Products sheet — rendered outside the drawer so it stacks above */}
    {showProducts && (
      <ProductsSheet
        open={showProducts}
        onClose={() => setShowProducts(false)}
        profileId={client.id}
        currentSales={client.total_sales}
        onSalesUpdated={() => {}}
        adminMode
      />
    )}
    </>
  )
}

// ── Info row (expanded) ────────────────────────────────────────
function Row({ label, value, mono = false, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
      <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: color ?? '#fff', fontFamily: mono ? 'monospace' : 'inherit', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

// ── Info row with icon ─────────────────────────────────────────
function RowWithIcon({ label, value, icon, color }: { label: string; value: string; icon?: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
      <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: color ?? '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}{value}
      </span>
    </div>
  )
}

// ── Form field ─────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, accent, type = 'text', mono = false }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; accent?: string; type?: string; mono?: boolean
}) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', height: 50, padding: '0 16px', boxSizing: 'border-box', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.09)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: mono ? '"SF Mono","Fira Mono",monospace' : 'inherit', transition: 'border-color .15s, box-shadow .15s' }}
        onFocus={e => { const el = e.target as HTMLInputElement; el.style.borderColor = accent ?? 'rgba(255,255,255,0.3)'; el.style.boxShadow = `0 0 0 3px ${accent ?? 'rgba(255,255,255,0.1)'}22` }}
        onBlur={e => { const el = e.target as HTMLInputElement; el.style.borderColor = 'rgba(255,255,255,0.09)'; el.style.boxShadow = 'none' }}
      />
    </div>
  )
}

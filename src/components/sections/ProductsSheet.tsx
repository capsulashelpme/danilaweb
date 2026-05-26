import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

/* ── Types ─────────────────────────────────────────────────────── */
interface Product {
  id: string
  name: string
  price: number
}

interface Props {
  open: boolean
  onClose: () => void
  profileId: string        // id del cliente dueño de los productos
  currentSales: number     // ventas actuales para sumar encima
  onSalesUpdated: (newTotal: number) => void
  /** Si true = modo admin: puede ver/crear/editar/borrar pero NO "agregar ventas" */
  adminMode?: boolean
}

/* ── Helpers ────────────────────────────────────────────────────── */
const fx = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

const ORANGE = '#FF6B1A'

/* ── Icono producto ─────────────────────────────────────────────── */
const IconBox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 21.73a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const IconPlus = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
)
const IconMinus = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
)
const IconEdit2 = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
)

/* ════════════════════════════════════════════════════════════════
   ProductsSheet
════════════════════════════════════════════════════════════════ */
export function ProductsSheet({ open, onClose, profileId, currentSales, onSalesUpdated, adminMode = false }: Props) {

  const [products,      setProducts]      = useState<Product[]>([])
  const [counts,        setCounts]        = useState<Record<string, number>>({})
  const [loading,       setLoading]       = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [successAnim,   setSuccessAnim]   = useState(false)
  const [customRaw,     setCustomRaw]     = useState('')   // monto libre escrito por el usuario

  // Formulario nuevo producto
  const [showForm,    setShowForm]    = useState(false)
  const [formName,    setFormName]    = useState('')
  const [formPrice,   setFormPrice]   = useState('')
  const [formSaving,  setFormSaving]  = useState(false)

  // Edición inline
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editName,    setEditName]    = useState('')
  const [editPrice,   setEditPrice]   = useState('')
  const [editSaving,  setEditSaving]  = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)

  /* ── Cargar productos ─────────────────────────────────────────── */
  const loadProducts = async () => {
    if (!profileId) return
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id, name, price')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true })
    setProducts((data ?? []) as Product[])
    setLoading(false)
  }

  useEffect(() => {
    if (open) { loadProducts(); setCounts({}) }
  }, [open, profileId])

  useEffect(() => {
    if (showForm) setTimeout(() => nameRef.current?.focus(), 80)
  }, [showForm])

  /* ── Total calculado ──────────────────────────────────────────── */
  const customVal    = parseFloat(customRaw.replace(/[^0-9.]/g, '')) || 0
  const productsTotal = products.reduce((sum, p) => sum + p.price * (counts[p.id] ?? 0), 0)
  const total        = productsTotal + customVal
  const hasSelection = total > 0

  /* ── Crear producto ───────────────────────────────────────────── */
  const createProduct = async () => {
    const n = formName.trim()
    const p = parseFloat(formPrice.replace(/[^0-9.]/g, ''))
    if (!n || isNaN(p) || p < 0) return
    setFormSaving(true)
    const { data, error } = await supabase
      .from('products')
      .insert({ profile_id: profileId, name: n, price: p })
      .select('id, name, price')
      .single()
    setFormSaving(false)
    if (error || !data) return
    setProducts(prev => [...prev, data as Product])
    setFormName(''); setFormPrice(''); setShowForm(false)
  }

  /* ── Editar producto ──────────────────────────────────────────── */
  const startEdit = (p: Product) => {
    setEditingId(p.id); setEditName(p.name); setEditPrice(String(p.price))
  }
  const saveEdit = async () => {
    if (!editingId) return
    const n = editName.trim()
    const p = parseFloat(editPrice.replace(/[^0-9.]/g, ''))
    if (!n || isNaN(p)) return
    setEditSaving(true)
    await supabase.from('products').update({ name: n, price: p }).eq('id', editingId)
    setProducts(prev => prev.map(x => x.id === editingId ? { ...x, name: n, price: p } : x))
    setEditSaving(false); setEditingId(null)
  }

  /* ── Eliminar producto ────────────────────────────────────────── */
  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(x => x.id !== id))
    setCounts(prev => { const c = { ...prev }; delete c[id]; return c })
  }

  /* ── Registrar ventas ─────────────────────────────────────────── */
  const registerSales = async () => {
    if (!hasSelection) return
    setSaving(true)
    const newTotal = currentSales + total
    await supabase.from('client_ad_accounts').update({
      total_sales: newTotal,
      sales_updated_by: adminMode ? 'admin' : 'client',
      sales_updated_at: new Date().toISOString(),
    }).eq('profile_id', profileId)
    setSaving(false)
    onSalesUpdated(newTotal)
    setSuccessAnim(true)
    setTimeout(() => {
      setSuccessAnim(false)
      setCounts({})
      setCustomRaw('')
      onClose()
    }, 1400)
  }

  /* ── Ajuste de count ──────────────────────────────────────────── */
  const inc = (id: string) => setCounts(p => ({ ...p, [id]: (p[id] ?? 0) + 1 }))
  const dec = (id: string) => setCounts(p => ({ ...p, [id]: Math.max(0, (p[id] ?? 0) - 1) }))

  /* ── Estilos comunes de input ─────────────────────────────────── */
  const inputSt: React.CSSProperties = {
    width: '100%', height: 46, padding: '0 14px', boxSizing: 'border-box',
    borderRadius: 12, background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(255,255,255,0.09)',
    color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit',
    transition: 'border-color .15s',
  }

  if (!open) return null

  return (
    <>
      {/* ── Overlay ───────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          animation: 'ps-overlay-in .22s ease forwards',
        }}
      />

      {/* ── Drawer ────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 210,
        height: '88vh',
        background: 'linear-gradient(180deg,#1c1c1c 0%,#141414 100%)',
        borderRadius: '28px 28px 0 0',
        border: '1px solid rgba(255,255,255,0.10)',
        borderBottom: 'none',
        boxShadow: '0 -24px 80px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'ps-drawer-in .40s cubic-bezier(.16,1,.3,1) forwards',
      }}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, padding: '10px 20px 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.12)', margin: '0 auto 16px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `${ORANGE}18`, border: `1px solid ${ORANGE}30`, display: 'grid', placeItems: 'center', color: ORANGE }}>
                <IconBox />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  Productos
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                  {adminMode ? 'Administrar productos' : 'Calcula tus ventas rápido'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.11)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* ── Scroll content ───────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 200px', display: 'flex', flexDirection: 'column' }}>

          {loading ? (
            /* Skeleton */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.04)', animation: 'ps-pulse 1.4s ease infinite', animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : products.length === 0 && !showForm ? (
            /* Estado vacío */
            <div style={{ textAlign: 'center', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, flex: 1, minHeight: 320 }}>
              <div style={{ width: 72, height: 72, borderRadius: 22, background: `${ORANGE}10`, border: `1px solid ${ORANGE}20`, display: 'grid', placeItems: 'center', color: `${ORANGE}80` }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 21.73a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>Sin productos todavía</div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>
                  Agrega un producto para calcular<br />tus ventas más rápido.
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  height: 48, padding: '0 28px',
                  borderRadius: 100, border: 'none',
                  background: ORANGE, color: '#fff',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '-0.01em',
                  boxShadow: `0 6px 24px ${ORANGE}40`,
                  transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                <IconPlus size={14} />
                Agregar primer producto
              </button>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {products.map(p => (
                  <div key={p.id} style={{ borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', transition: 'border-color .2s' }}>

                    {editingId === p.id ? (
                      /* ── Modo edición ── */
                      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre del producto"
                          style={{ ...inputSt, height: 42, fontSize: 13 }}
                          onFocus={e => { e.target.style.borderColor = ORANGE }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)' }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="Precio" type="number"
                            style={{ ...inputSt, height: 42, fontSize: 13, flex: 1 }}
                            onFocus={e => { e.target.style.borderColor = ORANGE }}
                            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)' }}
                          />
                          <button onClick={saveEdit} disabled={editSaving}
                            style={{ height: 42, padding: '0 16px', borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {editSaving ? '…' : <><IconCheck />Guardar</>}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ height: 42, padding: '0 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.09)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Modo normal ── */
                      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>

                        {/* Info del producto */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                            {p.name}
                          </div>
                          {/* Precio unitario — se reemplaza por subtotal cuando count > 0 */}
                          {(counts[p.id] ?? 0) > 0 ? (
                            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', display: 'flex', alignItems: 'baseline', gap: 5 }}>
                              <span style={{ color: ORANGE }}>{fx(p.price * (counts[p.id] ?? 0))}</span>
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>× {counts[p.id]}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, color: ORANGE, fontWeight: 600, marginTop: 2, fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
                              {fx(p.price)}
                            </div>
                          )}
                        </div>

                        {/* Contador — ancho FIJO siempre */}
                        {(
                          <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.06)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                            <button
                              onClick={() => dec(p.id)}
                              disabled={(counts[p.id] ?? 0) === 0}
                              style={{ width: 36, height: 36, borderRadius: '50%', background: 'none', border: 'none', color: (counts[p.id] ?? 0) === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', cursor: (counts[p.id] ?? 0) === 0 ? 'not-allowed' : 'pointer', display: 'grid', placeItems: 'center', transition: 'color .15s, transform .1s', flexShrink: 0 }}
                              onMouseDown={e => { if ((counts[p.id] ?? 0) > 0) e.currentTarget.style.transform = 'scale(0.85)' }}
                              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
                            >
                              <IconMinus size={14} />
                            </button>
                            <span style={{ width: 28, textAlign: 'center', fontSize: 15, fontWeight: 700, color: (counts[p.id] ?? 0) > 0 ? '#fff' : 'rgba(255,255,255,0.25)', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', transition: 'color .15s' }}>
                              {counts[p.id] ?? 0}
                            </span>
                            <button
                              onClick={() => inc(p.id)}
                              style={{ width: 36, height: 36, borderRadius: '50%', background: (counts[p.id] ?? 0) > 0 ? `${ORANGE}20` : 'none', border: 'none', color: (counts[p.id] ?? 0) > 0 ? ORANGE : 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background .15s, color .15s, transform .1s', flexShrink: 0 }}
                              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.85)' }}
                              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
                            >
                              <IconPlus size={14} />
                            </button>
                          </div>
                        )}

                        {/* Editar / Borrar — siempre visibles */}
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => startEdit(p)}
                            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                          >
                            <IconEdit2 />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.15)', color: 'rgba(255,69,58,0.6)', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.14)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.06)' }}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulario nuevo producto */}
              {showForm ? (
                <div style={{ borderRadius: 18, background: `${ORANGE}08`, border: `1.5px solid ${ORANGE}30`, padding: '16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: ORANGE, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Nuevo producto</div>
                  <input ref={nameRef} value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nombre del producto"
                    style={{ ...inputSt, borderColor: `${ORANGE}40` }}
                    onFocus={e => { e.target.style.borderColor = ORANGE }}
                    onBlur={e => { e.target.style.borderColor = `${ORANGE}40` }}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit() }}
                  />
                  <input value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="Precio (ej. 500)" type="number"
                    style={{ ...inputSt, borderColor: `${ORANGE}40` }}
                    onFocus={e => { e.target.style.borderColor = ORANGE }}
                    onBlur={e => { e.target.style.borderColor = `${ORANGE}40` }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={createProduct} disabled={formSaving || !formName.trim() || !formPrice}
                      style={{ flex: 1, height: 44, borderRadius: 12, border: 'none', background: formSaving || !formName.trim() || !formPrice ? 'rgba(255,255,255,0.08)' : ORANGE, color: formSaving || !formName.trim() || !formPrice ? 'rgba(255,255,255,0.3)' : '#fff', fontWeight: 700, fontSize: 14, cursor: formSaving || !formName.trim() || !formPrice ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}>
                      {formSaving ? 'Guardando…' : 'Guardar producto'}
                    </button>
                    <button onClick={() => { setShowForm(false); setFormName(''); setFormPrice('') }}
                      style={{ height: 44, padding: '0 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.09)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  style={{ width: '100%', height: 46, borderRadius: 14, border: `1.5px dashed rgba(255,255,255,0.12)`, background: 'transparent', color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit', transition: 'border-color .2s, color .2s', marginBottom: 16 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${ORANGE}50`; e.currentTarget.style.color = ORANGE }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
                >
                  <IconPlus size={13} />
                  Agregar producto
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Venta personalizada — entre lista y footer ── */}
        {(true) && (
          <div style={{
            flexShrink: 0,
            padding: `12px 20px ${products.length === 0 && customVal === 0 ? 'calc(env(safe-area-inset-bottom, 0px) + 116px)' : '12px'}`,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(15,15,15,0.9)',
            transition: 'padding-bottom .25s ease',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Venta personalizada
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, fontWeight: 700, color: customRaw ? '#fff' : 'rgba(255,255,255,0.2)', pointerEvents: 'none', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={customRaw}
                  onChange={e => setCustomRaw(e.target.value)}
                  style={{
                    width: '100%', height: 46, boxSizing: 'border-box',
                    paddingLeft: 26, paddingRight: 14,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${customVal > 0 ? `${ORANGE}60` : 'rgba(255,255,255,0.08)'}`,
                    color: '#fff', fontSize: 16, fontWeight: 700,
                    outline: 'none', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif',
                    letterSpacing: '-0.02em', colorScheme: 'dark',
                    transition: 'border-color .2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = `${ORANGE}80` }}
                  onBlur={e => { e.target.style.borderColor = customVal > 0 ? `${ORANGE}60` : 'rgba(255,255,255,0.08)' }}
                />
              </div>
              {customRaw !== '' && customVal > 0 && (
                <button
                  onClick={() => setCustomRaw('')}
                  style={{
                    height: 46, padding: '0 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)',
                    fontSize: 18, cursor: 'pointer', flexShrink: 0,
                    display: 'grid', placeItems: 'center',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            {customVal > 0 && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6, fontStyle: 'italic' }}>
                Se sumará {fx(customVal)} al total
              </div>
            )}
          </div>
        )}

        {/* ── Footer fijo — total + botón ───────────────────────────── */}
        {(products.length > 0 || customVal > 0) && (
          <div style={{
            flexShrink: 0,
            padding: '16px 20px calc(env(safe-area-inset-bottom, 0px) + 110px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(20,20,20,0.95)',
            backdropFilter: 'blur(12px)',
          }}>
            {/* Total */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{adminMode ? 'Total a sumar al cliente' : 'Total a registrar'}</div>
              <div style={{
                fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em',
                color: hasSelection ? '#fff' : 'rgba(255,255,255,0.15)',
                fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
                transition: 'color .25s',
              }}>
                {fx(total)}
              </div>
            </div>

            {/* Botón principal */}
            <button
              onClick={registerSales}
              disabled={!hasSelection || saving || successAnim}
              style={{
                width: '100%', height: 54, borderRadius: 16, border: 'none',
                background: successAnim
                  ? 'rgba(48,209,88,1)'
                  : hasSelection
                    ? ORANGE
                    : 'rgba(255,255,255,0.06)',
                color: hasSelection || successAnim ? '#fff' : 'rgba(255,255,255,0.2)',
                fontWeight: 700, fontSize: 16, cursor: hasSelection && !saving ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                boxShadow: hasSelection && !successAnim ? `0 8px 28px ${ORANGE}45` : successAnim ? '0 8px 28px rgba(48,209,88,0.4)' : 'none',
                transition: 'background .3s, box-shadow .3s, color .3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {successAnim ? (
                <><IconCheck />{adminMode ? '¡Ventas actualizadas!' : '¡Ventas registradas!'}</>
              ) : saving ? (
                '…'
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                  {adminMode ? 'Registrar al cliente' : 'Agregar ventas'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Keyframes ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes ps-overlay-in { from { opacity:0 } to { opacity:1 } }
        @keyframes ps-drawer-in  { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes ps-pulse      { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </>
  )
}

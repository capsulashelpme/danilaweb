import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────
export type MediaSection = 'creativos_publicidad' | 'contenido_organico' | 'diseno_web_desarrollo'
type MediaType = 'image' | 'video'

export interface MediaAsset {
  id: string
  section: MediaSection
  type: MediaType
  url: string
  storage_path: string
  order_index: number
  is_active: boolean
  created_at: string
  views_count?: number
}

const BUCKET = 'media-assets'

const SECTIONS: { id: MediaSection; label: string; icon: string }[] = [
  { id: 'creativos_publicidad',  label: 'Creativos / Publicidad',  icon: '🎨' },
  { id: 'contenido_organico',    label: 'Contenido Orgánico',      icon: '📱' },
  { id: 'diseno_web_desarrollo', label: 'Diseño Web / Desarrollo', icon: '💻' },
]

const C = {
  bg:     '#060606',
  card:   'rgba(255,255,255,0.038)',
  border: 'rgba(255,255,255,0.07)',
  orange: '#FF6B1A',
  green:  '#30D158',
  red:    '#FF453A',
  muted:  'rgba(255,255,255,0.35)',
  faint:  'rgba(255,255,255,0.12)',
}

// ── Hook: fetch media assets for a section ─────────────────────
export function useMediaAssets(section: MediaSection) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      const { data } = await supabase
        .from('media_assets')
        .select('*')
        .eq('section', section)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false })
      if (mounted) {
        setAssets((data as MediaAsset[]) ?? [])
        setLoaded(true)
      }
    }
    fetch()

    const ch = supabase.channel(`media-assets-${section}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'media_assets',
        filter: `section=eq.${section}`,
      }, fetch)
      .subscribe()

    return () => { mounted = false; supabase.removeChannel(ch) }
  }, [section])

  return { assets, loaded }
}

// ── MediaManager component (admin only) ───────────────────────
export function MediaManager() {
  const [activeSection, setActiveSection] = useState<MediaSection>('creativos_publicidad')
  const [allAssets,     setAllAssets]     = useState<MediaAsset[]>([])
  const [loading,       setLoading]       = useState(false)
  const [uploading,     setUploading]     = useState(false)
  const [uploadPct,     setUploadPct]     = useState(0)
  const [ytUrl,         setYtUrl]         = useState('')
  const [ytSaving,      setYtSaving]      = useState(false)
  const [confirmDel,    setConfirmDel]    = useState<MediaAsset | null>(null)
  const [deleting,      setDeleting]      = useState(false)
  const [toast,         setToast]         = useState<{ ok: boolean; msg: string } | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const vidRef = useRef<HTMLInputElement>(null)

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg })
    setTimeout(() => setToast(null), 3200)
  }

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('media_assets')
      .select('*')
      .eq('section', activeSection)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
    setAllAssets((data as MediaAsset[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('media-mgr-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_assets' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [activeSection])

  const upload = async (file: File, type: MediaType) => {
    setUploading(true)
    setUploadPct(10)
    const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const path = `${activeSection}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    setUploadPct(30)
    // Explicit content-type for .mov so Storage doesn't reject it
    const mimeMap: Record<string, string> = { mov: 'video/quicktime', mp4: 'video/mp4', webm: 'video/webm' }
    const contentType = mimeMap[ext] ?? file.type ?? 'application/octet-stream'
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType })
    if (upErr) {
      showToast(false, `Error al subir: ${upErr.message}`)
      setUploading(false); setUploadPct(0); return
    }
    setUploadPct(75)

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const maxIdx = allAssets.reduce((m, a) => Math.max(m, a.order_index), -1)

    const { error: dbErr } = await supabase.from('media_assets').insert({
      section: activeSection, type, url: publicUrl,
      storage_path: path, order_index: maxIdx + 1, is_active: true,
    })
    setUploadPct(100)
    if (dbErr) { showToast(false, `Error al guardar: ${dbErr.message}`) }
    else        { showToast(true, 'Archivo subido y publicado en la web ✓') }
    setUploading(false); setUploadPct(0)
    load()
  }

  const saveVideoUrl = async () => {
    const url = ytUrl.trim()
    if (!url) return
    if (!url.startsWith('http')) {
      showToast(false, 'Pega una URL válida (debe iniciar con http)')
      return
    }
    setYtSaving(true)
    const maxIdx = allAssets.reduce((m, a) => Math.max(m, a.order_index), -1)
    const { error } = await supabase.from('media_assets').insert({
      section: activeSection, type: 'video', url,
      storage_path: '', order_index: maxIdx + 1, is_active: true,
    })
    setYtSaving(false)
    if (error) { showToast(false, 'Error al guardar: ' + error.message) }
    else { showToast(true, 'Video agregado ✓'); setYtUrl(''); load() }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    await upload(file, type)
  }

  const deleteAsset = async (asset: MediaAsset) => {
    setDeleting(true)
    await supabase.storage.from(BUCKET).remove([asset.storage_path])
    await supabase.from('media_assets').delete().eq('id', asset.id)
    setConfirmDel(null); setDeleting(false)
    showToast(true, 'Eliminado de la web')
    load()
  }

  const toggleActive = async (asset: MediaAsset) => {
    await supabase.from('media_assets').update({ is_active: !asset.is_active }).eq('id', asset.id)
    load()
  }

  const visible   = allAssets.filter(a => a.is_active)
  const hidden    = allAssets.filter(a => !a.is_active)

  return (
    <div style={{ paddingBottom: 20 }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 400, background: toast.ok ? C.green : C.red,
          color: '#fff', padding: '11px 22px', borderRadius: 14, fontWeight: 700,
          fontSize: 13, boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
          whiteSpace: 'nowrap', letterSpacing: '-0.01em',
          animation: 'adm-toast-in .25s cubic-bezier(.16,1,.3,1)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Section tabs ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {SECTIONS.map(s => {
          const isActive = activeSection === s.id
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 16,
                background: isActive ? `${C.orange}15` : C.card,
                border: `1px solid ${isActive ? `${C.orange}40` : C.border}`,
                color: isActive ? C.orange : '#fff',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: isActive ? `${C.orange}80` : C.muted, marginTop: 2 }}>
                  {isActive
                    ? `${visible.length} visible${visible.length !== 1 ? 's' : ''} · ${hidden.length} oculto${hidden.length !== 1 ? 's' : ''}`
                    : 'Toca para gestionar'
                  }
                </div>
              </div>
              {isActive && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Upload buttons ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input ref={imgRef} type="file" accept="image/*,.gif" style={{ display: 'none' }}
          onChange={e => handleFile(e, 'image')} />
        <input ref={vidRef} type="file" accept="video/*" style={{ display: 'none' }}
          onChange={e => handleFile(e, 'video')} />
        <button onClick={() => imgRef.current?.click()} disabled={uploading}
          style={{
            flex: 1, height: 46, borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            background: uploading ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
            color: uploading ? C.muted : '#fff',
            fontWeight: 700, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all .15s',
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          {uploading ? 'Subiendo…' : '+ Imagen'}
        </button>
        <button onClick={() => vidRef.current?.click()} disabled={uploading}
          style={{
            flex: 1, height: 46, borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            background: uploading ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
            color: uploading ? C.muted : '#fff',
            fontWeight: 700, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all .15s',
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          {uploading ? 'Subiendo…' : '+ Video'}
        </button>
      </div>

      {/* ── Link YouTube ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="url"
          placeholder="Pega URL de video (Drive, Dropbox, etc.)…"
          value={ytUrl}
          onChange={e => setYtUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') saveVideoUrl() }}
          style={{
            flex: 1, height: 46, borderRadius: 14, padding: '0 14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', fontSize: 13, fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          onClick={saveVideoUrl}
          disabled={ytSaving || !ytUrl.trim()}
          style={{
            height: 46, borderRadius: 14, padding: '0 16px',
            background: ytUrl.trim() ? 'rgba(255,0,0,0.18)' : 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,80,80,0.3)',
            color: ytUrl.trim() ? '#ff6b6b' : C.muted,
            fontWeight: 700, fontSize: 13, cursor: ytUrl.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          {/* YouTube icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.5 6.2s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.8 2 12 2 12 2s-4.8 0-7.3.1c-.6.1-1.9.1-3 1.3C.8 4.2.5 6.2.5 6.2S.2 8.5.2 10.8v2.1c0 2.3.3 4.6.3 4.6s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 21.7 12 21.8 12 21.8s4.8 0 7.3-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.3.3-4.6v-2.1c0-2.3-.3-4.6-.3-4.6zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z"/>
          </svg>
          {ytSaving ? '…' : 'Agregar'}
        </button>
      </div>

      {/* ── Upload progress bar ── */}
      {uploading && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ borderRadius: 8, background: 'rgba(255,255,255,0.06)', height: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 8, background: C.orange,
              width: `${uploadPct}%`, transition: 'width .4s ease',
            }} />
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6, textAlign: 'center' }}>
            Subiendo a Supabase Storage…
          </div>
        </div>
      )}

      {/* ── Asset grid ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 160, borderRadius: 16, background: C.card, animation: 'adm-pulse 1.4s ease infinite' }} />
          ))}
        </div>
      ) : allAssets.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 24px', borderRadius: 20,
          background: C.card, border: `1px dashed ${C.border}`,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 6, letterSpacing: '-0.01em' }}>
            Sin archivos aún
          </div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
            Sube una imagen o video y aparecerá<br/>en la sección de la web al instante.
          </div>
        </div>
      ) : (
        <>
          {/* Active */}
          {visible.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
                Visibles en la web ({visible.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {visible.map(a => <AssetCard key={a.id} asset={a} section={activeSection} onDelete={() => setConfirmDel(a)} onToggle={() => toggleActive(a)} onReload={load} />)}
              </div>
            </>
          )}
          {/* Hidden */}
          {hidden.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
                Ocultos ({hidden.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {hidden.map(a => <AssetCard key={a.id} asset={a} section={activeSection} onDelete={() => setConfirmDel(a)} onToggle={() => toggleActive(a)} onReload={load} />)}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Confirm delete modal ── */}
      {confirmDel && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 350, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => !deleting && setConfirmDel(null)}
        >
          <div
            style={{ width: '100%', maxWidth: 320, background: '#1C1C1C', borderRadius: 24, padding: '28px 24px', border: `1px solid ${C.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Mini preview */}
            <div style={{ width: '100%', height: 100, borderRadius: 14, overflow: 'hidden', marginBottom: 20, background: '#0a0a0a' }}>
              {confirmDel.type === 'video'
                ? <video src={confirmDel.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                : <img    src={confirmDel.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
              }
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>
              ¿Eliminar este archivo?
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24, lineHeight: 1.55 }}>
              Se borrará del storage y <strong style={{ color: '#fff' }}>desaparecerá de la web de inmediato</strong>. No se puede deshacer.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} disabled={deleting}
                style={{ flex: 1, height: 46, borderRadius: 14, border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.05)', color: C.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={() => deleteAsset(confirmDel)} disabled={deleting}
                style={{ flex: 1, height: 46, borderRadius: 14, border: 'none', background: C.red, color: '#fff', fontWeight: 700, fontSize: 14, cursor: deleting ? 'wait' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {deleting ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', animation: 'adm-spin .7s linear infinite' }} />Eliminando…</> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes adm-toast-in { from { opacity:0; transform:translateX(-50%) translateY(-8px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }`}</style>
    </div>
  )
}

// ── Asset card ─────────────────────────────────────────────────
function AssetCard({
  asset, section, onDelete, onToggle, onReload,
}: {
  asset: MediaAsset
  section: MediaSection
  onDelete: () => void
  onToggle: () => void
  onReload: () => void
}) {
  const isOrganic = section === 'contenido_organico'
  const [viewsInput, setViewsInput] = useState(String(asset.views_count ?? 0))
  const [savingViews, setSavingViews] = useState(false)

  const saveViews = useCallback(async () => {
    const num = parseInt(viewsInput.replace(/\D/g, ''), 10)
    if (isNaN(num) || num === (asset.views_count ?? 0)) return
    setSavingViews(true)
    await supabase.from('media_assets').update({ views_count: num }).eq('id', asset.id)
    setSavingViews(false)
    onReload()
  }, [viewsInput, asset.id, asset.views_count, onReload])

  return (
    <div style={{
      borderRadius: 16, background: C.card, border: `1px solid ${C.border}`,
      overflow: 'hidden', opacity: asset.is_active ? 1 : 0.5, transition: 'opacity .2s',
    }}>
      {/* Preview */}
      <div style={{ position: 'relative', height: 130, background: '#0a0a0a' }}>
        {asset.type === 'video' ? (
          <video src={asset.url} muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
        ) : (
          <img src={asset.url} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
        )}
        {/* Type badge */}
        <div style={{
          position: 'absolute', top: 7, left: 7, background: 'rgba(0,0,0,0.72)',
          borderRadius: 6, padding: '2px 7px', fontSize: 9.5, fontWeight: 700, color: '#fff',
          backdropFilter: 'blur(4px)',
        }}>
          {asset.type === 'video' ? '▶ Video' : '🖼 Img'}
        </div>
      </div>

      {/* Views editor — only for contenido_organico */}
      {isOrganic && (
        <div style={{ padding: '7px 8px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 10, color: C.muted, fontWeight: 600, flexShrink: 0 }}>▶ Views</span>
          <input
            type="text"
            inputMode="numeric"
            value={viewsInput}
            onChange={e => setViewsInput(e.target.value.replace(/\D/g, ''))}
            onBlur={saveViews}
            onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur() } }}
            style={{
              flex: 1, height: 26, borderRadius: 7, border: `1px solid ${C.faint}`,
              background: 'rgba(255,255,255,0.05)', color: '#fff',
              fontSize: 11, fontWeight: 700, textAlign: 'center', fontFamily: 'inherit',
              outline: 'none', padding: '0 4px',
              opacity: savingViews ? 0.5 : 1,
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, padding: isOrganic ? '5px 8px 8px' : '8px 8px' }}>
        <button onClick={onToggle}
          style={{
            flex: 1, height: 30, borderRadius: 9,
            border: `1px solid ${asset.is_active ? `${C.green}35` : 'rgba(255,255,255,0.1)'}`,
            background: asset.is_active ? `${C.green}10` : 'rgba(255,255,255,0.04)',
            color: asset.is_active ? C.green : C.muted,
            fontSize: 10.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
          {asset.is_active ? 'Visible' : 'Oculto'}
        </button>
        <button onClick={onDelete}
          style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            border: `1px solid rgba(255,69,58,0.25)`, background: 'rgba(255,69,58,0.08)',
            color: C.red, cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

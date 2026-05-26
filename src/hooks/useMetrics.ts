import { useEffect, useState } from 'react'
import { supabase, type MetaMetrics } from '@/lib/supabase'

export interface MetricsSummary {
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  results: number
  cost_per_result: number
  frequency: number
  roas: number | null
  last_updated: string | null
  campaigns: MetaMetrics[]
}

const empty: MetricsSummary = {
  spend: 0, impressions: 0, reach: 0, clicks: 0,
  ctr: 0, cpc: 0, results: 0, cost_per_result: 0,
  frequency: 0, roas: null, last_updated: null, campaigns: [],
}

// Columnas que el cliente puede ver
const METRICS_COLUMNS = [
  'id', 'profile_id', 'date_start', 'date_stop',
  'spend', 'impressions', 'reach', 'clicks',
  'ctr', 'cpc', 'cpp', 'frequency',
  'results', 'cost_per_result', 'result_type',
  'campaign_name', 'effective_status', 'manual_status', 'campaign_start_time', 'fetched_at',
].join(', ')

/**
 * NO recibe profileId como parámetro externo.
 * Obtiene el usuario autenticado directamente desde Supabase Auth.
 * RLS en el servidor garantiza que cada query solo devuelve
 * filas donde profile_id = auth.uid() — imposible ver datos de otro cliente.
 */
export function useMetrics() {
  const [data, setData] = useState<MetricsSummary>(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ownId, setOwnId] = useState<string | null>(null)

  // Resuelve el ID desde la sesión autenticada (no desde props)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setOwnId(session?.user?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setOwnId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const buildSummary = (rows: MetaMetrics[]): MetricsSummary => {
    if (!rows.length) return empty
    const sum = rows.reduce((acc, r) => ({
      spend:       acc.spend + (r.spend || 0),
      impressions: acc.impressions + (r.impressions || 0),
      reach:       acc.reach + (r.reach || 0),
      clicks:      acc.clicks + (r.clicks || 0),
      results:     acc.results + (r.results || 0),
    }), { spend: 0, impressions: 0, reach: 0, clicks: 0, results: 0 })

    const ctr = sum.impressions ? (sum.clicks / sum.impressions) * 100 : 0
    const cpc = sum.clicks ? sum.spend / sum.clicks : 0
    const cost_per_result = sum.results ? sum.spend / sum.results : 0
    const frequency = sum.reach ? sum.impressions / sum.reach : 0

    return {
      ...sum, ctr, cpc, cost_per_result, frequency,
      roas: null,
      last_updated: rows[0]?.fetched_at ?? null,
      campaigns: rows,
    }
  }

  const fetchMetrics = async () => {
    // RLS garantiza que solo llegan filas del usuario autenticado.
    // No se pasa profileId — el filtro real es auth.uid() en el servidor.
    setLoading(true)
    const { data: rows, error: err } = await supabase
      .from('meta_metrics')
      .select(METRICS_COLUMNS)
      .order('fetched_at', { ascending: false })
      .limit(100)

    if (err) { setError(err.message); setLoading(false); return }
    setData(buildSummary((rows as unknown as MetaMetrics[]) ?? []))
    setLoading(false)
  }

  useEffect(() => {
    if (!ownId) return
    fetchMetrics()

    // Real-time: el filtro del servidor (RLS) ya garantiza aislamiento.
    // El filter del canal es una optimización de red, no de seguridad.
    const channel = supabase
      .channel(`metrics-own-${ownId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meta_metrics',
          filter: `profile_id=eq.${ownId}`,   // optimización: menos tráfico WS
        },
        () => { fetchMetrics() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [ownId])

  return { data, loading, error, refetch: fetchMetrics }
}

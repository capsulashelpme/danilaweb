import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const META_API_VERSION = 'v19.0'
const DATE_PRESET      = 'last_30d'

// Insights fields — campaign_id added so we can join with status
const FIELDS = [
  'campaign_id', 'campaign_name', 'spend', 'impressions', 'reach',
  'clicks', 'ctr', 'cpc', 'cpp', 'frequency',
  'actions', 'cost_per_action_type',
].join(',')

// Orden de prioridad para determinar el "resultado" principal de una campaña.
// Coincide con lo que Meta Ads Manager muestra como columna "Resultados".
const RESULT_PRIORITY = [
  // Conversiones de compra (objetivo Ventas)
  'purchase',
  'offsite_conversion.fb_pixel_purchase',
  // Leads / formularios (objetivo Clientes potenciales)
  'lead',
  'offsite_conversion.fb_pixel_lead',
  'onsite_conversion.lead_grouped',
  // Mensajes — Meta usa total_messaging_connection como resultado principal
  // para campañas con objetivo Mensajes (WhatsApp / Messenger / Instagram DM)
  'onsite_conversion.total_messaging_connection',
  'onsite_conversion.messaging_conversation_started_7d',
  'onsite_conversion.messaging_first_reply',
  'onsite_conversion.messaging_welcome_message_view',
  // Llamadas
  'onsite_conversion.call_initiated',
  // Tráfico / clics (último recurso)
  'link_click',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  // ?debug=true → devuelve datos crudos de Meta sin guardar en DB (solo admin)
  const debugMode = new URL(req.url).searchParams.get('debug') === 'true'

  const META_TOKEN = Deno.env.get('META_SYSTEM_TOKEN')
  if (!META_TOKEN) return json({ error: 'META_SYSTEM_TOKEN no configurado en Supabase Secrets' }, 500)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Si es modo debug, verificar que el caller sea admin
  if (debugMode) {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No autorizado' }, 401)
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )
    const { data: { user: callerUser } } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (!callerUser) return json({ error: 'No autorizado' }, 401)
    const { data: callerProfile } = await supabase
      .from('profiles').select('is_admin').eq('id', callerUser.id).single()
    if (!callerProfile?.is_admin) return json({ error: 'Acceso denegado — solo admins pueden usar debug mode' }, 403)
  }

  // Leer cuentas activas
  const { data: assignments, error: assignErr } = await supabase
    .from('client_ad_accounts')
    .select('profile_id, meta_ad_account_id, label')
    .eq('active', true)

  if (assignErr) return json({ error: assignErr.message }, 500)

  if (!assignments || assignments.length === 0) {
    return json({ ok: true, processed: 0, message: 'No hay cuentas activas. Asigna un act_ desde el panel admin.' })
  }

  const results: Record<string, unknown>[] = []

  for (const { profile_id, meta_ad_account_id } of assignments) {
    try {
      // ── 1. Insights (métricas de rendimiento) ─────────────────
      const insightsUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/${meta_ad_account_id}/insights`)
      insightsUrl.searchParams.set('access_token', META_TOKEN)
      insightsUrl.searchParams.set('date_preset',  DATE_PRESET)
      insightsUrl.searchParams.set('level',        'campaign')
      insightsUrl.searchParams.set('fields',       FIELDS)
      insightsUrl.searchParams.set('limit',        '50')

      const insightsRes  = await fetch(insightsUrl.toString())
      const insightsData = await insightsRes.json()

      if (insightsData.error) {
        results.push({ profile_id, meta_ad_account_id, error: insightsData.error.message })
        continue
      }

      // ── 2. Campaign status (real, no el rango del reporte) ─────
      const statusUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/${meta_ad_account_id}/campaigns`)
      statusUrl.searchParams.set('access_token',    META_TOKEN)
      statusUrl.searchParams.set('fields',          'id,effective_status,start_time')
      statusUrl.searchParams.set('effective_status', JSON.stringify(['ACTIVE','PAUSED','ARCHIVED','DELETED','IN_PROCESS','WITH_ISSUES']))
      statusUrl.searchParams.set('limit',           '200')

      const statusRes  = await fetch(statusUrl.toString())
      const statusData = await statusRes.json()

      // Build maps: campaign_id → effective_status / start_time
      const statusMap: Record<string, string> = {}
      const startTimeMap: Record<string, string> = {}
      if (!statusData.error) {
        for (const c of (statusData.data ?? [])) {
          statusMap[c.id]    = c.effective_status
          startTimeMap[c.id] = c.start_time
        }
      }

      // ── DEBUG MODE: devuelve datos crudos sin guardar ─────────
      if (debugMode) {
        const debugRows = (insightsData.data ?? []).map((d: Record<string, unknown>) => {
          const actions = (d.actions as Array<{ action_type: string; value: string }>) ?? []
          const costPerAction = (d.cost_per_action_type as Array<{ action_type: string; value: string }>) ?? []

          // Encontrar el mejor result_type según prioridad
          let matchedType = 'link_click'
          let matchedValue = 0
          let matchedCost = 0
          for (const type of RESULT_PRIORITY) {
            const a = actions.find(x => x.action_type === type)
            if (a) {
              matchedType = type
              matchedValue = parseFloat(a.value) || 0
              const c = costPerAction.find(x => x.action_type === type)
              matchedCost = c ? parseFloat(c.value) || 0 : 0
              break
            }
          }

          return {
            campaign_id:   d.campaign_id,
            campaign_name: d.campaign_name,
            date_start:    d.date_start,
            date_stop:     d.date_stop,
            spend:         d.spend,
            impressions:   d.impressions,
            reach:         d.reach,
            clicks:        d.clicks,
            ctr:           d.ctr,
            cpc:           d.cpc,
            frequency:     d.frequency,
            // Todos los action types (para diagnóstico)
            all_actions:   actions,
            // El tipo y valor elegido por RESULT_PRIORITY
            chosen_result_type:  matchedType,
            chosen_result_value: matchedValue,
            chosen_result_cost:  matchedCost,
            effective_status: statusMap[d.campaign_id as string] ?? 'UNKNOWN',
          }
        })

        // Totales rápidos para comparar con Meta Ads Manager
        const totalSpend       = debugRows.reduce((s: number, r: Record<string, unknown>) => s + (parseFloat(r.spend as string) || 0), 0)
        const totalImpressions = debugRows.reduce((s: number, r: Record<string, unknown>) => s + (parseInt(r.impressions as string) || 0), 0)
        const totalReach       = debugRows.reduce((s: number, r: Record<string, unknown>) => s + (parseInt(r.reach as string) || 0), 0)
        const totalClicks      = debugRows.reduce((s: number, r: Record<string, unknown>) => s + (parseInt(r.clicks as string) || 0), 0)
        const totalResults     = debugRows.reduce((s: number, r: Record<string, unknown>) => s + ((r.chosen_result_value as number) || 0), 0)

        results.push({
          profile_id,
          meta_ad_account_id,
          date_preset: DATE_PRESET,
          campaigns_count: debugRows.length,
          totals: {
            spend:       totalSpend.toFixed(2),
            impressions: totalImpressions,
            reach:       totalReach,
            clicks:      totalClicks,
            results:     totalResults,
          },
          campaigns: debugRows,
        })
        continue
      }

      // ── 3. Build rows ─────────────────────────────────────────
      const rows = (insightsData.data ?? []).map((d: Record<string, unknown>) => {
        const actions       = (d.actions as Array<{ action_type: string; value: string }>) ?? []
        const costPerAction = (d.cost_per_action_type as Array<{ action_type: string; value: string }>) ?? []

        let resultType    = 'link_click'
        let resultValue   = 0
        let costPerResult = 0

        for (const type of RESULT_PRIORITY) {
          const a = actions.find(x => x.action_type === type)
          if (a) {
            resultType    = type
            resultValue   = parseFloat(a.value) || 0
            const c = costPerAction.find(x => x.action_type === type)
            costPerResult = c ? parseFloat(c.value) || 0 : 0
            break
          }
        }

        const campaignId = d.campaign_id as string | undefined
        const effectiveStatus   = campaignId ? (statusMap[campaignId]    ?? 'PAUSED') : 'PAUSED'
        const campaignStartTime = campaignId ? (startTimeMap[campaignId] ?? null)     : null

        return {
          profile_id,
          date_start:            d.date_start as string,
          date_stop:             d.date_stop  as string,
          spend:            parseFloat(d.spend       as string) || 0,
          impressions:      parseInt   (d.impressions as string) || 0,
          reach:            parseInt   (d.reach       as string) || 0,
          clicks:           parseInt   (d.clicks      as string) || 0,
          ctr:              parseFloat (d.ctr         as string) || 0,
          cpc:              parseFloat (d.cpc         as string) || 0,
          cpp:              parseFloat (d.cpp         as string) || 0,
          frequency:        parseFloat (d.frequency   as string) || 0,
          results:          resultValue,
          cost_per_result:  costPerResult,
          result_type:      resultType,
          campaign_name:        (d.campaign_name as string) ?? null,
          campaign_id:          campaignId ?? null,
          effective_status:     effectiveStatus,
          campaign_start_time:  campaignStartTime,
          fetched_at:           new Date().toISOString(),
        }
      })

      // ── 4. Upsert métricas ────────────────────────────────────
      if (rows.length > 0) {
        const { error: upsertErr } = await supabase
          .from('meta_metrics')
          .upsert(rows, { onConflict: 'profile_id,campaign_id' })
        if (upsertErr) results.push({ profile_id, error: upsertErr.message })
        else results.push({ profile_id, ok: true, campaigns: rows.length })
      } else {
        results.push({ profile_id, ok: true, campaigns: 0, note: 'Sin datos en los últimos 30 días' })
      }

    } catch (e) {
      results.push({ profile_id, error: String(e) })
    }
  }

  return json({ ok: true, processed: assignments.length, debug: debugMode, results })
})

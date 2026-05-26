import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️  Faltan variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local')
}

// Singleton a nivel de módulo — el sistema de módulos ES garantiza una sola instancia.
// No se expone en window para evitar manipulación desde consola/devtools.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Tipos de la base de datos ──────────────────────────────────

export interface Profile {
  id: string
  full_name: string
  business_name: string
  avatar_url: string | null
  is_admin: boolean          // true = Daniel (puede ver panel /admin)
  created_at: string
  username: string | null    // @handle único, solo editable por admin
  email: string | null       // guardado para poder buscar por username en login
  // meta_ad_account_id y META_SYSTEM_TOKEN NUNCA bajan al cliente
}

export interface MetaMetrics {
  id: string
  profile_id: string
  date_start: string
  date_stop: string
  // Métricas principales
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  cpp: number
  // Resultados (conversiones, leads, etc.)
  results: number
  cost_per_result: number
  result_type: string         // 'lead', 'purchase', 'link_click', etc.
  // Frecuencia
  frequency: number
  // Engagement
  post_engagements: number
  // Desglose por campaña (opcional)
  campaign_name: string | null
  campaign_id: string | null
  // Estado real de la campaña en Meta (ACTIVE | PAUSED | DELETED | ARCHIVED | ...)
  effective_status:    string | null
  // Estado manual fijado por el admin — nunca lo toca el sync automático.
  // Si es null → se usa effective_status para el display.
  manual_status:       string | null
  campaign_start_time: string | null  // fecha real de inicio de la campaña en Meta
  // Cuándo se descargó
  fetched_at: string
}

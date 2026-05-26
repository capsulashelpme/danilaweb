import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Lee un valor de site_settings en tiempo real.
 * Retorna [value, loading].
 */
export function useSiteSetting(key: string, fallback = '') {
  const [value,   setValue]   = useState(fallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Carga inicial
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single()
      .then(({ data }) => {
        if (!mounted) return
        // Solo actualiza si hay valor real (no sobreescribir con undefined/null)
        if (data?.value != null && data.value !== '') setValue(data.value)
        setLoading(false)
      })

    // Realtime — nombre único por montaje para evitar reúso en StrictMode
    const ch = supabase
      .channel(`site-setting-${key}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',   // UPDATE e INSERT
        schema: 'public',
        table: 'site_settings',
        filter: `key=eq.${key}`,
      }, (payload) => {
        if (!mounted) return
        const v = (payload.new as { value?: string }).value
        if (v != null && v !== '') setValue(v)
      })
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(ch)
    }
  }, [key])

  return [value, loading] as const
}

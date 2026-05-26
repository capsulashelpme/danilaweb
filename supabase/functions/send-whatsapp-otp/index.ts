/**
 * Edge Function: send-whatsapp-otp
 *
 * Recibe: { phone: "+521234567890" }
 * Genera un código de 6 dígitos, lo guarda en phone_otps,
 * y lo envía por WhatsApp usando la Meta Cloud API.
 *
 * Secrets necesarios en Supabase:
 *   WHATSAPP_TOKEN        → token de tu WhatsApp Business App
 *   WHATSAPP_PHONE_ID     → ID del número de teléfono de WhatsApp Business
 *   DEV_MODE              → "true" durante desarrollo (retorna el código en la respuesta)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone } = await req.json()

    // Validar formato de teléfono
    const cleaned = phone?.toString().replace(/\s+/g, '').replace(/[^\d+]/g, '')
    if (!cleaned || cleaned.length < 10) {
      return json({ error: 'Número de teléfono inválido' }, 400)
    }

    // Normalizar: asegurar que tenga código de país
    const normalized = cleaned.startsWith('+') ? cleaned : `+52${cleaned}`

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Rate limit: máximo 3 OTPs por teléfono en los últimos 10 minutos
    const { count } = await supabase
      .from('phone_otps')
      .select('*', { count: 'exact', head: true })
      .eq('phone', normalized)
      .gt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

    if ((count ?? 0) >= 3) {
      return json({ error: 'Demasiados intentos. Espera 10 minutos.' }, 429)
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min

    // Guardar en BD
    await supabase.from('phone_otps').insert({
      phone: normalized,
      code,
      expires_at: expiresAt,
    })

    const DEV_MODE = Deno.env.get('DEV_MODE') === 'true'
    const WA_TOKEN   = Deno.env.get('WHATSAPP_TOKEN')
    const WA_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID')

    if (DEV_MODE || !WA_TOKEN || !WA_PHONE_ID) {
      // ── MODO DESARROLLO: devuelve el código en la respuesta ──
      // Nunca en producción
      console.log(`[DEV] OTP para ${normalized}: ${code}`)
      return json({
        ok: true,
        dev_code: code,  // solo visible en dev
        message: 'MODO DESARROLLO: el código está en dev_code',
        expires_in: 300,
      })
    }

    // ── PRODUCCIÓN: enviar por WhatsApp ──
    const phoneForApi = normalized.replace('+', '') // sin el +

    const waResponse = await fetch(
      `https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneForApi,
          type: 'template',
          template: {
            name: 'otp_code',          // nombre del template aprobado
            language: { code: 'es_MX' },
            components: [{
              type: 'body',
              parameters: [{ type: 'text', text: code }],
            }, {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [{ type: 'text', text: code }],
            }],
          },
        }),
      }
    )

    const waJson = await waResponse.json()

    if (waJson.error) {
      console.error('WhatsApp API error:', waJson.error)
      return json({ error: `Error al enviar WhatsApp: ${waJson.error.message}` }, 500)
    }

    return json({ ok: true, expires_in: 300 })

  } catch (e) {
    console.error(e)
    return json({ error: 'Error interno del servidor' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

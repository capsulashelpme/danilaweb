/**
 * Edge Function: verify-whatsapp-otp
 * Verifica el código OTP y devuelve una sesión de Supabase.
 * NUNCA crea usuarios duplicados — busca por email derivado primero.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function phoneToEmail(phone: string): string {
  return `${phone.replace('+', '')}@wa.danilaweb.app`
}

function phoneToPassword(phone: string, secret: string): string {
  return `wa_${phone.replace('+', '')}_${secret}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { phone, code } = await req.json()
    if (!phone || !code) return json({ error: 'Teléfono y código son requeridos' }, 400)

    const normalized = phone.toString().startsWith('+')
      ? phone.toString()
      : `+52${phone.toString()}`

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ── 1. Verificar OTP ──────────────────────────────────────
    const { data: otpRows } = await supabaseAdmin
      .from('phone_otps')
      .select('*')
      .eq('phone', normalized)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    const otp = otpRows?.[0]
    if (!otp) return json({ error: 'El código expiró o no existe. Solicita uno nuevo.' }, 400)

    // Incrementar intentos
    await supabaseAdmin.from('phone_otps')
      .update({ attempts: otp.attempts + 1 })
      .eq('id', otp.id)

    if (otp.attempts >= 5) {
      await supabaseAdmin.from('phone_otps').update({ used: true }).eq('id', otp.id)
      return json({ error: 'Demasiados intentos fallidos. Solicita un código nuevo.' }, 400)
    }

    if (otp.code !== code.toString().trim()) {
      return json({ error: 'Código incorrecto' }, 400)
    }

    // Marcar OTP como usado
    await supabaseAdmin.from('phone_otps').update({ used: true }).eq('id', otp.id)

    // ── 2. Buscar o crear usuario ─────────────────────────────
    const derivedEmail    = phoneToEmail(normalized)
    const derivedPassword = phoneToPassword(normalized, Deno.env.get('OTP_SECRET') ?? 'dev-secret')

    // Intentar login primero — si el usuario ya existe, esto funciona directamente
    const supabasePublic = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const { data: existingSession } = await supabasePublic.auth.signInWithPassword({
      email: derivedEmail,
      password: derivedPassword,
    })

    if (existingSession?.session) {
      // Usuario ya existía — actualizar teléfono en perfil si hace falta
      await supabaseAdmin.from('profiles')
        .update({ phone: normalized })
        .eq('id', existingSession.user!.id)
        .is('phone', null)

      return json({
        ok: true,
        access_token:  existingSession.session.access_token,
        refresh_token: existingSession.session.refresh_token,
        expires_at:    existingSession.session.expires_at,
        user_id:       existingSession.user!.id,
      })
    }

    // ── 3. Usuario no existe — crearlo ────────────────────────
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: derivedEmail,
      password: derivedPassword,
      email_confirm: true,
      user_metadata: { phone: normalized },
    })

    if (createErr || !newUser.user) {
      return json({ error: `Error al crear usuario: ${createErr?.message}` }, 500)
    }

    // Crear perfil manualmente si el trigger no lo hizo
    await supabaseAdmin.from('profiles').upsert({
      id: newUser.user.id,
      full_name: normalized,   // el cliente lo puede cambiar después
      business_name: '',
      phone: normalized,
      is_admin: false,
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    // ── 4. Iniciar sesión con el nuevo usuario ────────────────
    const { data: newSession, error: signInErr } = await supabasePublic.auth.signInWithPassword({
      email: derivedEmail,
      password: derivedPassword,
    })

    if (signInErr || !newSession.session) {
      return json({ error: `Error al iniciar sesión: ${signInErr?.message}` }, 500)
    }

    return json({
      ok: true,
      access_token:  newSession.session.access_token,
      refresh_token: newSession.session.refresh_token,
      expires_at:    newSession.session.expires_at,
      user_id:       newUser.user.id,
    })

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

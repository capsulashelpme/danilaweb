import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { plan } = body

    // Planes válidos: subscripciones del dashboard + planes de la sección "Elige tu ruta"
    const VALID_PLANS = ['monthly', 'annual', 'ads', 'organico', 'web']
    if (!VALID_PLANS.includes(plan)) {
      return new Response(JSON.stringify({ error: `Plan inválido. Valores aceptados: ${VALID_PLANS.join(', ')}.` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Auth: get user from JWT ───────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: corsHeaders })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user }, error: userError } = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    ).auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) return new Response(JSON.stringify({ error: 'Usuario no válido' }), { status: 401, headers: corsHeaders })

    // ── Get profile ───────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, business_name')
      .eq('id', user.id)
      .single()

    // ── Stripe setup ──────────────────────────────────────────
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    // Mapa de planes → variables de entorno con el price_id de Stripe
    const priceEnvMap: Record<string, string> = {
      monthly:  'STRIPE_PRICE_MONTHLY',
      annual:   'STRIPE_PRICE_ANNUAL',
      ads:      'STRIPE_PRICE_ADS',       // Plan Publicidad Pagada (suscripción mensual)
      organico: 'STRIPE_PRICE_ORGANICO',  // Plan Estrategia Orgánica (suscripción mensual)
      web:      'STRIPE_PRICE_WEB',       // Plan Página Web (pago único)
    }
    const priceId = Deno.env.get(priceEnvMap[plan])
    if (!priceId) {
      console.error(`Secret faltante: ${priceEnvMap[plan]} no está configurado en Edge Function secrets`)
      return new Response(JSON.stringify({ error: `Configuración incompleta: falta el price ID para el plan "${plan}". Agrega ${priceEnvMap[plan]} en los secrets de la Edge Function.` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Modo de pago: 'web' es pago único; el resto son suscripciones
    const checkoutMode = plan === 'web' ? 'payment' : 'subscription'

    // ── Find or create Stripe customer ────────────────────────
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('profile_id', user.id)
      .maybeSingle()

    let customerId = existingSub?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: profile?.business_name || profile?.full_name || 'Cliente DOGMA',
        phone: profile?.phone || undefined,
        metadata: { profile_id: user.id },
      })
      customerId = customer.id
    }

    // ── Create Checkout Session ───────────────────────────────
    const appUrl = Deno.env.get('APP_URL') || 'https://danilaweb.com'

    // URL de retorno: planes de landing page regresan al home; planes del dashboard al dashboard
    const fromLanding = ['ads', 'organico', 'web'].includes(plan)
    const successUrl = fromLanding
      ? `${appUrl}/?payment=success`
      : `${appUrl}/dashboard?payment=success`
    const cancelUrl = fromLanding
      ? `${appUrl}/`
      : `${appUrl}/dashboard?payment=cancelled`

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: checkoutMode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        profile_id: user.id,
        plan,
      },
      locale: 'es',
    })

    // ── Guardar registro pendiente (solo para planes de suscripción) ──────────
    if (checkoutMode === 'subscription') {
      await supabase.from('subscriptions').upsert({
        profile_id: user.id,
        stripe_customer_id: customerId,
        stripe_price_id: priceId,
        plan,
        status: 'incomplete',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' })
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('create-checkout error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  console.log('Stripe event:', event.type)

  // ── Handle events ─────────────────────────────────────────
  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const profileId = session.metadata?.profile_id
      const plan = session.metadata?.plan as 'monthly' | 'annual'
      if (!profileId) break

      // Update subscription
      await supabase.from('subscriptions').upsert({
        profile_id: profileId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        stripe_price_id: session.metadata?.price_id,
        plan,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' })

      // Record payment
      await supabase.from('payments').insert({
        profile_id: profileId,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? 'mxn',
        status: 'succeeded',
        plan,
      })
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const profileId = sub.metadata?.profile_id

      // Find profile by customer if metadata missing
      let resolvedProfileId = profileId
      if (!resolvedProfileId) {
        const { data } = await supabase
          .from('subscriptions')
          .select('profile_id')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle()
        resolvedProfileId = data?.profile_id
      }
      if (!resolvedProfileId) break

      await supabase.from('subscriptions').update({
        status: 'active',
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', sub.id)

      await supabase.from('payments').insert({
        profile_id: resolvedProfileId,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent as string,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        plan: sub.items.data[0]?.price.recurring?.interval === 'year' ? 'annual' : 'monthly',
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const { data } = await supabase
        .from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', invoice.subscription as string)
        .select('profile_id')
        .single()

      if (data) {
        await supabase.from('payments').insert({
          profile_id: data.profile_id,
          stripe_invoice_id: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
          plan: null,
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions').update({
        status: sub.status,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions').update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    default:
      console.log('Unhandled event:', event.type)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

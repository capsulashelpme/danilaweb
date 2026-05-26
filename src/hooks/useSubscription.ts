import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Subscription {
  id: string
  profile_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: 'monthly' | 'annual' | null
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'inactive' | string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  plan: 'monthly' | 'annual' | null
  created_at: string
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    const [subRes, payRes] = await Promise.all([
      supabase.from('subscriptions').select('*').maybeSingle(),
      supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(10),
    ])
    setSubscription(subRes.data ?? null)
    setPayments(payRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const checkout = async (plan: 'monthly' | 'annual') => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await supabase.functions.invoke('create-checkout', {
      body: { plan },
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (res.data?.url) {
      window.location.href = res.data.url
    } else {
      console.error('Checkout error:', res.error)
      alert('Error al iniciar el pago. Intenta de nuevo.')
    }
  }

  // Days until period ends
  const daysLeft = subscription?.current_period_end
    ? Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / 86400000)
    : null

  const isActive = subscription?.status === 'active'
  const isPastDue = subscription?.status === 'past_due'
  const isDueSoon = daysLeft !== null && daysLeft <= 5 && isActive

  return { subscription, payments, loading, checkout, daysLeft, isActive, isPastDue, isDueSoon, refetch: fetch }
}

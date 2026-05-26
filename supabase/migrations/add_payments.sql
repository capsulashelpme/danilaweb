-- ── Subscriptions table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id              uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id      text,
  stripe_subscription_id  text UNIQUE,
  stripe_price_id         text,
  plan                    text CHECK (plan IN ('monthly', 'annual')),
  status                  text DEFAULT 'inactive',
  -- 'active' | 'past_due' | 'canceled' | 'incomplete' | 'inactive'
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean DEFAULT false,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

-- ── Payments history table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id                  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id    text UNIQUE,
  stripe_checkout_session_id  text UNIQUE,
  stripe_invoice_id           text,
  amount                      integer NOT NULL, -- in cents (MXN)
  currency                    text DEFAULT 'mxn',
  status                      text DEFAULT 'pending',
  -- 'pending' | 'succeeded' | 'failed'
  plan                        text CHECK (plan IN ('monthly', 'annual')),
  created_at                  timestamptz DEFAULT now()
);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Clients can only see their own
CREATE POLICY "client_read_own_subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "client_read_own_payments" ON public.payments
  FOR SELECT USING (auth.uid() = profile_id);

-- Admin can read all
CREATE POLICY "admin_read_subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_admin_check());

CREATE POLICY "admin_read_payments" ON public.payments
  FOR ALL USING (public.is_admin_check());

-- Service role bypasses RLS (for webhooks)
-- No extra policy needed — service role key bypasses RLS by default

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON public.subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_payments_profile_id ON public.payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

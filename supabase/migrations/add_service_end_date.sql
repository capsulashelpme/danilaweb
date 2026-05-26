-- ── Service end date: admin sets manually when client's service period ends ──
ALTER TABLE public.client_ad_accounts
  ADD COLUMN IF NOT EXISTS service_end_date date;

-- Index for quick expiry queries
CREATE INDEX IF NOT EXISTS idx_client_ad_accounts_service_end
  ON public.client_ad_accounts(service_end_date);

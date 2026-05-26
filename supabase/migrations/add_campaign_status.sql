-- Add real campaign status and ID from Meta
ALTER TABLE public.meta_metrics
  ADD COLUMN IF NOT EXISTS campaign_id     text,
  ADD COLUMN IF NOT EXISTS effective_status text;  -- ACTIVE | PAUSED | DELETED | ARCHIVED

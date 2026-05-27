-- Agregar columnas de pago y periodo a profiles
-- Así cualquier cliente puede tener estos datos aunque no tenga Ad Account asignado

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_status text
  CHECK (payment_status IN ('paid_monthly', 'paid_annual'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS service_start_date date;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS service_end_date date;

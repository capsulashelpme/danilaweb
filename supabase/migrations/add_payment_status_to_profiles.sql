-- Agregar payment_status a profiles
-- Así cualquier cliente puede tener estado de pago aunque no tenga Ad Account asignado

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_status text
  CHECK (payment_status IN ('paid_monthly', 'paid_annual'));

-- ── Función helper is_admin_check() ─────────────────────────────────────────
-- Referenciada en add_payments.sql para policies de subscriptions/payments
-- Si falta esta función las policies arrojan error al ejecutarse
CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- ================================================================
-- SEGURIDAD: Correcciones críticas de RLS y trigger
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- Fecha: 2026-05-24
-- ================================================================

-- ──────────────────────────────────────────────────────────────
-- FIX 1 (CRÍTICO): El trigger handle_new_user NO debe leer
-- is_admin desde raw_user_meta_data.
-- Cualquier persona podía hacer POST /auth/v1/signup con
-- {"data":{"is_admin":true}} y obtener acceso de admin.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name',     'Cliente'),
    COALESCE(new.raw_user_meta_data->>'business_name', 'Negocio'),
    false   -- SIEMPRE false — is_admin NUNCA viene de metadata de usuario
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;


-- ──────────────────────────────────────────────────────────────
-- FIX 2 (CRÍTICO): La policy UPDATE de profiles no restringía
-- la columna is_admin. Un cliente podía ejecutar desde DevTools:
--   supabase.from('profiles').update({is_admin:true}).eq('id','...')
-- y escalar a admin.
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "perfil: usuario edita el suyo" ON public.profiles;

CREATE POLICY "perfil: usuario edita el suyo"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- is_admin no puede cambiar: el nuevo valor debe ser igual al actual
    AND is_admin = (
      SELECT is_admin FROM public.profiles WHERE id = auth.uid()
    )
  );


-- ──────────────────────────────────────────────────────────────
-- FIX 3 (ALTO): La función is_admin_check() era referenciada
-- en las policies de subscriptions/payments pero no existía,
-- causando que el admin no pudiera ver pagos desde el panel.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Confirmar que las policies de pagos usan la función correctamente
-- (Si ya existen con este nombre, no hace falta recrearlas;
--  si dan error al crearlas es porque ya existen y están OK.)
DO $$
BEGIN
  -- subscriptions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscriptions' AND policyname = 'admin_read_subscriptions'
  ) THEN
    EXECUTE '
      CREATE POLICY "admin_read_subscriptions" ON public.subscriptions
        FOR ALL USING (public.is_admin_check())
    ';
  END IF;

  -- payments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payments' AND policyname = 'admin_read_payments'
  ) THEN
    EXECUTE '
      CREATE POLICY "admin_read_payments" ON public.payments
        FOR ALL USING (public.is_admin_check())
    ';
  END IF;
END $$;


-- ──────────────────────────────────────────────────────────────
-- VERIFICACIÓN (opcional — corre después para confirmar):
-- ──────────────────────────────────────────────────────────────
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
-- SELECT proname FROM pg_proc WHERE proname = 'is_admin_check';
-- SELECT policyname, cmd, qual, with_check FROM pg_policies
--   WHERE tablename = 'profiles' AND policyname = 'perfil: usuario edita el suyo';
-- ================================================================

-- ── Corrección: handle_new_user nunca debe tomar is_admin de metadata ────────
-- Antes: leía raw_user_meta_data->>'is_admin', lo que permitía que cualquier
--        persona que llamara /auth/v1/signup con data.is_admin=true obtuviera
--        un perfil de admin.
-- Después: is_admin siempre false en el INSERT; solo un admin con service_role
--          puede cambiarlo con UPDATE.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name',     'Cliente'),
    COALESCE(new.raw_user_meta_data->>'business_name', 'Negocio'),
    false  -- siempre false; is_admin solo lo cambia un admin con service_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

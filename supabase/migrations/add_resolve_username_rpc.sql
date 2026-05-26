-- ── Función RPC para resolver username → email ───────────────────────────────
-- Usada por AuthContext.tsx signInByUsername() para login con @handle
-- SECURITY DEFINER: puede leer profiles sin exponer otros datos
CREATE OR REPLACE FUNCTION public.resolve_username_to_email(handle text)
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT email
  FROM public.profiles
  WHERE lower(username) = lower(handle)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_username_to_email(text) TO anon, authenticated;

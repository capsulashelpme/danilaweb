-- Permite que un admin actualice el perfil de cualquier usuario.
-- Usa is_admin_check() (SECURITY DEFINER) para evitar recursión infinita
-- al consultar la misma tabla profiles dentro de una política de profiles.

DROP POLICY IF EXISTS "perfil: admin edita cualquiera" ON public.profiles;

CREATE POLICY "perfil: admin edita cualquiera"
  ON public.profiles FOR UPDATE
  USING (public.is_admin_check())
  WITH CHECK (public.is_admin_check());

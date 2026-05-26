-- ================================================================
-- Tabla de testimonios con moderación
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ================================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  biz         text        NOT NULL,
  service     text        DEFAULT NULL,
  text        text        NOT NULL,
  stars       integer     NOT NULL CHECK (stars BETWEEN 1 AND 5),
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','approved','rejected')),
  created_at  timestamptz DEFAULT now()
);

-- Permisos de tabla (REQUERIDO para que RLS funcione — sin esto todo falla)
GRANT SELECT, INSERT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Eliminar policies si ya existen (para poder re-ejecutar el script)
DROP POLICY IF EXISTS "testimonials: insert pending"  ON public.testimonials;
DROP POLICY IF EXISTS "testimonials: select approved" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials: admin all"       ON public.testimonials;

-- Cualquiera (incluso sin sesión) puede insertar con status = 'pending'
CREATE POLICY "testimonials: insert pending"
  ON public.testimonials FOR INSERT
  WITH CHECK (status = 'pending');

-- Solo las aprobadas son visibles públicamente
CREATE POLICY "testimonials: select approved"
  ON public.testimonials FOR SELECT
  USING (status = 'approved');

-- Admin puede leer todo, actualizar y eliminar
CREATE POLICY "testimonials: admin select all"
  ON public.testimonials FOR SELECT
  USING (public.is_admin_check());

CREATE POLICY "testimonials: admin update"
  ON public.testimonials FOR UPDATE
  USING (public.is_admin_check());

CREATE POLICY "testimonials: admin delete"
  ON public.testimonials FOR DELETE
  USING (public.is_admin_check());

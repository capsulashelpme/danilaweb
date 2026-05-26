-- ================================================================
-- Tabla de archivos multimedia administrables desde el panel admin
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ================================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
  id            uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  section       text          NOT NULL
    CHECK (section IN ('creativos_publicidad','contenido_organico','diseno_web_desarrollo')),
  type          text          NOT NULL
    CHECK (type IN ('image','video')),
  url           text          NOT NULL,
  storage_path  text          NOT NULL,
  order_index   integer       NOT NULL DEFAULT 0,
  is_active     boolean       NOT NULL DEFAULT true,
  created_at    timestamptz   DEFAULT now()
);

-- Grants
GRANT SELECT ON public.media_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;

-- RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_assets: public read active" ON public.media_assets;
DROP POLICY IF EXISTS "media_assets: admin all"          ON public.media_assets;

-- Cualquier visitante puede leer archivos activos
CREATE POLICY "media_assets: public read active"
  ON public.media_assets FOR SELECT
  USING (is_active = true);

-- Admin puede hacer todo
CREATE POLICY "media_assets: admin all"
  ON public.media_assets FOR ALL
  USING  (public.is_admin_check())
  WITH CHECK (public.is_admin_check());

-- ================================================================
-- Storage bucket: ejecutar también en SQL Editor
-- ================================================================
-- 1. Crear el bucket (si no existe) vía Dashboard:
--    Storage → New bucket → Name: "media-assets" → Public: ON
--
-- 2. O via SQL (requiere extensión storage):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('media-assets', 'media-assets', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- 3. Política de storage — solo admin puede subir/borrar:
-- CREATE POLICY "media-assets: admin upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'media-assets'
--     AND public.is_admin_check()
--   );
--
-- CREATE POLICY "media-assets: admin delete"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'media-assets'
--     AND public.is_admin_check()
--   );
--
-- CREATE POLICY "media-assets: public read"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'media-assets');

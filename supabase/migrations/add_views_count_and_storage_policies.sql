-- ── 1. Columna views_count en media_assets ────────────────────
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

-- ── 2. Políticas de Storage para el bucket media-assets ────────
-- (Las del archivo add_media_assets.sql quedaron en comentarios)

-- Lectura pública
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'media-assets: public read'
  ) THEN
    CREATE POLICY "media-assets: public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'media-assets');
  END IF;
END $$;

-- Admin: subir archivos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'media-assets: admin upload'
  ) THEN
    CREATE POLICY "media-assets: admin upload"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'media-assets'
        AND public.is_admin_check()
      );
  END IF;
END $$;

-- Admin: actualizar archivos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'media-assets: admin update'
  ) THEN
    CREATE POLICY "media-assets: admin update"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'media-assets'
        AND public.is_admin_check()
      );
  END IF;
END $$;

-- Admin: eliminar archivos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'media-assets: admin delete'
  ) THEN
    CREATE POLICY "media-assets: admin delete"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'media-assets'
        AND public.is_admin_check()
      );
  END IF;
END $$;

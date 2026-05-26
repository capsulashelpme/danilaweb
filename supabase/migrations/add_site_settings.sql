-- ── Tabla de configuración global del sitio ──────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Valor inicial del badge
INSERT INTO public.site_settings (key, value)
VALUES ('hero_badge', '2 espacios disponibles')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer (para mostrar en el hero público)
CREATE POLICY "site_settings: public read"
  ON public.site_settings FOR SELECT
  USING (true);

-- Solo admin puede modificar
CREATE POLICY "site_settings: admin write"
  ON public.site_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL    ON public.site_settings TO service_role;

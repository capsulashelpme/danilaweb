-- ================================================================
-- Tabla de productos del cliente para calcular ventas rápido
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id  uuid          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        text          NOT NULL,
  price       numeric(12,2) NOT NULL CHECK (price >= 0),
  created_at  timestamptz   DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products: owner all" ON public.products;
DROP POLICY IF EXISTS "products: admin all" ON public.products;

-- Cada cliente solo ve y edita sus propios productos
CREATE POLICY "products: owner all"
  ON public.products FOR ALL
  USING  (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Admin puede leer y editar todos
CREATE POLICY "products: admin all"
  ON public.products FOR ALL
  USING  (public.is_admin_check());

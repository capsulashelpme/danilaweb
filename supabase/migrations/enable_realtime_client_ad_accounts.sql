-- Habilita Supabase Realtime en client_ad_accounts para que el
-- Dashboard del Cliente se actualice automáticamente cuando el admin
-- cambie ventas, estado de pago o fechas de servicio.
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_ad_accounts;

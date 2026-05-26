-- ================================================================
-- SCHEMA ADICIONAL: Autenticación por WhatsApp OTP
-- Ejecuta esto en Supabase → SQL Editor → Run
-- (después de haber corrido schema.sql)
-- ================================================================

-- 1. Agregar teléfono a perfiles
alter table public.profiles
  add column if not exists phone text unique;

-- 2. Tabla de códigos OTP temporales
create table if not exists public.phone_otps (
  id          uuid        primary key default uuid_generate_v4(),
  phone       text        not null,          -- "+521234567890"
  code        text        not null,          -- "482931"
  expires_at  timestamptz not null,          -- now() + 5 minutos
  used        boolean     not null default false,
  attempts    int         not null default 0,
  created_at  timestamptz not null default now()
);

-- Índice para búsquedas rápidas por teléfono
create index if not exists idx_phone_otps_phone on public.phone_otps(phone);

-- RLS: solo service_role puede acceder (Edge Functions)
-- El cliente nunca toca esta tabla directamente
alter table public.phone_otps enable row level security;

create policy "otp: solo service role"
  on public.phone_otps for all
  using (auth.role() = 'service_role');

-- 3. Limpieza automática de OTPs expirados (corre cada hora)
-- Evita que la tabla crezca infinitamente
create or replace function public.cleanup_expired_otps()
returns void language sql security definer as $$
  delete from public.phone_otps
  where expires_at < now() - interval '1 hour';
$$;

-- ================================================================
-- NOTA: Los usuarios se crean con un email derivado del teléfono:
--   +521234567890  →  521234567890@wa.danilaweb.app
-- Esto es interno — el cliente nunca ve ese email.
-- Solo ve su número de teléfono como identificador.
-- ================================================================

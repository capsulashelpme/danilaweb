-- ================================================================
-- SCHEMA: Dashboard de cliente — Daniel Quintana
-- Ejecuta esto en: Supabase Dashboard → SQL Editor → Run
-- ================================================================
--
-- MODELO MENTAL:
--   Daniel tiene 1 cuenta de Meta Business Manager.
--   Esa cuenta controla N cuentas publicitarias (una por cliente).
--   El token de Meta es UNO SOLO (el de Daniel) → guardado en
--   Supabase Edge Function Secrets, NUNCA en la base de datos.
--   Cada cliente solo tiene asignado su Ad Account ID (act_XXXXX).
--   La Edge Function usa: token de Daniel + act del cliente = métricas correctas.
-- ================================================================


-- ── 1. Extensión uuid ──────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ── 2. Perfiles de clientes ────────────────────────────────────
-- Lo que el cliente puede ver de sí mismo.
create table if not exists public.profiles (
  id             uuid references auth.users on delete cascade primary key,
  full_name      text        not null default 'Cliente',
  business_name  text        not null default 'Negocio',
  avatar_url     text,
  is_admin       boolean     not null default false,  -- true = Daniel (admin)
  created_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cliente ve y edita solo su propio perfil
create policy "perfil: usuario lee el suyo"
  on public.profiles for select
  using (auth.uid() = id);

create policy "perfil: usuario edita el suyo"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin (Daniel) puede leer TODOS los perfiles
create policy "perfil: admin lee todos"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Service role sin restricciones
create policy "perfil: service role total"
  on public.profiles for all
  using (auth.role() = 'service_role');


-- ── 3. Asignación cliente → cuenta de Meta Ads ─────────────────
-- Daniel asigna aquí el act_XXXXX de cada cliente.
-- El token NO está aquí — vive en Supabase Secrets (env var).
create table if not exists public.client_ad_accounts (
  profile_id         uuid references public.profiles on delete cascade primary key,
  meta_ad_account_id text not null,   -- "act_123456789"
  label              text,            -- nota interna de Daniel, ej: "Clínica Sonrisa"
  active             boolean not null default true,
  assigned_at        timestamptz not null default now(),
  assigned_by        uuid references public.profiles(id)
);

alter table public.client_ad_accounts enable row level security;

-- El cliente puede ver su propia asignación (solo el act_id, no el token)
-- Esto le permite saber que su cuenta está conectada, pero el token nunca baja
create policy "ad_account: cliente ve la suya"
  on public.client_ad_accounts for select
  using (auth.uid() = profile_id);

-- Admin puede ver y gestionar todas
create policy "ad_account: admin gestiona todas"
  on public.client_ad_accounts for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Service role sin restricciones (Edge Function)
create policy "ad_account: service role total"
  on public.client_ad_accounts for all
  using (auth.role() = 'service_role');


-- ── 4. Métricas de Meta Ads (por cliente) ─────────────────────
create table if not exists public.meta_metrics (
  id               uuid        primary key default uuid_generate_v4(),
  profile_id       uuid        references public.profiles on delete cascade not null,
  date_start       date,
  date_stop        date,
  spend            numeric(12,2) default 0,
  impressions      bigint        default 0,
  reach            bigint        default 0,
  clicks           bigint        default 0,
  ctr              numeric(8,4)  default 0,
  cpc              numeric(10,2) default 0,
  cpp              numeric(10,2) default 0,
  frequency        numeric(6,3)  default 0,
  results          numeric(12,2) default 0,
  cost_per_result  numeric(10,2) default 0,
  result_type      text          default 'link_click',
  campaign_name    text,
  fetched_at       timestamptz   not null default now()
);

create index if not exists idx_meta_metrics_profile   on public.meta_metrics(profile_id);
create index if not exists idx_meta_metrics_fetched   on public.meta_metrics(fetched_at desc);

alter table public.meta_metrics enable row level security;

-- Cliente solo ve sus propias métricas
create policy "metrics: cliente ve las suyas"
  on public.meta_metrics for select
  using (auth.uid() = profile_id);

-- Admin ve todas
create policy "metrics: admin ve todas"
  on public.meta_metrics for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Service role escribe (Edge Function)
create policy "metrics: service role total"
  on public.meta_metrics for all
  using (auth.role() = 'service_role');

-- Habilitar real-time
alter publication supabase_realtime add table public.meta_metrics;


-- ── 5. Trigger: auto-crear perfil al registrar usuario ─────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, business_name, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',     'Cliente'),
    coalesce(new.raw_user_meta_data->>'business_name', 'Negocio'),
    false  -- siempre false; is_admin solo lo cambia un admin con service_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ================================================================
-- CÓMO CREAR UN CLIENTE (paso a paso):
--
-- 1. Supabase → Authentication → Users → Add user
--    Email: cliente@negocio.com  |  Password: la que tú definas
--    User Metadata (JSON):
--      { "full_name": "Juan Pérez", "business_name": "Clínica Dental" }
--    → El trigger crea automáticamente el perfil.
--
-- 2. Asignar su cuenta de Meta Ads (tú lo haces desde Table Editor o SQL):
--    INSERT INTO client_ad_accounts (profile_id, meta_ad_account_id, label)
--    VALUES ('<uuid del usuario>', 'act_123456789', 'Clínica Dental');
--
-- 3. O usa el Panel de Admin de la web (/admin) para hacer esto visualmente.
--
-- ================================================================
-- CÓMO CONFIGURAR EL TOKEN DE META (una sola vez):
--
-- 1. Meta Business Manager → Configuración → Usuarios del sistema
-- 2. Crea un "Usuario del sistema" con rol Empleado
-- 3. Dale acceso a todas las cuentas publicitarias de tus clientes
-- 4. Genera un token de larga duración (nunca expira) con permisos:
--    ads_read, ads_management, read_insights, business_management
-- 5. Guárdalo en Supabase → Edge Functions → Secrets:
--    Nombre: META_SYSTEM_TOKEN
--    Valor:  EAAxxxxxxxxxx...
--
-- ESE TOKEN NUNCA ENTRA A LA BASE DE DATOS.
-- ================================================================
--
-- PARA MARCAR A DANIEL COMO ADMIN:
--    UPDATE profiles SET is_admin = true WHERE id = '<tu uuid>';
-- ================================================================

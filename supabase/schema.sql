-- =========================================================================
-- schema.sql
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- =========================================================================

-- 1. Tabla de demostración para el Dashboard --------------------------------
create table if not exists public.dashboard_data (
  id          bigint generated always as identity primary key,
  title       text not null,
  description text not null,
  created_at  timestamptz not null default now()
);

comment on table public.dashboard_data is
  'Tabla de demostración consumida por el Dashboard de la aplicación.';

-- 2. Activar Row Level Security (RLS) ---------------------------------------
-- Con RLS activo, por defecto NADIE puede leer/escribir hasta que se
-- definan políticas explícitas. Aplica el principio de mínimo privilegio.
alter table public.dashboard_data enable row level security;

-- 3. Políticas RLS ------------------------------------------------------------
-- Política de LECTURA: cualquier usuario autenticado (rol "authenticated")
-- puede leer los registros. No se permite lectura anónima ni escritura
-- desde el frontend, ya que este proyecto solo necesita consumir datos.
drop policy if exists "Usuarios autenticados pueden leer dashboard_data" on public.dashboard_data;
create policy "Usuarios autenticados pueden leer dashboard_data"
  on public.dashboard_data
  for select
  to authenticated
  using (true);

-- No se crean políticas de insert/update/delete a propósito:
-- sin una política que lo permita, RLS bloquea esas operaciones desde el
-- cliente anon/authenticated. La carga de datos de ejemplo se hace desde
-- el SQL Editor (con privilegios de administrador), no desde la app.

-- 4. Datos de ejemplo ---------------------------------------------------------
insert into public.dashboard_data (title, description) values
  ('Bienvenida', 'Este registro confirma que el Dashboard consume datos reales desde Supabase.'),
  ('Arquitectura', 'React se conecta a Supabase mediante el cliente oficial (@supabase/supabase-js).'),
  ('Seguridad', 'RLS está activo: solo usuarios autenticados pueden leer esta tabla.');

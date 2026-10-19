-- =============================================================================
-- 0000_baseline.sql — Baseline do schema ManutFlow
-- =============================================================================
-- AUD-02 · Este arquivo versiona o schema que já existe em produção (o banco
-- foi reconstruído por introspecção do PostgREST/OpenAPI em 2026-10-19).
--
-- Características:
--   * IDEMPOTENTE — usa `if not exists` / `drop ... if exists`. Pode ser
--     executado em um banco já provisionado: ele só ADICIONA o que falta
--     (tabelas, políticas, índices, triggers). Nunca remove dados.
--   * Serve para provisionar ambientes novos (staging, CI, dev local).
--   * Para o baseline canônico gerado pelo Supabase, rode `supabase db pull`
--     e substitua este arquivo pelo dump retornado.
--
-- Estado verificado em produção antes deste arquivo (2026-10-19):
--   4 tabelas · 4 usuários · 44 equipamentos · 8 ordens · 25 eventos
--   CHECK de status/priority nas 3 tabelas ✅ · UNIQUE (user_id, patrimony_code) ✅
--   FK service_orders -> equipments ON DELETE RESTRICT ✅ · trigger de updated_at ✅
--   trigger de profile no signup ✅ · RLS em profiles ✅
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Perfis
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
    id          uuid primary key references auth.users (id) on delete cascade,
    email       text not null,
    full_name   text,
    avatar_url  text,
    phone       text,
    role        text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. Equipamentos
-- -----------------------------------------------------------------------------
create table if not exists public.equipments (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    patrimony_code  text not null,
    location        text not null,
    status          text not null default 'active'
                    check (status in ('active', 'inactive', 'maintenance')),
    photo_url       text,
    user_id         uuid not null references auth.users (id) on delete cascade,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    constraint equipments_patrimony_code_user_unique unique (user_id, patrimony_code)
);

-- -----------------------------------------------------------------------------
-- 3. Ordens de serviço
-- -----------------------------------------------------------------------------
create table if not exists public.service_orders (
    id            uuid primary key default gen_random_uuid(),
    title         text not null,
    description   text,
    status        text not null default 'open'
                  check (status in ('open', 'in_progress', 'closed')),
    priority      text not null default 'medium'
                  check (priority in ('low', 'medium', 'high', 'critical')),
    equipment_id  uuid not null references public.equipments (id) on delete restrict,
    due_date      date,
    user_id       uuid not null references auth.users (id) on delete cascade,
    created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. Histórico (append-only)
-- -----------------------------------------------------------------------------
create table if not exists public.service_order_history (
    id                uuid primary key default gen_random_uuid(),
    service_order_id  uuid not null references public.service_orders (id) on delete cascade,
    user_id           uuid not null references auth.users (id) on delete cascade,
    event_type        text not null,
    previous_status   text,
    new_status        text,
    description       text,
    created_at        timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 5. Índices de acesso (cobrem listagens, filtros de prazo e histórico)
-- -----------------------------------------------------------------------------
create index if not exists equipments_user_created_idx
    on public.equipments (user_id, created_at desc);

create index if not exists service_orders_user_created_idx
    on public.service_orders (user_id, created_at desc);

create index if not exists service_orders_user_due_idx
    on public.service_orders (user_id, due_date);

create index if not exists service_order_history_order_created_idx
    on public.service_order_history (service_order_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 6. Trigger: updated_at automático
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists equipments_set_updated_at on public.equipments;
create trigger equipments_set_updated_at
    before update on public.equipments
    for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 7. Trigger: cria o profile no signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, email, full_name)
    values (
        new.id,
        coalesce(new.email, ''),
        nullif(new.raw_user_meta_data ->> 'full_name', '')
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 8. RLS de profiles (as demais tabelas recebem RLS em 0001_rls_hardening.sql)
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
    for select to authenticated using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
    for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
    for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;

-- -----------------------------------------------------------------------------
-- 9. Storage: bucket de fotos de equipamentos
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('equipment-photos', 'equipment-photos', true)
on conflict (id) do nothing;

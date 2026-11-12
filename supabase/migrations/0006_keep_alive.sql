-- =============================================================================
-- 0006_keep_alive.sql — Tabela técnica isolada para keep-alive do banco
-- =============================================================================
-- Contexto:
--   Projetos no plano gratuito do Supabase são pausados automaticamente após
--   7 dias consecutivos sem atividade no PostgreSQL. Como a Landing Page (/) e
--   /api/health não consultam o banco, períodos sem login acabavam pausando o
--   projeto.
--
-- O que este arquivo faz:
--   1. Cria a tabela técnica `public.keep_alive` limitada a uma única linha
--      (id = 1) para registrar o timestamp do último heartbeat.
--   2. Habilita RLS sem políticas para `anon` ou `authenticated` e revoga
--      todos os GRANTs desses papéis — nenhuma conta de usuário (nem a demo)
--      lê ou grava nesta tabela.
--   3. Libera acesso apenas ao papel `service_role`, usado exclusivamente pela
--      rota server-side protegida `GET /api/cron/keep-alive`.
-- =============================================================================

create table if not exists public.keep_alive (
    id           smallint primary key default 1 check (id = 1),
    last_ping_at timestamptz not null default now()
);

insert into public.keep_alive (id)
values (1)
on conflict (id) do nothing;

alter table public.keep_alive enable row level security;

revoke all on public.keep_alive from public;
revoke all on public.keep_alive from anon;
revoke all on public.keep_alive from authenticated;

grant select, insert, update on public.keep_alive to service_role;

-- =============================================================================
-- Verificação pós-aplicação:
--
--   select relname, relrowsecurity
--     from pg_class
--    where relname = 'keep_alive';
--   -- esperado: 1 linha com relrowsecurity = true
--
--   select id, last_ping_at from public.keep_alive;
--   -- esperado: 1 linha (id = 1)
-- =============================================================================

-- Rollback (usar apenas se remover o recurso de keep-alive):
-- drop table if exists public.keep_alive;

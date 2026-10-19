-- =============================================================================
-- 0001_rls_hardening.sql — Fecha o vazamento cross-tenant (AUD-01 + AUD-03)
-- =============================================================================
-- Contexto:
--   Em 2026-10-19 a auditoria verificou que `equipments`, `service_orders` e
--   `service_order_history` respondiam a leituras feitas com a chave `anon`
--   (pública, embarcada no bundle do browser) retornando os dados de TODOS os
--   usuários, e que o INSERT do `anon` chegava até a checagem de FK (ou seja,
--   passava pela RLS). `profiles` estava correta e não é alterada aqui.
--
-- O que este arquivo faz:
--   1. Habilita RLS nas 3 tabelas expostas.
--   2. Cria políticas de "dono" para SELECT/INSERT/UPDATE/DELETE.
--   3. Retira os GRANTs do papel `anon` (defesa em profundidade).
--   4. Impede, no banco, que uma OS aponte para equipamento de outro usuário.
--
-- Rollback: ver bloco comentado no final do arquivo.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Habilitar RLS
-- -----------------------------------------------------------------------------
alter table public.equipments            enable row level security;
alter table public.service_orders        enable row level security;
alter table public.service_order_history enable row level security;

-- -----------------------------------------------------------------------------
-- 2. Políticas de acesso por dono
--    (drop antes de create para a migration ser re-executável)
-- -----------------------------------------------------------------------------
drop policy if exists "equipments_own_select" on public.equipments;
drop policy if exists "equipments_own_insert" on public.equipments;
drop policy if exists "equipments_own_update" on public.equipments;
drop policy if exists "equipments_own_delete" on public.equipments;

create policy "equipments_own_select" on public.equipments
    for select to authenticated using (user_id = auth.uid());

create policy "equipments_own_insert" on public.equipments
    for insert to authenticated with check (user_id = auth.uid());

create policy "equipments_own_update" on public.equipments
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "equipments_own_delete" on public.equipments
    for delete to authenticated using (user_id = auth.uid());

drop policy if exists "service_orders_own_select" on public.service_orders;
drop policy if exists "service_orders_own_insert" on public.service_orders;
drop policy if exists "service_orders_own_update" on public.service_orders;
drop policy if exists "service_orders_own_delete" on public.service_orders;

create policy "service_orders_own_select" on public.service_orders
    for select to authenticated using (user_id = auth.uid());

create policy "service_orders_own_insert" on public.service_orders
    for insert to authenticated with check (user_id = auth.uid());

create policy "service_orders_own_update" on public.service_orders
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "service_orders_own_delete" on public.service_orders
    for delete to authenticated using (user_id = auth.uid());

-- Histórico é append-only por decisão de produto: só SELECT e INSERT.
-- Sem política de UPDATE/DELETE, a RLS nega as duas operações.
drop policy if exists "history_own_select" on public.service_order_history;
drop policy if exists "history_own_insert" on public.service_order_history;

create policy "history_own_select" on public.service_order_history
    for select to authenticated using (user_id = auth.uid());

create policy "history_own_insert" on public.service_order_history
    for insert to authenticated with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 3. Endurecimento de GRANTs
--    A RLS já bloqueia o anon; retirar o GRANT garante o bloqueio em qualquer
--    caminho (inclusive se alguém desabilitar RLS por engano no futuro).
-- -----------------------------------------------------------------------------
revoke all on public.equipments            from anon;
revoke all on public.service_orders        from anon;
revoke all on public.service_order_history from anon;

grant select, insert, update, delete on public.equipments            to authenticated;
grant select, insert, update, delete on public.service_orders        to authenticated;
grant select, insert         on public.service_order_history to authenticated;

-- -----------------------------------------------------------------------------
-- 4. Anti-IDOR no banco (AUD-03)
--    A FK de service_orders garante que o equipamento existe, mas não que ele
--    pertence ao mesmo usuário. Este trigger fecha essa brecha mesmo que a API
--    seja contornada por uma chamada direta ao PostgREST.
-- -----------------------------------------------------------------------------
create or replace function public.enforce_order_equipment_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not exists (
        select 1
          from public.equipments e
         where e.id = new.equipment_id
           and e.user_id = new.user_id
    ) then
        raise exception 'equipment_id nao pertence ao usuario da ordem'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists service_orders_equipment_owner on public.service_orders;
create trigger service_orders_equipment_owner
    before insert or update of equipment_id, user_id on public.service_orders
    for each row execute function public.enforce_order_equipment_owner();

-- =============================================================================
-- Verificação pós-aplicação (deve retornar 3 linhas com rowsecurity = true):
--
--   select relname, relrowsecurity
--     from pg_class
--    where relname in ('equipments', 'service_orders', 'service_order_history');
--
-- E, do lado do cliente, o Anexo B da AUDITORIA.md:
--   * anon  -> GET /rest/v1/equipments  deve retornar 401/403 (sem GRANT)
--   * JWT   -> GET /rest/v1/equipments  deve retornar apenas as linhas do dono
--   * JWT   -> POST /rest/v1/service_orders com equipment_id alheio
--              deve falhar com 42501
-- =============================================================================

-- =============================================================================
-- ROLLBACK (executar apenas em emergência)
-- -----------------------------------------------------------------------------
-- alter table public.equipments            disable row level security;
-- alter table public.service_orders        disable row level security;
-- alter table public.service_order_history disable row level security;
-- grant all on public.equipments, public.service_orders,
--              public.service_order_history to anon;
-- drop trigger if exists service_orders_equipment_owner on public.service_orders;
-- drop function if exists public.enforce_order_equipment_owner();
-- =============================================================================

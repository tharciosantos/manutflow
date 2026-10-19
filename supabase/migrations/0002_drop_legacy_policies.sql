-- =============================================================================
-- 0002_drop_legacy_policies.sql — Fecha AUD-01 (parte 2)
-- =============================================================================
-- Por que este arquivo existe:
--   Após aplicar 0001, a verificação mostrou que:
--     * `anon` passou a receber 401/42501 ................ OK (revoke funcionou)
--     * trigger anti-IDOR bloqueando equipamento alheio .. OK
--     * MAS o usuário autenticado continuava enxergando as
--       44 linhas de TODOS os donos ...................... FALHA
--
--   Políticas de RLS são combinadas com OR. Se o projeto já tinha políticas
--   permissivas (tipicamente o template do Supabase: "Enable read access for
--   all users" → `to public using (true)`), as políticas de dono criadas em
--   0001 não restringem nada.
--
--   Este arquivo:
--     1. reafirma `enable row level security` (caso a etapa de 0001 não tenha
--        sido efetivada no banco);
--     2. remove TODAS as políticas existentes nas 3 tabelas, seja qual for o
--        nome herdado;
--     3. recria apenas as políticas de dono.
--
--   Idempotente e re-executável. Não altera dados.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Garantir RLS habilitada
-- -----------------------------------------------------------------------------
alter table public.equipments            enable row level security;
alter table public.service_orders        enable row level security;
alter table public.service_order_history enable row level security;

-- -----------------------------------------------------------------------------
-- 2. Remover políticas legadas (nome desconhecido → varredura dinâmica)
-- -----------------------------------------------------------------------------
do $$
declare
    policy_row record;
    removed    int := 0;
begin
    for policy_row in
        select tablename, policyname
          from pg_policies
         where schemaname = 'public'
           and tablename in ('equipments', 'service_orders', 'service_order_history')
    loop
        execute format('drop policy %I on public.%I', policy_row.policyname, policy_row.tablename);
        raise notice 'removida: %.%', policy_row.tablename, policy_row.policyname;
        removed := removed + 1;
    end loop;

    raise notice 'total de politicas removidas: %', removed;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. Recriar as políticas de dono
-- -----------------------------------------------------------------------------
create policy "equipments_own_select" on public.equipments
    for select to authenticated using (user_id = auth.uid());

create policy "equipments_own_insert" on public.equipments
    for insert to authenticated with check (user_id = auth.uid());

create policy "equipments_own_update" on public.equipments
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "equipments_own_delete" on public.equipments
    for delete to authenticated using (user_id = auth.uid());

create policy "service_orders_own_select" on public.service_orders
    for select to authenticated using (user_id = auth.uid());

create policy "service_orders_own_insert" on public.service_orders
    for insert to authenticated with check (user_id = auth.uid());

create policy "service_orders_own_update" on public.service_orders
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "service_orders_own_delete" on public.service_orders
    for delete to authenticated using (user_id = auth.uid());

-- Histórico append-only: sem política de UPDATE/DELETE, a RLS nega as duas.
create policy "history_own_select" on public.service_order_history
    for select to authenticated using (user_id = auth.uid());

create policy "history_own_insert" on public.service_order_history
    for insert to authenticated with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 4. Estado final esperado
-- -----------------------------------------------------------------------------
--   select c.relname, c.relrowsecurity,
--          (select count(*) from pg_policies p
--            where p.schemaname = 'public' and p.tablename = c.relname) as policies
--     from pg_class c
--    where c.relname in ('equipments', 'service_orders', 'service_order_history');
--
-- equipments             | t | 4
-- service_orders         | t | 4
-- service_order_history  | t | 2
-- =============================================================================

-- Rollback: reabilitar acesso amplo (reabre o vazamento — só em emergência)
-- drop policy if exists "equipments_own_select" on public.equipments;
-- ... (demais políticas)
-- create policy "legacy_allow_all" on public.equipments for all to public using (true);

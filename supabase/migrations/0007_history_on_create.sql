-- =============================================================================
-- 0007_history_on_create.sql — Evento "created" no histórico da ordem (REV3-05)
-- =============================================================================
-- Problema:
--   POST /api/service-orders insere a ordem em service_orders, mas nada grava
--   em service_order_history. O histórico de toda ordem começa já no primeiro
--   status_changed — a linha em que ela nasceu nunca aparece na auditoria.
--   A rota de listagem até mostra a ordem aberta, mas o "por quê" e o "quando"
--   da criação nunca existem em um sistema cuja proposta é auditar.
--
-- Solução:
--   Trigger AFTER INSERT em service_orders que grava o evento 'created' na
--   mesma transação do INSERT. Feito no banco, e não na rota, por três razões:
--     (a) vale para qualquer caminho de inserção, inclusive os que ainda não
--         existem (RPC, importação, script de migração de dados);
--     (b) falha de histórico desfaz a inserção — não há como sobrar ordem sem
--         registro de criação;
--     (c) a rota não muda: continua um INSERT único.
--
-- Segurança:
--   SECURITY DEFINER + `set search_path = ''` (padrão do projeto) para que o
--   INSERT no histórico rode com o dono da função e não dependa da RLS do
--   chamador — a `history_own_insert` exige `user_id = auth.uid()` e um cron ou
--   service_role não têm auth.uid(). `user_id` é copiado da própria ordem,
--   nunca do chamador, e a ordem só existe se passou pela RLS ou for service_role.
--
-- Idempotência:
--   A função checa se já existe um evento 'created' para a ordem antes de
--   inserir. Se uma rota já inseriu o evento (é o caso do backfill manual
--   descrito no fim do arquivo), o trigger não duplica.
-- =============================================================================

create or replace function public.log_service_order_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not exists (
        select 1
          from public.service_order_history
         where service_order_id = new.id
           and event_type = 'created'
    ) then
        insert into public.service_order_history
            (service_order_id, user_id, event_type, previous_status, new_status, description)
        values
            (new.id, new.user_id, 'created', null, new.status,
             format('Ordem criada com status %s.', new.status));
    end if;

    return new;
end;
$$;

drop trigger if exists service_orders_log_created on public.service_orders;

create trigger service_orders_log_created
    after insert on public.service_orders
    for each row
    execute function public.log_service_order_created();

-- A função é chamada pelo trigger, não pelo cliente: nenhum papel precisa de
-- EXECUTE direto. `authenticated` manteria um caminho paralelo para forjar
-- eventos 'created' com user_id arbitrário.
revoke all on function public.log_service_order_created() from public;
revoke all on function public.log_service_order_created() from anon;
revoke all on function public.log_service_order_created() from authenticated;

-- =============================================================================
-- Backfill das ordens existentes
-- =============================================================================
-- Ordens criadas antes desta migration não têm evento 'created'. O insert abaixo
-- cria um para cada uma, com a data de criação da própria ordem (verdade
-- histórica), marcado na descrição para não se confundir com o registro nativo
-- de uma ordem criada depois da 0007.
insert into public.service_order_history
    (service_order_id, user_id, event_type, previous_status, new_status, description, created_at)
select so.id,
       so.user_id,
       'created',
       null,
       so.status,
       format('Ordem criada com status %s (registro retroativo da migration 0007).', so.status),
       so.created_at
  from public.service_orders so
 where not exists (
    select 1
      from public.service_order_history h
     where h.service_order_id = so.id
       and h.event_type = 'created'
 );

-- =============================================================================
-- Verificação pós-aplicação
--
--   -- 1. Trigger instalado
--   select tgname, tgenabled from pg_trigger
--    where tgrelid = 'public.service_orders'::regclass
--      and tgname = 'service_orders_log_created';
--
--   -- 2. Toda ordem tem exatamente um evento 'created'
--   select count(*) filter (where h.cnt = 1) as com_um,
--          count(*) filter (where h.cnt > 1) as com_duplicata,
--          count(*) filter (where h.cnt = 0) as sem_registro
--     from (
--       select so.id,
--              (select count(*) from public.service_order_history x
--                where x.service_order_id = so.id and x.event_type = 'created') as cnt
--         from public.service_orders so
--     ) h;
--   -- esperado: com_duplicata = 0 e sem_registro = 0
--
--   -- 3. Teste funcional: crie uma ordem pelo app e confira
--   select event_type, new_status, created_at
--     from public.service_order_history
--    where service_order_id = '<id-da-ordem-nova>'
--    order by created_at;
--   -- esperado: uma linha 'created' com created_at igual à ordem
--
--   -- 4. EXECUTE fechado para os papéis de cliente
--   select proacl from pg_proc where proname = 'log_service_order_created';
-- =============================================================================

-- Rollback
-- drop trigger if exists service_orders_log_created on public.service_orders;
-- drop function if exists public.log_service_order_created();
-- delete from public.service_order_history where event_type = 'created';

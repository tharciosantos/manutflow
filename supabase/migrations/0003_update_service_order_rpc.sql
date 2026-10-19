-- =============================================================================
-- 0003_update_service_order_rpc.sql — Atualização transacional (AUD-04)
-- =============================================================================
-- Problema:
--   A rota PATCH /api/service-orders/[id] inseria o histórico e só depois fazia
--   o UPDATE, em duas chamadas independentes. Se o UPDATE falhasse, sobrava no
--   histórico um registro de mudança que nunca aconteceu — auditoria incorreta
--   em um sistema em que a auditoria é o produto.
--
-- Solução:
--   Esta função faz leitura com lock, UPDATE e INSERT do histórico na mesma
--   transação. Qualquer erro desfaz tudo. O texto do histórico é montado aqui,
--   a partir do estado realmente lido (sem depender de leitura prévia da API).
--
-- Segurança:
--   SECURITY INVOKER — a RLS continua valendo: um usuário só alcança as próprias
--   ordens. `auth.uid()` é conferido no SELECT e no UPDATE. EXECUTE fica restrito
--   ao papel `authenticated`.
--
-- Retorno:
--   jsonb com a linha atualizada, ou null quando a ordem não existe ou não
--   pertence ao usuário (a rota traduz null em 404).
-- =============================================================================

create or replace function public.update_service_order(
    p_order_id     uuid,
    p_status       text    default null,
    p_due_date     date    default null,
    p_set_due_date boolean default false
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_old public.service_orders;
    v_new public.service_orders;
begin
    -- Bloqueia a linha para que dois PATCH concorrentes não gerem histórico cruzado.
    select *
      into v_old
      from public.service_orders
     where id = p_order_id
       and user_id = auth.uid()
       for update;

    if not found then
        return null;
    end if;

    update public.service_orders
       set status   = coalesce(p_status, v_old.status),
           due_date = case when p_set_due_date then p_due_date else v_old.due_date end
     where id = p_order_id
       and user_id = auth.uid()
    returning * into v_new;

    -- Histórico de status: só quando houve mudança real.
    if p_status is not null and v_old.status is distinct from v_new.status then
        insert into public.service_order_history
            (service_order_id, user_id, event_type, previous_status, new_status, description)
        values
            (v_new.id, v_new.user_id, 'status_changed', v_old.status, v_new.status,
             format('Status alterado de %s para %s.', v_old.status, v_new.status));
    end if;

    -- Histórico de prazo: só quando o campo veio no PATCH e o valor mudou.
    if p_set_due_date and v_old.due_date is distinct from v_new.due_date then
        insert into public.service_order_history
            (service_order_id, user_id, event_type, previous_status, new_status, description)
        values
            (v_new.id, v_new.user_id, 'due_date_changed', null, null,
             format('Prazo alterado de %s para %s.',
                    coalesce(to_char(v_old.due_date, 'DD/MM/YYYY'), 'sem prazo'),
                    coalesce(to_char(v_new.due_date, 'DD/MM/YYYY'), 'sem prazo')));
    end if;

    return to_jsonb(v_new);
end;
$$;

-- EXECUTE não é herdado de PUBLIC depois do revoke: liberar só para authenticated.
revoke all on function public.update_service_order(uuid, text, date, boolean) from public;
revoke all on function public.update_service_order(uuid, text, date, boolean) from anon;
grant execute on function public.update_service_order(uuid, text, date, boolean) to authenticated;

-- =============================================================================
-- Verificação pós-aplicação
--
--   -- 1. A função existe e está restrita a authenticated
--   select proname, proacl from pg_proc where proname = 'update_service_order';
--
--   -- 2. Teste funcional (autenticado, com uma ordem própria):
--   select public.update_service_order('<id-da-ordem>', 'in_progress');
--   -- deve devolver o jsonb da ordem e inserir 1 linha em service_order_history
--
--   -- 3. Ordem de outro usuário (ou id inexistente) deve devolver null
--   select public.update_service_order('00000000-0000-4000-8000-000000000000', 'closed');
-- =============================================================================

-- Rollback
-- drop function if exists public.update_service_order(uuid, text, date, boolean);

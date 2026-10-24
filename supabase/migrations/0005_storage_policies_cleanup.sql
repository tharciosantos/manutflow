-- =============================================================================
-- 0005_storage_policies_cleanup.sql — Remove policies legadas do Storage
-- =============================================================================
-- Por que este arquivo existe:
--   A 0004 deixou o bucket privado (public = false) e criou as policies de dono,
--   mas a verificação mostrou que o papel `anon` continuava listando os objetos e
--   que um usuário autenticado continuava vendo a pasta de outro usuário.
--
--   Causa: policies herdadas do template do Supabase, cuja expressão é
--   `bucket_id = 'equipment-photos'` (e não literalmente `true`), então não foram
--   alcançadas pelo filtro da 0004. Políticas de RLS se combinam com OR: enquanto
--   uma delas existir, o acesso continua liberado.
--
--   Este arquivo remove TODAS as policies de `storage.objects` que não sejam as
--   quatro criadas na 0004.
--
-- ATENÇÃO: o projeto tem apenas o bucket `equipment-photos`. Se algum dia forem
-- criados outros buckets com policies próprias, este script precisa ser
-- reescopado por bucket antes de rodar de novo.
-- =============================================================================

do $$
declare
    policy_row record;
    removed    int := 0;
begin
    for policy_row in
        select policyname
          from pg_policies
         where schemaname = 'storage'
           and tablename = 'objects'
           and policyname not in (
               'photos_own_select',
               'photos_own_insert',
               'photos_own_update',
               'photos_own_delete'
           )
    loop
        execute format('drop policy %I on storage.objects', policy_row.policyname);
        raise notice 'removida policy legada: %', policy_row.policyname;
        removed := removed + 1;
    end loop;

    raise notice 'total de policies removidas: %', removed;
end;
$$;

-- =============================================================================
-- Verificação pós-aplicação
--
--   -- 1. devem restar exatamente as quatro policies de dono, todas para
--   --    {authenticated} e nenhuma para {public}/{anon}
--   select policyname, cmd, roles, qual
--     from pg_policies
--    where schemaname = 'storage' and tablename = 'objects'
--    order by policyname;
--
--   -- 2. bucket continua privado
--   select id, public from storage.buckets where id = 'equipment-photos';
-- =============================================================================

-- Rollback: recriar uma policy permissiva (reabre o vazamento)
-- create policy "legacy_allow_all" on storage.objects
--     for all to public using (bucket_id = 'equipment-photos');

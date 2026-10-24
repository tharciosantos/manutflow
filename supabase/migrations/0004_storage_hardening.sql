-- =============================================================================
-- 0004_storage_hardening.sql — Bucket privado com proxy autenticado (AUD-15)
-- =============================================================================
-- Problema:
--   O bucket `equipment-photos` era público e a listagem de objetos respondia ao
--   papel `anon`. Verificado em 2026-10-23: sem nenhuma credencial era possível
--   listar a pasta de um usuário real e baixar o arquivo (200, image/jpeg).
--
-- Efeito deste arquivo:
--   1. bucket deixa de ser público — `/storage/v1/object/public/...` para de servir;
--   2. limites de tamanho e de MIME passam a ser do bucket, não só da aplicação;
--   3. o dono acessa apenas a própria pasta (the `foldername` é o `user_id`);
--   4. remove políticas permissivas legadas que anulariam as novas (lição da 0002:
--      políticas de RLS se combinam com OR).
--
-- Depois disso a única porta para a imagem é `GET /api/photos/<user>/<arquivo>`,
-- que valida sessão e titularidade antes de ler o objeto.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Bucket privado + limites no próprio bucket
-- -----------------------------------------------------------------------------
update storage.buckets
   set public = false,
       file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'equipment-photos';

-- -----------------------------------------------------------------------------
-- 2. Políticas de dono para o bucket
-- -----------------------------------------------------------------------------
drop policy if exists "photos_own_select" on storage.objects;
drop policy if exists "photos_own_insert" on storage.objects;
drop policy if exists "photos_own_update" on storage.objects;
drop policy if exists "photos_own_delete" on storage.objects;

create policy "photos_own_select" on storage.objects
    for select to authenticated
    using (
        bucket_id = 'equipment-photos'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "photos_own_insert" on storage.objects
    for insert to authenticated
    with check (
        bucket_id = 'equipment-photos'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "photos_own_update" on storage.objects
    for update to authenticated
    using (
        bucket_id = 'equipment-photos'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    )
    with check (
        bucket_id = 'equipment-photos'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "photos_own_delete" on storage.objects
    for delete to authenticated
    using (
        bucket_id = 'equipment-photos'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- -----------------------------------------------------------------------------
-- 3. Remover políticas permissivas legadas do Storage
--    Só derruba políticas cuja expressão é literalmente `true` — o caso clássico
--    do template do Supabase ("Public read access"). Políticas com escopo real
--    são preservadas.
-- -----------------------------------------------------------------------------
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
           and (
               coalesce(qual, '') in ('true', '(true)')
               or coalesce(with_check, '') in ('true', '(true)')
           )
    loop
        execute format('drop policy %I on storage.objects', policy_row.policyname);
        raise notice 'removida politica permissiva do storage: %', policy_row.policyname;
        removed := removed + 1;
    end loop;

    raise notice 'total de politicas permissivas removidas: %', removed;
end;
$$;

-- =============================================================================
-- Verificação pós-aplicação
--
--   -- 1. bucket privado e com limites
--   select id, public, file_size_limit, allowed_mime_types
--     from storage.buckets where id = 'equipment-photos';
--
--   -- 2. políticas ativas no bucket
--   select policyname, cmd, roles, qual
--     from pg_policies
--    where schemaname = 'storage' and tablename = 'objects'
--    order by policyname;
--
--   -- 3. nenhum registro deve apontar para o formato antigo
--   select count(*) from public.equipments
--    where photo_url like '%/storage/v1/object/public/%';
-- =============================================================================

-- Rollback (reabre o vazamento — usar só em emergência)
-- update storage.buckets set public = true where id = 'equipment-photos';
-- drop policy if exists "photos_own_select" on storage.objects;
-- drop policy if exists "photos_own_insert" on storage.objects;
-- drop policy if exists "photos_own_update" on storage.objects;
-- drop policy if exists "photos_own_delete" on storage.objects;

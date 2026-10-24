# Migrations — ManutFlow

Este diretório passou a versionar o schema do banco (AUD-02). Antes dele, tabelas,
RLS, triggers e FKs existiam apenas no painel do Supabase — foi por isso que o
vazamento cross-tenant (AUD-01) não foi notado.

## Arquivos

| Arquivo | O que é | Quando rodar |
|---|---|---|
| `migrations/0000_baseline.sql` | Baseline idempotente do schema já existente (tabelas, CHECKs, FKs, triggers, índices, RLS de `profiles`, bucket). Só **adiciona** o que falta. | Ambientes novos (staging/CI/dev). Em produção é seguro, mas não obrigatório. |
| `migrations/0001_rls_hardening.sql` | Habilita RLS nas 3 tabelas, cria as políticas de dono, remove os GRANTs do `anon` e bloqueia OS apontando para equipamento de outro usuário. | **Aplicado em 2026-10-19.** |
| `migrations/0002_drop_legacy_policies.sql` | Remove políticas legadas permissivas (`to public using (true)`) que se somavam às de dono, e recria apenas as de dono. | **Aplicado em 2026-10-19.** |
| `migrations/0003_update_service_order_rpc.sql` | RPC `update_service_order`: atualiza status/prazo e grava o histórico na mesma transação. | **Aplicado em 2026-10-19** (validado manualmente). |
| `migrations/0004_storage_hardening.sql` | Torna o bucket `equipment-photos` **privado**, define limites de tamanho/MIME e cria as políticas de dono no Storage (removendo permissivas legadas). | **Produção — pendente.** |

## Como aplicar

### Opção A — SQL Editor (mais rápido, sem CLI)

1. Abra o projeto no [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Cole o conteúdo inteiro de `migrations/0001_rls_hardening.sql` e execute.
3. Para ambientes novos, rode `0000_baseline.sql` primeiro.

### Opção B — CLI (recomendado a partir de agora)

```bash
supabase init            # apenas se ainda não existir supabase/config.toml
supabase link --project-ref <PROJECT_REF>
supabase db push         # aplica 0000 (idempotente) e 0001
supabase db pull         # gera o baseline canônico para substituir 0000
```

## Verificação obrigatória após aplicar

**No banco** — deve retornar 3 linhas com `rowsecurity = true`:

```sql
select relname, relrowsecurity
  from pg_class
 where relname in ('equipments', 'service_orders', 'service_order_history');
```

**Pelo cliente** — o Anexo B da `AUDITORIA.md` tem os `curl` prontos. O critério de
aceite é:

| Teste | Esperado antes | Esperado depois |
|---|---|---|
| `anon` → `GET /rest/v1/equipments` | 44 linhas | `401/403` (sem GRANT) |
| JWT do dono → `GET /rest/v1/equipments` | 44 linhas | só as linhas dele |
| JWT → `POST /rest/v1/service_orders` com `equipment_id` alheio | 201 | `401` (42501) |
| App logado (login → dashboard → equipamentos → ordens) | ok | ok — nada muda na UI |

**Para a `0003`** — a função deve existir, estar restrita a `authenticated` e ser
transacional:

```sql
select proname, proacl from pg_proc where proname = 'update_service_order';
```

| Teste (autenticado, ordem própria) | Esperado |
|---|---|
| `select update_service_order('<id>', 'in_progress')` | retorna a linha e cria **1** registro em `service_order_history` |
| `select update_service_order('<id>', 'in_progress')` de novo | retorna a linha e **não** cria histórico (sem mudança) |
| `select update_service_order('<id-alheio-ou-inexistente>', 'closed')` | `null` |
| PATCH pela UI em `/ordens/[id]` | status/prazo mudam e o histórico aparece na tela |

**Para a `0004`** — o bucket precisa ficar privado, com limites e políticas de dono:

```sql
select id, public, file_size_limit, allowed_mime_types
  from storage.buckets where id = 'equipment-photos';
-- esperado: public = false | 5242880 | {image/jpeg,image/png,image/webp}

select policyname, cmd, roles from pg_policies
 where schemaname = 'storage' and tablename = 'objects' order by policyname;
-- esperado: photos_own_select/insert/update/delete, todas para {authenticated}
```

| Teste | Esperado |
|---|---|
| `POST /storage/v1/object/list/equipment-photos` com a chave `anon` | vazio ou erro — sem pastas |
| A mesma chamada com JWT de outro usuário | vazio — não enxerga pasta alheia |
| Abrir uma URL `storage/v1/object/public/equipment-photos/...` | `400`/`404` — bucket privado |
| Upload de foto pela UI e abrir a imagem | `GET /api/photos/...` responde `200` com `Cache-Control: private` |

## Rollback

O bloco de rollback está comentado no fim de `0001_rls_hardening.sql`. Use apenas
em emergência: reabre o vazamento.

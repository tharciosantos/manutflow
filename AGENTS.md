# AGENTS.md â€” ManutFlow

> Manual Operacional para Agentes de IA Â· v3.1 Â· atualizado em Out/2026

Este documento Ã© a **fonte Ãºnica de verdade** para agentes que trabalham no repositÃ³rio **ManutFlow**.

---

## Ãndice

1. [VisÃ£o Geral](#1-visÃ£o-geral)
2. [Stack TecnolÃ³gica](#2-stack-tecnolÃ³gica)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Comandos e Scripts](#4-comandos-e-scripts)
5. [VariÃ¡veis de Ambiente](#5-variÃ¡veis-de-ambiente)
6. [AutenticaÃ§Ã£o e SessÃ£o (Supabase SSR)](#6-autenticaÃ§Ã£o-e-sessÃ£o-supabase-ssr)
7. [Banco de Dados, Migrations e SeguranÃ§a](#7-banco-de-dados-migrations-e-seguranÃ§a)
8. [Regras de NegÃ³cio e DomÃ­nio](#8-regras-de-negÃ³cio-e-domÃ­nio)
9. [APIs e Rotas](#9-apis-e-rotas)
10. [Testes e ValidaÃ§Ã£o](#10-testes-e-validaÃ§Ã£o)
11. [PadrÃµes de CÃ³digo e UI](#11-padrÃµes-de-cÃ³digo-e-ui)
12. [Git Flow e Conventional Commits](#12-git-flow-e-conventional-commits)
13. [Pull Request](#13-pull-request)
14. [Checklists](#14-checklists)
15. [Exemplos Completos](#15-exemplos-completos)

---

## 1. VisÃ£o Geral

O **ManutFlow** Ã© um sistema CMMS (Computerized Maintenance Management System) para gestÃ£o de manutenÃ§Ã£o industrial, controle de ativos/equipamentos, ordens de serviÃ§o (preventivas e corretivas), acompanhamento de prazos com SLAs dinÃ¢micos e auditoria de eventos. Conta com **Landing Page pÃºblica com simulador interativo**, **Dashboard operacional compacto sem scroll** e painel completo para tÃ©cnicos e gestores.

---

## 2. Stack TecnolÃ³gica

| Camada | Tecnologia | VersÃ£o / Detalhes |
|--------|-----------|-------------------|
| **Framework** | Next.js (App Router) | 16.4.x |
| **Linguagem / UI** | TypeScript (strict: true) / React | 19.2.x |
| **EstilizaÃ§Ã£o** | Tailwind CSS v4 (@tailwindcss/postcss) | 4.x |
| **Tema** | next-themes (classe `dark`, padrÃ£o escuro) | 0.4.x |
| **Banco / Auth / Storage** | Supabase SSR (`@supabase/ssr`, `@supabase/supabase-js`) | PostgreSQL + Bucket `equipment-photos` |
| **Ãcones** | Lucide React | ^1.31.x |
| **GrÃ¡ficos** | Recharts | ^3.9.x (BarChart semestral) |
| **Testes** | Vitest + Testing Library | 19 arquivos / 207 testes / jsdom |
| **Linter** | ESLint (flat config) + eslint-config-next | 9.x / 16.4.x |

---

## 3. Estrutura do Projeto

```
manutflow/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ __tests__/             # Setup global do Vitest
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ api/               # 18 route handlers REST (dynamic: force-dynamic)
â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard-summary/ # KPIs, SLAs, grÃ¡fico e ordens recentes
â”‚   â”‚   â”‚   â”œâ”€â”€ demo-login/    # Cria a sessÃ£o da demo (pÃºblico, 5 req/min por IP)
â”‚   â”‚   â”‚   â”œâ”€â”€ equipments/    # Listagem/criaÃ§Ã£o + [id] (GET, PATCH, DELETE)
â”‚   â”‚   â”‚   â”œâ”€â”€ health/        # Health check
â”‚   â”‚   â”‚   â”œâ”€â”€ photos/        # Proxy autenticado das fotos (bucket privado)
â”‚   â”‚   â”‚   â”œâ”€â”€ profile/       # Perfil do usuÃ¡rio logado (GET, PATCH)
â”‚   â”‚   â”‚   â”œâ”€â”€ service-orders/# Listagem/criaÃ§Ã£o + [id] (GET, PATCH, DELETE)
â”‚   â”‚   â”‚   â””â”€â”€ upload/        # Upload e remoÃ§Ã£o de fotos (POST, DELETE)
â”‚   â”‚   â”œâ”€â”€ auth/callback/     # Troca de cÃ³digo por sessÃ£o, com proteÃ§Ã£o contra open redirect
â”‚   â”‚   â”œâ”€â”€ equipamentos/      # Listagem de ativos e [id] para ficha tÃ©cnica
â”‚   â”‚   â”œâ”€â”€ ordens/            # Listagem de ordens com Toolbar e [id] para detalhes/histÃ³rico
â”‚   â”‚   â”œâ”€â”€ login/ & register/ # AutenticaÃ§Ã£o com credenciais Demo
â”‚   â”‚   â”œâ”€â”€ perfil/            # GestÃ£o de dados cadastrais do usuÃ¡rio
â”‚   â”‚   â”œâ”€â”€ page.tsx           # Landing (deslogado) ou Dashboard (logado) â€” client component
â”‚   â”‚   â”œâ”€â”€ layout.tsx         # RootLayout + ThemeProvider
â”‚   â”‚   â””â”€â”€ globals.css        # Tailwind v4, variÃ¡veis de tema e animaÃ§Ãµes
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ landing/           # DemoMaintenanceFlow, LandingHeader, FeatureCard
â”‚   â”‚   â”œâ”€â”€ layout/            # AppShell, AppHeader (desktop/mobile)
â”‚   â”‚   â”œâ”€â”€ ui/                # Modal (<dialog>), StatusCard, Pagination, Toolbar, Breadcrumbs,
â”‚   â”‚   â”‚                      # ThemeSwitcher, EquipmentPhoto
â”‚   â”‚   â””â”€â”€ theme-provider.tsx
â”‚   â”œâ”€â”€ features/              # MÃ³dulos de domÃ­nio
â”‚   â”‚   â”œâ”€â”€ dashboard/         # DashboardOverview, KPIs, grÃ¡fico Recharts, SLA Badges
â”‚   â”‚   â”œâ”€â”€ equipments/        # EquipmentList/Form/Search, StatusConfig, PageContent
â”‚   â”‚   â””â”€â”€ service-orders/    # ServiceOrderList/Form, deadlines, badges, filtros, PageContent
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”œâ”€â”€ auth.ts            # getUser(): sessÃ£o + client Supabase ou 401
â”‚   â”‚   â”œâ”€â”€ validation.ts      # isUuid() e sanitizaÃ§Ã£o de termo de busca
â”‚   â”‚   â”œâ”€â”€ rate-limit.ts      # Rate limit em memÃ³ria (por processo)
â”‚   â”‚   â”œâ”€â”€ logger.ts          # Logger JSON (info | warn | error)
â”‚   â”‚   â”œâ”€â”€ equipment-photo-storage.ts # Ownership e remoÃ§Ã£o no bucket
â”‚   â”‚   â”œâ”€â”€ fetch-with-retry.ts# Retry com backoff para chamadas do client
â”‚   â”‚   â”œâ”€â”€ safe-redirect.ts   # ProteÃ§Ã£o contra open redirect
â”‚   â”‚   â””â”€â”€ supabase/          # client.ts (browser), server.ts (RSC/route), middleware.ts
â”‚   â”œâ”€â”€ types/                 # equipment.ts, equipment-details.ts, service-order.ts, profile.ts
â”‚   â””â”€â”€ proxy.ts               # Proxy do Next.js 16: renova sessÃ£o e protege rotas
â”œâ”€â”€ supabase/
â”‚   â”œâ”€â”€ migrations/            # 0000 a 0005 (baseline, RLS, RPC e Storage)
â”‚   â””â”€â”€ README.md              # Runbook: aplicar, verificar, rollback
â””â”€â”€ public/
    â””â”€â”€ previews/              # 2 capturas usadas no README
```

> `src/proxy.ts` fica na raiz de `src/`, **nÃ£o** em `src/app/`. Ã‰ a convenÃ§Ã£o de proxy do Next.js 16 (substitui `middleware.ts`).

---

## 4. Comandos e Scripts

```bash
# Desenvolvimento local
npm run dev              # Next.js em http://localhost:3000

# ValidaÃ§Ã£o e Testes
npm test                 # Executa os 207 testes (Vitest, single run)
npm run test:watch       # Modo watch interativo
npx tsc --noEmit         # VerificaÃ§Ã£o estrita de tipagem
npm run lint             # ESLint (flat config)

# Build de ProduÃ§Ã£o
npm run build            # next build --webpack (output standalone)
npm start                # Servidor de produÃ§Ã£o
```

> O build usa `--webpack` explicitamente. O CI roda lint, testes e build em Node 22.

---

## 5. VariÃ¡veis de Ambiente

O Next.js lÃª tanto `.env` quanto `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://sua-instancia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key # apenas server-side
DEMO_EMAIL=demo@manutflow.com                  # conta do botÃ£o de demonstraÃ§Ã£o
DEMO_PASSWORD=sua-senha-demo                   # apenas server-side
```

- `NEXT_PUBLIC_*` vai para o bundle do browser â€” nunca coloque segredo ali.
- `SUPABASE_SERVICE_ROLE_KEY` **ignora RLS**. Usada somente em `src/app/api/upload/route.ts` e em `src/lib/equipment-photo-storage.ts`. NÃ£o pode chegar ao client, a logs ou ao repositÃ³rio.
- `DEMO_PASSWORD` alimenta `POST /api/demo-login`. **Nunca** referencie essas variÃ¡veis em componente client nem caia em senha padrÃ£o no cÃ³digo: sem a env a rota responde `503`.

---

## 6. AutenticaÃ§Ã£o e SessÃ£o (Supabase SSR)

- **Clientes separados**:
  - `src/lib/supabase/client.ts` â†’ `createBrowserClient` (browser).
  - `src/lib/supabase/server.ts` â†’ `createServerClient` com cookies assÃ­ncronos (`cookies()`).
  - `src/lib/supabase/middleware.ts` â†’ `updateSession()`, consumido por `src/proxy.ts`.
- **ExtraÃ§Ã£o de usuÃ¡rio**: toda API route usa `getUser()` de `@/lib/auth`, que valida o JWT no servidor e devolve `401` quando nÃ£o hÃ¡ sessÃ£o.
- **ProteÃ§Ã£o de rotas** (`src/proxy.ts`): `/` Ã© pÃºblica; `/login`, `/register`, `/auth/callback` e `/api/demo-login` sÃ£o pÃºblicas; o resto exige sessÃ£o e redireciona para `/login?redirect=...`.
- **Conta de demonstraÃ§Ã£o**: `demo@manutflow.com` (Gestor de ManutenÃ§Ã£o). A senha vive em `DEMO_PASSWORD` e Ã© usada no servidor por `POST /api/demo-login`, que cria a sessÃ£o e grava os cookies. Nenhuma credencial de demo pode existir em componente client â€” o bundle Ã© pÃºblico.
- **Perfis**: criados automaticamente por trigger (`handle_new_user`) no signup.

---

## 7. Banco de Dados, Migrations e SeguranÃ§a

### 7.1 Migrations

O schema Ã© versionado em `supabase/migrations/`. **Toda mudanÃ§a de schema deve entrar como uma nova migration** â€” nunca pelo painel do Supabase sem registrar o SQL.

| Arquivo | ConteÃºdo |
|---|---|
| `0000_baseline.sql` | Baseline idempotente (tabelas, CHECKs, FKs, triggers, Ã­ndices, RLS de `profiles`, bucket) |
| `0001_rls_hardening.sql` | RLS + polÃ­ticas de dono + `revoke` do `anon` + trigger anti-IDOR |
| `0002_drop_legacy_policies.sql` | Remove polÃ­ticas legadas permissivas e recria as de dono |
| `0003_update_service_order_rpc.sql` | RPC `update_service_order`: UPDATE + histÃ³rico na mesma transaÃ§Ã£o |
| `0004_storage_hardening.sql` | Bucket privado, limites de tamanho/MIME e polÃ­ticas de dono no Storage |
| `0005_storage_policies_cleanup.sql` | Remove policies legadas de `storage.objects` por varredura (a `0004` nÃ£o bastou) |

Runbook (aplicar, verificar, rollback): [`supabase/README.md`](supabase/README.md).

### 7.2 Tabelas

1. **`profiles`**: `id` (uuid PK = `auth.uid`), `email`, `full_name`, `avatar_url` (nÃ£o usado pela UI), `phone`, `role` (usado como cargo), `created_at`, `updated_at`.
2. **`equipments`**: `id` (uuid PK), `name`, `patrimony_code` (Ãºnico por `user_id`), `location`, `status` (`active` | `inactive` | `maintenance`), `photo_url`, `user_id` (FK `auth.users`), `created_at`, `updated_at`.
3. **`service_orders`**: `id` (uuid PK), `title`, `description`, `status` (`open` | `in_progress` | `closed`), `priority` (`low` | `medium` | `high` | `critical`), `due_date` (`date`, nullable), `equipment_id` (FK `equipments`), `user_id` (FK `auth.users`), `created_at`. **NÃ£o possui `updated_at`.**
4. **`service_order_history`**: `id` (uuid PK), `service_order_id` (FK `service_orders`), `user_id`, `event_type`, `previous_status`, `new_status`, `description`, `created_at`. Append-only.
5. **Storage**: bucket `equipment-photos` **privado** desde a migration `0004`. Arquivos em `<user_id>/<timestamp-random>.<ext>`. O banco guarda `/api/photos/<path>`, e a imagem sÃ³ Ã© servida por `GET /api/photos/[...path]`, que exige sessÃ£o e confere a titularidade. NÃ£o existe mais URL pÃºblica do Storage.

### 7.3 Constraints e triggers

- CHECK nos trÃªs enums (`equipments.status`, `service_orders.status`, `service_orders.priority`) â€” erro `23514`.
- UNIQUE `(user_id, patrimony_code)` em `equipments` â€” erro `23505`.
- FK `service_orders.equipment_id` â†’ `equipments` com `ON DELETE RESTRICT`.
- FK `service_order_history.service_order_id` â†’ `service_orders` com `ON DELETE CASCADE`.
- Trigger `set_updated_at` em `equipments` e `profiles`.
- Trigger `handle_new_user` em `auth.users` â†’ cria o profile.
- Trigger `enforce_order_equipment_owner` em `service_orders` â†’ impede ordem apontar para equipamento de outro usuÃ¡rio (erro `42501`).

### 7.4 RLS

- `equipments`, `service_orders` e `service_order_history` tÃªm RLS habilitada com polÃ­ticas de dono (`user_id = auth.uid()`).
- `service_order_history` nÃ£o tem polÃ­tica de `UPDATE`/`DELETE`: Ã© append-only por consequÃªncia.
- O papel `anon` nÃ£o tem GRANT nas tabelas de dados; qualquer leitura sem JWT retorna `42501`.
- **PolÃ­ticas de RLS se combinam com `OR`.** Uma polÃ­tica permissiva antiga anula qualquer polÃ­tica restritiva nova. Ao auditar isolamento, liste `pg_policies` antes de concluir que estÃ¡ protegido.
- **Remover policy legada exige varredura, nÃ£o filtro por expressÃ£o.** Policies do template do Supabase usam `bucket_id = '<bucket>'`, nÃ£o `true`; filtrar por `qual = 'true'` deixa passar e o acesso continua aberto (aconteceu na `0004`, corrigido na `0005`). Remova por escopo â€” todas as policies da tabela menos as de dono â€” e recrie sÃ³ as suas.

### 7.5 Regras para agentes

- Toda query de dados **deve** filtrar `.eq('user_id', user.id)`. A RLS Ã© a segunda camada, nÃ£o a Ãºnica.
- Nunca confie em `equipment_id`, `user_id` ou id vindo do body â€” valide formato e titularidade.
- NÃ£o crie policy nova sem remover a equivalente permissiva.
- MudanÃ§a de schema = migration nova + atualizaÃ§Ã£o do `supabase/README.md` se o runbook mudar.
- **Segredo nunca em componente client.** O bundle Ã© pÃºblico: qualquer string em `src/app/**` com `"use client"` pode ser lida no DevTools. Credenciais de demo ficam em env server-side e sÃ£o usadas sÃ³ em route handler.

### 7.6 RPCs

| FunÃ§Ã£o | Contrato |
|---|---|
| `public.update_service_order(p_order_id uuid, p_status text, p_due_date date, p_set_due_date boolean)` | Atualiza status e/ou prazo e grava o histÃ³rico na **mesma transaÃ§Ã£o**, com `for update` na linha. `SECURITY INVOKER` (RLS vale). Retorna `jsonb` com a ordem ou `null` quando nÃ£o existe/nÃ£o pertence ao usuÃ¡rio. `EXECUTE` restrito a `authenticated`. |

---

## 8. Regras de NegÃ³cio e DomÃ­nio

### 8.1 Estados de prazo (`getServiceOrderDeadlineInfo`)

| Estado | CondiÃ§Ã£o | Cor |
|---|---|---|
| `none` | sem `due_date` | neutro |
| `overdue` | `due_date < hoje` e status â‰  `closed` | vermelho |
| `today` | `due_date === hoje` e status â‰  `closed` | Ã¢mbar |
| `upcoming` | `due_date > hoje` (qualquer data futura) | azul |
| `closed` | status `closed` | neutro |

"Hoje" Ã© calculado no fuso `America/Sao_Paulo` (`getDateOnlyInTimeZone`); as datas sÃ£o strings `YYYY-MM-DD` (`isValidDateOnly`).

### 8.2 Filtros de prazo da listagem

`overdue`, `today`, `next_7_days` (amanhÃ£ atÃ© +7) e `without_due_date` â€” todos excluem ordens fechadas, exceto `without_due_date`.

### 8.3 ConvenÃ§Ãµes de resposta

| Rota | Formato |
|---|---|
| `GET /api/equipments` | `{ equipments, total, page, totalPages }` |
| `POST/PATCH /api/equipments` | `{ equipment }` |
| `GET /api/equipments/[id]` | `{ equipment, serviceOrders }` |
| `GET /api/service-orders` | `{ serviceOrders, total, page, totalPages }` |
| `POST /api/service-orders` | `{ serviceOrder }` |
| `GET /api/service-orders/[id]` | `{ serviceOrder: { ...campos, history } }` |
| `PATCH /api/service-orders/[id]` | objeto cru (pendÃªncia: padronizar como `{ serviceOrder }`) |
| `GET/PATCH /api/profile` | `{ profile }` |
| `POST /api/upload` | `{ url, path }` |
| `POST /api/demo-login` | `{ ok: true }` |
| `GET /api/photos/[...path]` | binÃ¡rio, com `Content-Type`, `Content-Length` e `Cache-Control: private` |
| `DELETE` (equipments, service-orders, upload) | `{ message }` |
| Erros | `{ error: "mensagem" }` |

PaginaÃ§Ã£o: `page` â‰¥ 1, `limit` entre 1 e 50 (padrÃ£o 10), `totalPages = ceil(total / limit)`.

---

## 9. APIs e Rotas

| MÃ©todo | Rota | ObservaÃ§Ã£o |
|---|---|---|
| `GET` | `/api/health` | Resposta estÃ¡tica; nÃ£o verifica o banco |
| `GET` | `/api/dashboard-summary` | 16 consultas em `Promise.all`; falha tudo se uma falhar |
| `GET` `POST` | `/api/equipments` | Busca em `name`, `patrimony_code`, `location`; filtro por status |
| `GET` `PATCH` `DELETE` | `/api/equipments/[id]` | ExclusÃ£o bloqueada se houver ordem vinculada |
| `GET` `POST` | `/api/service-orders` | Filtros: status, priority, deadline, sort; busca em `title`/`description` |
| `GET` `PATCH` `DELETE` | `/api/service-orders/[id]` | PATCH delega Ã  RPC `update_service_order` (status/prazo + histÃ³rico transacionais) |
| `GET` `PATCH` | `/api/profile` | Nome, cargo (`role`) e telefone |
| `POST` `DELETE` | `/api/upload` | JPEG/PNG/WebP atÃ© 5 MB; 10 req/min |
| `POST` | `/api/demo-login` | PÃºblico: cria a sessÃ£o da demo (5 req/min por IP; 503 sem `DEMO_PASSWORD`) |
| `GET` | `/api/photos/[...path]` | Ãšnica porta para as imagens: exige sessÃ£o e confere a pasta do dono (404 caso contrÃ¡rio) |
| `GET` | `/auth/callback` | `exchangeCodeForSession` + redirect seguro |

Rate limit: 30 req/min por usuÃ¡rio nas mutaÃ§Ãµes de equipamentos e ordens; 10 req/min no upload. Ã‰ em memÃ³ria, por instÃ¢ncia â€” em serverless nÃ£o Ã© um limite global.

---

## 10. Testes e ValidaÃ§Ã£o

### 10.1 Gate obrigatÃ³rio antes de commit

Nenhum commit Ã© criado sem passar, nesta ordem:

1. **Implementar** na working tree, sem commit.
2. **Automatizado**: `npm run build && npm run lint && npm test && npx tsc --noEmit` â€” todos verdes (exit code 0).
3. **Schema**: se a mudanÃ§a depende de migration, o SQL precisa estar aplicado no
   Supabase pelo responsÃ¡vel. NÃ£o se commita cÃ³digo que chama funÃ§Ã£o inexistente.
4. **Roteiro manual**: o agente entrega um checklist numerado (passo, aÃ§Ã£o,
   resultado esperado) referente exatamente ao que mudou.
5. **ValidaÃ§Ã£o do responsÃ¡vel**: ele executa e responde com o resultado.
6. **AprovaÃ§Ã£o explÃ­cita**: sÃ³ depois do "ok" o agente cria o commit.

O agente nÃ£o commita, nÃ£o faz push e nÃ£o aplica migration por conta prÃ³pria.
Ao encontrar um problema na validaÃ§Ã£o, o agente corrige e o roteiro Ã© repetido
desde o passo 2.

### 10.2 SuÃ­te automatizada

- **19 arquivos / 207 testes**, todos passando, cobrindo:
  - domÃ­nio: prazos, badges de SLA, config de status, redirect seguro, validaÃ§Ã£o de UUID, retry;
  - API routes: auth, perfil, equipamentos, ordens, upload, dashboard e rate limit;
  - componentes: dashboard, toolbar, listas, tema.
- NÃ£o hÃ¡ coverage configurado; nÃ£o hÃ¡ teste de integraÃ§Ã£o contra Postgres (a RLS nÃ£o Ã© coberta por teste automatizado).
- Antes de qualquer commit/PR: `npm run build && npm run lint && npm test && npx tsc --noEmit`.

---

## 11. PadrÃµes de CÃ³digo e UI

- **Dashboard sem scroll**: duas colunas no desktop (`lg:col-span-2` para grÃ¡fico e urgÃªncias; `1/3` para prioridades e atividades recentes).
- **Toolbar simÃ©trico**: grid de 4 colunas (`Status`, `Prioridade`, `Prazo`, `Ordenar`).
- **Tema**: claro e escuro via `next-themes` (`attribute="class"`), padrÃ£o escuro, `enableSystem`.
- **Paleta**: modo escuro em `slate-950` / `slate-900/60` / bordas `slate-800`; modo claro em `slate-50` / branco. Acentos semÃ¢nticos: `teal-500` (aÃ§Ã£o), `amber` (atenÃ§Ã£o), `red` (crÃ­tico), `sky` (programado), `emerald` (concluÃ­do).
- **Modal**: `<dialog>` nativo (`showModal`), fechamento por ESC e clique no backdrop. Modal com `children` nÃ£o exibe rodapÃ© de confirmaÃ§Ã£o.
- **Acessibilidade**: labels em todos os campos, `aria-label` em seletores iconogrÃ¡ficos, `aria-live` nos feedbacks dos formulÃ¡rios.

---

## 12. Git Flow e Conventional Commits

- Branches temÃ¡ticas: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/`, `test/`.
- Commits atÃ´micos no padrÃ£o: `tipo(escopo): descriÃ§Ã£o concisa`.
- Commit apenas depois do gate da seÃ§Ã£o 10.1 (validaÃ§Ã£o manual do responsÃ¡vel).
- Push e abertura de PR sÃ£o feitos pelo responsÃ¡vel, nunca pelo agente.
- Pull Request obrigatÃ³rio com CI verde antes do merge na `main`.
- CI (`.github/workflows/ci.yml`): `npm run lint` â†’ `npm run test` â†’ `npm run build`, em Node 22.

---

## 13. Pull Request

### 13.1 TÃ­tulo

```
tipo(escopo): descriÃ§Ã£o concisa no presente do indicativo (â‰¤ 72 caracteres)
```

Exemplo: `fix(security): torna bucket de fotos privado com proxy autenticado`

### 13.2 Regras de RedaÃ§Ã£o e Densidade TÃ©cnica (Gold Standard)

Para garantir mÃ¡xima clareza para revisores humanos e indexadores de cÃ³digo:
- **Sem emojis nos cabeÃ§alhos ou listas:** Use Markdown puro (`### Features`, `### Fixes`, `### Docs`, `- [x] Feature`). Ã‰ proibido usar emojis como `âœ¨`, `ðŸ›`, `ðŸ“` no corpo ou tÃ­tulo do PR.
- **Resumo de alta densidade (1 a 3 frases):** Descreva o que foi entregue citando nominalmente os mÃ³dulos, componentes, pÃ¡ginas, rotas ou mÃ©tricas impactadas (ex: `/equipamentos`, `/ordens`, `/api/photos/[...path]`, `DashboardOverview`). Evite frases genÃ©ricas.
- **Verbos de aÃ§Ã£o na 3Âª pessoa do singular:** Inicie os itens do Changelog com verbos no presente do indicativo: *Adiciona*, *Atualiza*, *Corrige*, *Remove*, *Sincroniza*, *Concentra*, *Extrai*.
- **Como Testar reprodutÃ­vel:** Comece sempre com o comando de execuÃ§Ã£o (`1. Rode npm run dev.`) e indique as rotas exatas (ex: `/equipamentos`, `/ordens/[id]`, `/perfil`, etc.) ou interaÃ§Ãµes exatas para validar a entrega.
- **Tipo de MudanÃ§a vertical e limpo:** Liste uma opÃ§Ã£o por linha, sem emojis, marcando com `[x]` apenas os tipos aplicÃ¡veis ao PR.
- **ValidaÃ§Ã£o real antes de marcar o Checklist:** O agente DEVE executar cada comando do checklist no terminal e confirmar saÃ­da limpa (exit code 0) antes de marcar `[x]`.

### 13.3 Changelog

Agrupe apenas pelas categorias presentes no PR, em texto limpo:

```markdown
### Fixes

- Torna o bucket equipment-photos privado via migration 0004
- Adiciona rota de proxy autenticado em /api/photos/[...path]

### Tests

- Adiciona testes de ownership para upload e leitura de fotos
```

### 13.4 Template Oficial

```markdown
## Resumo

<!-- 1 a 3 frases diretas explicando o que mudou, quais componentes/rotas foram afetados e o impacto. -->

## Tipo de MudanÃ§a

- [ ] Feature
- [ ] Fix
- [ ] Refactor
- [ ] Docs
- [ ] Test
- [ ] Chore

## Changelog

### Features

- <!-- Verbo no presente + entrega objetiva -->

## Como Testar

1. Rode `npm run dev`.
2. Abra `<!-- rota ou pÃ¡gina (ex: /equipamentos ou /ordens) -->` e confira `<!-- comportamento esperado -->`.

## Checklist

- [ ] Build passa (`npm run build`)
- [ ] Lint passa (`npm run lint`)
- [ ] Testes passam (`npm test`)
- [ ] TypeScript sem erros (`npx tsc --noEmit`)
- [ ] Apenas arquivos do escopo alterados
```

### 13.5 Exemplo Real de ReferÃªncia (Gold Standard)

TÃ­tulo: `fix(security): torna bucket de fotos privado com proxy autenticado`

```markdown
## Resumo

Fecha o acesso pÃºblico ao bucket `equipment-photos` no Supabase Storage via migrations `0004` e `0005`, adiciona o proxy autenticado `GET /api/photos/[...path]` com validaÃ§Ã£o de titularidade por pasta do usuÃ¡rio e atualiza `EquipmentPhoto` e `/equipamentos` para consumir a nova rota privada.

## Tipo de MudanÃ§a

- [x] Fix
- [x] Test
- [x] Docs

## Changelog

### Fixes

- Torna o bucket `equipment-photos` privado e remove policies legadas permissivas
- Adiciona proxy autenticado em `/api/photos/[...path]` com verificaÃ§Ã£o de ownership
- Atualiza `POST /api/upload` e `EquipmentPhoto` para usar caminhos internos privados

### Tests

- Adiciona cobertura de testes para proxy de fotos, upload e isolamento de titularidade

### Docs

- Atualiza runbook em `supabase/README.md` e documentaÃ§Ã£o em `AGENTS.md`

## Como Testar

1. Rode `npm run dev`.
2. Acesse `/login`, entre na conta de demonstraÃ§Ã£o e abra `/equipamentos`.
3. Cadastre ou edite um ativo enviando uma foto e confira a renderizaÃ§Ã£o via `/api/photos/...`.
4. Abra a URL da imagem em aba anÃ´nima (sem sessÃ£o) e confirme o retorno `401`.

## Checklist

- [x] Build passa (`npm run build`)
- [x] Lint passa (`npm run lint`)
- [x] Testes passam (`npm test`)
- [x] TypeScript sem erros (`npx tsc --noEmit`)
- [x] Apenas arquivos do escopo alterados
```

---

## 14. Checklists

### 14.1 Antes do Commit

- [ ] Gate da seÃ§Ã£o 10.1 concluÃ­do e validado pelo responsÃ¡vel?
- [ ] MudanÃ§a atÃ´mica (uma Ãºnica responsabilidade)?
- [ ] Queries filtram `.eq('user_id', user.id)` e respeitam RLS?
- [ ] Sem `console.log`, `debugger` ou segredos em componentes client?
- [ ] Mensagem de commit segue Conventional Commits?

### 14.2 Antes do Push

- [ ] `npm run build` passou?
- [ ] `npm run lint` passou?
- [ ] `npm test` passou?
- [ ] `npx tsc --noEmit` passou?
- [ ] `git diff` contÃ©m apenas os arquivos esperados?

### 14.3 Antes do PR

- [ ] Checklist 14.2 completo (todos os comandos executados no terminal com exit code 0)
- [ ] TÃ­tulo no formato `tipo(escopo): descriÃ§Ã£o` (sem emojis)?
- [ ] Resumo de alta densidade (1 a 3 frases) citando mÃ³dulos/rotas afetados?
- [ ] Tipo de MudanÃ§a listado verticalmente sem emojis?
- [ ] Changelog preenchido sem emojis e com verbos na 3Âª pessoa do presente?
- [ ] Passos para teste claros e reprodutÃ­veis (iniciando com `1. Rode npm run dev.`)?

---

## 15. Exemplos Completos

### 15.1 Filtrar Ordens de ServiÃ§o por Prazo

**Tarefa:** Adicionar filtro `next_7_days` na listagem de ordens de serviÃ§o

**Branch:** `feat/filtro-prazo-proximos-7-dias`

**Commits:**

```
feat(ordens): adiciona filtro de prazo para prÃ³ximos 7 dias na listagem
test(ordens): cobre filtro next_7_days em deadlines e route handler
```

**Arquivos:** `src/features/service-orders/deadlines.ts` + `src/app/api/service-orders/route.ts` + `src/features/service-orders/__tests__/deadlines.test.ts`

**PR:**

```markdown
## Resumo

Adiciona o filtro de prazo `next_7_days` na toolbar de `/ordens` e no endpoint `GET /api/service-orders`, listando ordens abertas ou em andamento com vencimento entre amanhÃ£ e +7 dias no fuso `America/Sao_Paulo`.

## Tipo de MudanÃ§a

- [x] Feature
- [x] Test

## Changelog

### Features

- Adiciona opÃ§Ã£o "PrÃ³ximos 7 dias" no seletor de prazo de `/ordens`
- Atualiza `GET /api/service-orders` para filtrar intervalo de datas futuras

### Tests

- Adiciona testes unitÃ¡rios para `next_7_days` em `deadlines.test.ts`

## Como Testar

1. Rode `npm run dev`.
2. Acesse `/ordens` e selecione o filtro de prazo "PrÃ³ximos 7 dias" na toolbar.
3. Confira se apenas ordens nÃ£o fechadas com vencimento nos prÃ³ximos 7 dias sÃ£o exibidas.

## Checklist

- [x] Build passa (`npm run build`)
- [x] Lint passa (`npm run lint`)
- [x] Testes passam (`npm test`)
- [x] TypeScript sem erros (`npx tsc --noEmit`)
- [x] Apenas arquivos do escopo alterados
```

---

> **VersÃ£o 3.1** Â· Fonte Ãºnica de verdade para agentes de IA Â· Mantido por Tharcio Santos
>
> | VersÃ£o | Data     | MudanÃ§as                                                                                                                                      |
> | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
> | 3.0    | Out/2026 | Consolida arquitetura CMMS, RLS/Storage privado, proxy autenticado de fotos e suÃ­te de 207 testes                                             |
> | 3.1    | Out/2026 | Refina padrÃ£o de Pull Request com template limpo sem emojis, inclusÃ£o de verificaÃ§Ã£o de formataÃ§Ã£o/tipos no checklist e exemplo Gold Standard |

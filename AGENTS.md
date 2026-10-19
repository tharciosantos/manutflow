# AGENTS.md — ManutFlow

> Manual Operacional para Agentes de IA · v3.0 · atualizado em 2026-10-19

Este documento é a **fonte única de verdade** para agentes que trabalham no repositório **ManutFlow**.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Comandos e Scripts](#4-comandos-e-scripts)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)
6. [Autenticação e Sessão (Supabase SSR)](#6-autenticação-e-sessão-supabase-ssr)
7. [Banco de Dados, Migrations e Segurança](#7-banco-de-dados-migrations-e-segurança)
8. [Regras de Negócio e Domínio](#8-regras-de-negócio-e-domínio)
9. [APIs e Rotas](#9-apis-e-rotas)
10. [Testes e Validação](#10-testes-e-validação)
11. [Padrões de Código e UI](#11-padrões-de-código-e-ui)
12. [Git Flow e Conventional Commits](#12-git-flow-e-conventional-commits)

---

## 1. Visão Geral

O **ManutFlow** é um sistema CMMS (Computerized Maintenance Management System) para gestão de manutenção industrial, controle de ativos/equipamentos, ordens de serviço (preventivas e corretivas), acompanhamento de prazos com SLAs dinâmicos e auditoria de eventos. Conta com **Landing Page pública com simulador interativo**, **Dashboard operacional compacto sem scroll** e painel completo para técnicos e gestores.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão / Detalhes |
|--------|-----------|-------------------|
| **Framework** | Next.js (App Router) | 16.3.x |
| **Linguagem / UI** | TypeScript (strict: true) / React | 19.2.x |
| **Estilização** | Tailwind CSS v4 (@tailwindcss/postcss) | 4.x |
| **Tema** | next-themes (classe `dark`, padrão escuro) | 0.4.x |
| **Banco / Auth / Storage** | Supabase SSR (`@supabase/ssr`, `@supabase/supabase-js`) | PostgreSQL + Bucket `equipment-photos` |
| **Ícones** | Lucide React | ^1.31.x |
| **Gráficos** | Recharts | ^3.9.x (BarChart semestral) |
| **Testes** | Vitest + Testing Library | 17 arquivos / 184 testes / jsdom |
| **Linter** | ESLint (flat config) + eslint-config-next | 9.x / 16.3.x |

---

## 3. Estrutura do Projeto

```
manutflow/
├── src/
│   ├── __tests__/             # Setup global do Vitest
│   ├── app/
│   │   ├── api/               # 16 route handlers REST (dynamic: force-dynamic)
│   │   │   ├── dashboard-summary/ # KPIs, SLAs, gráfico e ordens recentes
│   │   │   ├── equipments/    # Listagem/criação + [id] (GET, PATCH, DELETE)
│   │   │   ├── health/        # Health check
│   │   │   ├── profile/       # Perfil do usuário logado (GET, PATCH)
│   │   │   ├── service-orders/# Listagem/criação + [id] (GET, PATCH, DELETE)
│   │   │   └── upload/        # Upload e remoção de fotos (POST, DELETE)
│   │   ├── auth/callback/     # Troca de código por sessão, com proteção contra open redirect
│   │   ├── equipamentos/      # Listagem de ativos e [id] para ficha técnica
│   │   ├── ordens/            # Listagem de ordens com Toolbar e [id] para detalhes/histórico
│   │   ├── login/ & register/ # Autenticação com credenciais Demo
│   │   ├── perfil/            # Gestão de dados cadastrais do usuário
│   │   ├── page.tsx           # Landing (deslogado) ou Dashboard (logado) — client component
│   │   ├── layout.tsx         # RootLayout + ThemeProvider
│   │   └── globals.css        # Tailwind v4, variáveis de tema e animações
│   ├── components/
│   │   ├── landing/           # DemoMaintenanceFlow, LandingHeader, FeatureCard
│   │   ├── layout/            # AppShell, AppHeader (desktop/mobile)
│   │   ├── ui/                # Modal (<dialog>), StatusCard, Pagination, Toolbar, Breadcrumbs,
│   │   │                      # ThemeSwitcher, EquipmentPhoto
│   │   └── theme-provider.tsx
│   ├── features/              # Módulos de domínio
│   │   ├── dashboard/         # DashboardOverview, KPIs, gráfico Recharts, SLA Badges
│   │   ├── equipments/        # EquipmentList/Form/Search, StatusConfig, PageContent
│   │   └── service-orders/    # ServiceOrderList/Form, deadlines, badges, filtros, PageContent
│   ├── lib/
│   │   ├── auth.ts            # getUser(): sessão + client Supabase ou 401
│   │   ├── validation.ts      # isUuid() e sanitização de termo de busca
│   │   ├── rate-limit.ts      # Rate limit em memória (por processo)
│   │   ├── logger.ts          # Logger JSON (info | warn | error)
│   │   ├── equipment-photo-storage.ts # Ownership e remoção no bucket
│   │   ├── fetch-with-retry.ts# Retry com backoff para chamadas do client
│   │   ├── safe-redirect.ts   # Proteção contra open redirect
│   │   └── supabase/          # client.ts (browser), server.ts (RSC/route), middleware.ts
│   ├── types/                 # equipment.ts, equipment-details.ts, service-order.ts, profile.ts
│   └── proxy.ts               # Proxy do Next.js 16: renova sessão e protege rotas
├── supabase/
│   ├── migrations/            # 0000 a 0003 (baseline, RLS e RPC transacional)
│   └── README.md              # Runbook: aplicar, verificar, rollback
└── public/
    └── previews/              # 2 capturas usadas no README
```

> `src/proxy.ts` fica na raiz de `src/`, **não** em `src/app/`. É a convenção de proxy do Next.js 16 (substitui `middleware.ts`).

---

## 4. Comandos e Scripts

```bash
# Desenvolvimento local
npm run dev              # Next.js em http://localhost:3000

# Validação e Testes
npm test                 # Executa os 184 testes (Vitest, single run)
npm run test:watch       # Modo watch interativo
npx tsc --noEmit         # Verificação estrita de tipagem
npm run lint             # ESLint (flat config)

# Build de Produção
npm run build            # next build --webpack (output standalone)
npm start                # Servidor de produção
```

> O build usa `--webpack` explicitamente. O CI roda lint, testes e build em Node 22.

---

## 5. Variáveis de Ambiente

O Next.js lê tanto `.env` quanto `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://sua-instancia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key # apenas server-side
```

- `NEXT_PUBLIC_*` vai para o bundle do browser — nunca coloque segredo ali.
- `SUPABASE_SERVICE_ROLE_KEY` **ignora RLS**. Usada somente em `src/app/api/upload/route.ts` e em `src/lib/equipment-photo-storage.ts`. Não pode chegar ao client, a logs ou ao repositório.

---

## 6. Autenticação e Sessão (Supabase SSR)

- **Clientes separados**:
  - `src/lib/supabase/client.ts` → `createBrowserClient` (browser).
  - `src/lib/supabase/server.ts` → `createServerClient` com cookies assíncronos (`cookies()`).
  - `src/lib/supabase/middleware.ts` → `updateSession()`, consumido por `src/proxy.ts`.
- **Extração de usuário**: toda API route usa `getUser()` de `@/lib/auth`, que valida o JWT no servidor e devolve `401` quando não há sessão.
- **Proteção de rotas** (`src/proxy.ts`): `/` é pública; `/login`, `/register` e `/auth/callback` são públicas; o resto exige sessão e redireciona para `/login?redirect=...`.
- **Conta de demonstração**: `demo@manutflow.com` / `Demo@123456` (Gestor de Manutenção). As credenciais estão embutidas em `src/app/login/page.tsx`; mover para um route handler server-side é uma pendência conhecida.
- **Perfis**: criados automaticamente por trigger (`handle_new_user`) no signup.

---

## 7. Banco de Dados, Migrations e Segurança

### 7.1 Migrations

O schema é versionado em `supabase/migrations/`. **Toda mudança de schema deve entrar como uma nova migration** — nunca pelo painel do Supabase sem registrar o SQL.

| Arquivo | Conteúdo |
|---|---|
| `0000_baseline.sql` | Baseline idempotente (tabelas, CHECKs, FKs, triggers, índices, RLS de `profiles`, bucket) |
| `0001_rls_hardening.sql` | RLS + políticas de dono + `revoke` do `anon` + trigger anti-IDOR |
| `0002_drop_legacy_policies.sql` | Remove políticas legadas permissivas e recria as de dono |
| `0003_update_service_order_rpc.sql` | RPC `update_service_order`: UPDATE + histórico na mesma transação |

Runbook (aplicar, verificar, rollback): [`supabase/README.md`](supabase/README.md).

### 7.2 Tabelas

1. **`profiles`**: `id` (uuid PK = `auth.uid`), `email`, `full_name`, `avatar_url` (não usado pela UI), `phone`, `role` (usado como cargo), `created_at`, `updated_at`.
2. **`equipments`**: `id` (uuid PK), `name`, `patrimony_code` (único por `user_id`), `location`, `status` (`active` | `inactive` | `maintenance`), `photo_url`, `user_id` (FK `auth.users`), `created_at`, `updated_at`.
3. **`service_orders`**: `id` (uuid PK), `title`, `description`, `status` (`open` | `in_progress` | `closed`), `priority` (`low` | `medium` | `high` | `critical`), `due_date` (`date`, nullable), `equipment_id` (FK `equipments`), `user_id` (FK `auth.users`), `created_at`. **Não possui `updated_at`.**
4. **`service_order_history`**: `id` (uuid PK), `service_order_id` (FK `service_orders`), `user_id`, `event_type`, `previous_status`, `new_status`, `description`, `created_at`. Append-only.
5. **Storage**: bucket `equipment-photos`, arquivos em `<user_id>/<timestamp-random>.<ext>`.

### 7.3 Constraints e triggers

- CHECK nos três enums (`equipments.status`, `service_orders.status`, `service_orders.priority`) — erro `23514`.
- UNIQUE `(user_id, patrimony_code)` em `equipments` — erro `23505`.
- FK `service_orders.equipment_id` → `equipments` com `ON DELETE RESTRICT`.
- FK `service_order_history.service_order_id` → `service_orders` com `ON DELETE CASCADE`.
- Trigger `set_updated_at` em `equipments` e `profiles`.
- Trigger `handle_new_user` em `auth.users` → cria o profile.
- Trigger `enforce_order_equipment_owner` em `service_orders` → impede ordem apontar para equipamento de outro usuário (erro `42501`).

### 7.4 RLS

- `equipments`, `service_orders` e `service_order_history` têm RLS habilitada com políticas de dono (`user_id = auth.uid()`).
- `service_order_history` não tem política de `UPDATE`/`DELETE`: é append-only por consequência.
- O papel `anon` não tem GRANT nas tabelas de dados; qualquer leitura sem JWT retorna `42501`.
- **Políticas de RLS se combinam com `OR`.** Uma política permissiva antiga anula qualquer política restritiva nova. Ao auditar isolamento, liste `pg_policies` antes de concluir que está protegido.

### 7.5 Regras para agentes

- Toda query de dados **deve** filtrar `.eq('user_id', user.id)`. A RLS é a segunda camada, não a única.
- Nunca confie em `equipment_id`, `user_id` ou id vindo do body — valide formato e titularidade.
- Não crie policy nova sem remover a equivalente permissiva.
- Mudança de schema = migration nova + atualização do `supabase/README.md` se o runbook mudar.

### 7.6 RPCs

| Função | Contrato |
|---|---|
| `public.update_service_order(p_order_id uuid, p_status text, p_due_date date, p_set_due_date boolean)` | Atualiza status e/ou prazo e grava o histórico na **mesma transação**, com `for update` na linha. `SECURITY INVOKER` (RLS vale). Retorna `jsonb` com a ordem ou `null` quando não existe/não pertence ao usuário. `EXECUTE` restrito a `authenticated`. |

---

## 8. Regras de Negócio e Domínio

### 8.1 Estados de prazo (`getServiceOrderDeadlineInfo`)

| Estado | Condição | Cor |
|---|---|---|
| `none` | sem `due_date` | neutro |
| `overdue` | `due_date < hoje` e status ≠ `closed` | vermelho |
| `today` | `due_date === hoje` e status ≠ `closed` | âmbar |
| `upcoming` | `due_date > hoje` (qualquer data futura) | azul |
| `closed` | status `closed` | neutro |

"Hoje" é calculado no fuso `America/Sao_Paulo` (`getDateOnlyInTimeZone`); as datas são strings `YYYY-MM-DD` (`isValidDateOnly`).

### 8.2 Filtros de prazo da listagem

`overdue`, `today`, `next_7_days` (amanhã até +7) e `without_due_date` — todos excluem ordens fechadas, exceto `without_due_date`.

### 8.3 Convenções de resposta

| Rota | Formato |
|---|---|
| `GET /api/equipments` | `{ equipments, total, page, totalPages }` |
| `POST/PATCH /api/equipments` | `{ equipment }` |
| `GET /api/equipments/[id]` | `{ equipment, serviceOrders }` |
| `GET /api/service-orders` | `{ serviceOrders, total, page, totalPages }` |
| `POST /api/service-orders` | `{ serviceOrder }` |
| `GET /api/service-orders/[id]` | `{ serviceOrder: { ...campos, history } }` |
| `PATCH /api/service-orders/[id]` | objeto cru (pendência: padronizar como `{ serviceOrder }`) |
| `GET/PATCH /api/profile` | `{ profile }` |
| `POST /api/upload` | `{ url, path }` |
| `DELETE` (equipments, service-orders, upload) | `{ message }` |
| Erros | `{ error: "mensagem" }` |

Paginação: `page` ≥ 1, `limit` entre 1 e 50 (padrão 10), `totalPages = ceil(total / limit)`.

---

## 9. APIs e Rotas

| Método | Rota | Observação |
|---|---|---|
| `GET` | `/api/health` | Resposta estática; não verifica o banco |
| `GET` | `/api/dashboard-summary` | 16 consultas em `Promise.all`; falha tudo se uma falhar |
| `GET` `POST` | `/api/equipments` | Busca em `name`, `patrimony_code`, `location`; filtro por status |
| `GET` `PATCH` `DELETE` | `/api/equipments/[id]` | Exclusão bloqueada se houver ordem vinculada |
| `GET` `POST` | `/api/service-orders` | Filtros: status, priority, deadline, sort; busca em `title`/`description` |
| `GET` `PATCH` `DELETE` | `/api/service-orders/[id]` | PATCH delega à RPC `update_service_order` (status/prazo + histórico transacionais) |
| `GET` `PATCH` | `/api/profile` | Nome, cargo (`role`) e telefone |
| `POST` `DELETE` | `/api/upload` | JPEG/PNG/WebP até 5 MB; 10 req/min |
| `GET` | `/auth/callback` | `exchangeCodeForSession` + redirect seguro |

Rate limit: 30 req/min por usuário nas mutações de equipamentos e ordens; 10 req/min no upload. É em memória, por instância — em serverless não é um limite global.

---

## 10. Testes e Validação

### 10.1 Gate obrigatório antes de commit

Nenhum commit é criado sem passar, nesta ordem:

1. **Implementar** na working tree, sem commit.
2. **Automatizado**: `npm test && npx tsc --noEmit && npm run lint` — todos verdes.
3. **Schema**: se a mudança depende de migration, o SQL precisa estar aplicado no
   Supabase pelo responsável. Não se commita código que chama função inexistente.
4. **Roteiro manual**: o agente entrega um checklist numerado (passo, ação,
   resultado esperado) referente exatamente ao que mudou.
5. **Validação do responsável**: ele executa e responde com o resultado.
6. **Aprovação explícita**: só depois do "ok" o agente cria o commit.

O agente não commita, não faz push e não aplica migration por conta própria.
Ao encontrar um problema na validação, o agente corrige e o roteiro é repetido
desde o passo 2.

### 10.2 Suíte automatizada

- **17 arquivos / 184 testes**, todos passando, cobrindo:
  - domínio: prazos, badges de SLA, config de status, redirect seguro, validação de UUID, retry;
  - API routes: auth, perfil, equipamentos, ordens, upload, dashboard e rate limit;
  - componentes: dashboard, toolbar, listas, tema.
- Não há coverage configurado; não há teste de integração contra Postgres (a RLS não é coberta por teste automatizado).
- Antes de qualquer commit: `npm test && npx tsc --noEmit && npm run lint`.

---

## 11. Padrões de Código e UI

- **Dashboard sem scroll**: duas colunas no desktop (`lg:col-span-2` para gráfico e urgências; `1/3` para prioridades e atividades recentes).
- **Toolbar simétrico**: grid de 4 colunas (`Status`, `Prioridade`, `Prazo`, `Ordenar`).
- **Tema**: claro e escuro via `next-themes` (`attribute="class"`), padrão escuro, `enableSystem`.
- **Paleta**: modo escuro em `slate-950` / `slate-900/60` / bordas `slate-800`; modo claro em `slate-50` / branco. Acentos semânticos: `teal-500` (ação), `amber` (atenção), `red` (crítico), `sky` (programado), `emerald` (concluído).
- **Modal**: `<dialog>` nativo (`showModal`), fechamento por ESC e clique no backdrop. Modal com `children` não exibe rodapé de confirmação.
- **Acessibilidade**: labels em todos os campos, `aria-label` em seletores iconográficos, `aria-live` nos feedbacks dos formulários.

---

## 12. Git Flow e Conventional Commits

- Branches temáticas: `feat/`, `fix/`, `refactor/`, `docs/`.
- Commits atômicos no padrão: `tipo(escopo): descrição concisa`.
- Commit apenas depois do gate da seção 10.1 (validação manual do responsável).
- Push e abertura de PR são feitos pelo responsável, nunca pelo agente.
- Pull Request obrigatório com CI verde antes do merge na `main`.
- CI (`.github/workflows/ci.yml`): `npm run lint` → `npm run test` → `npm run build`, em Node 22.

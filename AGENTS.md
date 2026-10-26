# AGENTS.md — ManutFlow

> Manual Operacional para Agentes de IA · v3.1 · atualizado em Out/2026

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
13. [Pull Request](#13-pull-request)
14. [Checklists](#14-checklists)
15. [Exemplos Completos](#15-exemplos-completos)

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
| **Testes** | Vitest + Testing Library | 19 arquivos / 207 testes / jsdom |
| **Linter** | ESLint (flat config) + eslint-config-next | 9.x / 16.3.x |

---

## 3. Estrutura do Projeto

```
manutflow/
├── src/
│   ├── __tests__/             # Setup global do Vitest
│   ├── app/
│   │   ├── api/               # 18 route handlers REST (dynamic: force-dynamic)
│   │   │   ├── dashboard-summary/ # KPIs, SLAs, gráfico e ordens recentes
│   │   │   ├── demo-login/    # Cria a sessão da demo (público, 5 req/min por IP)
│   │   │   ├── equipments/    # Listagem/criação + [id] (GET, PATCH, DELETE)
│   │   │   ├── health/        # Health check
│   │   │   ├── photos/        # Proxy autenticado das fotos (bucket privado)
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
│   ├── migrations/            # 0000 a 0005 (baseline, RLS, RPC e Storage)
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
npm test                 # Executa os 207 testes (Vitest, single run)
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
DEMO_EMAIL=demo@manutflow.com                  # conta do botão de demonstração
DEMO_PASSWORD=sua-senha-demo                   # apenas server-side
```

- `NEXT_PUBLIC_*` vai para o bundle do browser — nunca coloque segredo ali.
- `SUPABASE_SERVICE_ROLE_KEY` **ignora RLS**. Usada somente em `src/app/api/upload/route.ts` e em `src/lib/equipment-photo-storage.ts`. Não pode chegar ao client, a logs ou ao repositório.
- `DEMO_PASSWORD` alimenta `POST /api/demo-login`. **Nunca** referencie essas variáveis em componente client nem caia em senha padrão no código: sem a env a rota responde `503`.

---

## 6. Autenticação e Sessão (Supabase SSR)

- **Clientes separados**:
  - `src/lib/supabase/client.ts` → `createBrowserClient` (browser).
  - `src/lib/supabase/server.ts` → `createServerClient` com cookies assíncronos (`cookies()`).
  - `src/lib/supabase/middleware.ts` → `updateSession()`, consumido por `src/proxy.ts`.
- **Extração de usuário**: toda API route usa `getUser()` de `@/lib/auth`, que valida o JWT no servidor e devolve `401` quando não há sessão.
- **Proteção de rotas** (`src/proxy.ts`): `/` é pública; `/login`, `/register`, `/auth/callback` e `/api/demo-login` são públicas; o resto exige sessão e redireciona para `/login?redirect=...`.
- **Conta de demonstração**: `demo@manutflow.com` (Gestor de Manutenção). A senha vive em `DEMO_PASSWORD` e é usada no servidor por `POST /api/demo-login`, que cria a sessão e grava os cookies. Nenhuma credencial de demo pode existir em componente client — o bundle é público.
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
| `0004_storage_hardening.sql` | Bucket privado, limites de tamanho/MIME e políticas de dono no Storage |
| `0005_storage_policies_cleanup.sql` | Remove policies legadas de `storage.objects` por varredura (a `0004` não bastou) |

Runbook (aplicar, verificar, rollback): [`supabase/README.md`](supabase/README.md).

### 7.2 Tabelas

1. **`profiles`**: `id` (uuid PK = `auth.uid`), `email`, `full_name`, `avatar_url` (não usado pela UI), `phone`, `role` (usado como cargo), `created_at`, `updated_at`.
2. **`equipments`**: `id` (uuid PK), `name`, `patrimony_code` (único por `user_id`), `location`, `status` (`active` | `inactive` | `maintenance`), `photo_url`, `user_id` (FK `auth.users`), `created_at`, `updated_at`.
3. **`service_orders`**: `id` (uuid PK), `title`, `description`, `status` (`open` | `in_progress` | `closed`), `priority` (`low` | `medium` | `high` | `critical`), `due_date` (`date`, nullable), `equipment_id` (FK `equipments`), `user_id` (FK `auth.users`), `created_at`. **Não possui `updated_at`.**
4. **`service_order_history`**: `id` (uuid PK), `service_order_id` (FK `service_orders`), `user_id`, `event_type`, `previous_status`, `new_status`, `description`, `created_at`. Append-only.
5. **Storage**: bucket `equipment-photos` **privado** desde a migration `0004`. Arquivos em `<user_id>/<timestamp-random>.<ext>`. O banco guarda `/api/photos/<path>`, e a imagem só é servida por `GET /api/photos/[...path]`, que exige sessão e confere a titularidade. Não existe mais URL pública do Storage.

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
- **Remover policy legada exige varredura, não filtro por expressão.** Policies do template do Supabase usam `bucket_id = '<bucket>'`, não `true`; filtrar por `qual = 'true'` deixa passar e o acesso continua aberto (aconteceu na `0004`, corrigido na `0005`). Remova por escopo — todas as policies da tabela menos as de dono — e recrie só as suas.

### 7.5 Regras para agentes

- Toda query de dados **deve** filtrar `.eq('user_id', user.id)`. A RLS é a segunda camada, não a única.
- Nunca confie em `equipment_id`, `user_id` ou id vindo do body — valide formato e titularidade.
- Não crie policy nova sem remover a equivalente permissiva.
- Mudança de schema = migration nova + atualização do `supabase/README.md` se o runbook mudar.
- **Segredo nunca em componente client.** O bundle é público: qualquer string em `src/app/**` com `"use client"` pode ser lida no DevTools. Credenciais de demo ficam em env server-side e são usadas só em route handler.

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
| `POST /api/demo-login` | `{ ok: true }` |
| `GET /api/photos/[...path]` | binário, com `Content-Type`, `Content-Length` e `Cache-Control: private` |
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
| `POST` | `/api/demo-login` | Público: cria a sessão da demo (5 req/min por IP; 503 sem `DEMO_PASSWORD`) |
| `GET` | `/api/photos/[...path]` | Única porta para as imagens: exige sessão e confere a pasta do dono (404 caso contrário) |
| `GET` | `/auth/callback` | `exchangeCodeForSession` + redirect seguro |

Rate limit: 30 req/min por usuário nas mutações de equipamentos e ordens; 10 req/min no upload. É em memória, por instância — em serverless não é um limite global.

---

## 10. Testes e Validação

### 10.1 Gate obrigatório antes de commit

Nenhum commit é criado sem passar, nesta ordem:

1. **Implementar** na working tree, sem commit.
2. **Automatizado**: `npm run build && npm run lint && npm test && npx tsc --noEmit` — todos verdes (exit code 0).
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

- **19 arquivos / 207 testes**, todos passando, cobrindo:
  - domínio: prazos, badges de SLA, config de status, redirect seguro, validação de UUID, retry;
  - API routes: auth, perfil, equipamentos, ordens, upload, dashboard e rate limit;
  - componentes: dashboard, toolbar, listas, tema.
- Não há coverage configurado; não há teste de integração contra Postgres (a RLS não é coberta por teste automatizado).
- Antes de qualquer commit/PR: `npm run build && npm run lint && npm test && npx tsc --noEmit`.

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

- Branches temáticas: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/`, `test/`.
- Commits atômicos no padrão: `tipo(escopo): descrição concisa`.
- Commit apenas depois do gate da seção 10.1 (validação manual do responsável).
- Push e abertura de PR são feitos pelo responsável, nunca pelo agente.
- Pull Request obrigatório com CI verde antes do merge na `main`.
- CI (`.github/workflows/ci.yml`): `npm run lint` → `npm run test` → `npm run build`, em Node 22.

---

## 13. Pull Request

### 13.1 Título

```
tipo(escopo): descrição concisa no presente do indicativo (≤ 72 caracteres)
```

Exemplo: `fix(security): torna bucket de fotos privado com proxy autenticado`

### 13.2 Regras de Redação e Densidade Técnica (Gold Standard)

Para garantir máxima clareza para revisores humanos e indexadores de código:
- **Sem emojis nos cabeçalhos ou listas:** Use Markdown puro (`### Features`, `### Fixes`, `### Docs`, `- [x] Feature`). É proibido usar emojis como `✨`, `🐛`, `📝` no corpo ou título do PR.
- **Resumo de alta densidade (1 a 3 frases):** Descreva o que foi entregue citando nominalmente os módulos, componentes, páginas, rotas ou métricas impactadas (ex: `/equipamentos`, `/ordens`, `/api/photos/[...path]`, `DashboardOverview`). Evite frases genéricas.
- **Verbos de ação na 3ª pessoa do singular:** Inicie os itens do Changelog com verbos no presente do indicativo: *Adiciona*, *Atualiza*, *Corrige*, *Remove*, *Sincroniza*, *Concentra*, *Extrai*.
- **Como Testar reprodutível:** Comece sempre com o comando de execução (`1. Rode npm run dev.`) e indique as rotas exatas (ex: `/equipamentos`, `/ordens/[id]`, `/perfil`, etc.) ou interações exatas para validar a entrega.
- **Tipo de Mudança vertical e limpo:** Liste uma opção por linha, sem emojis, marcando com `[x]` apenas os tipos aplicáveis ao PR.
- **Validação real antes de marcar o Checklist:** O agente DEVE executar cada comando do checklist no terminal e confirmar saída limpa (exit code 0) antes de marcar `[x]`.

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

## Tipo de Mudança

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
2. Abra `<!-- rota ou página (ex: /equipamentos ou /ordens) -->` e confira `<!-- comportamento esperado -->`.

## Checklist

- [ ] Build passa (`npm run build`)
- [ ] Lint passa (`npm run lint`)
- [ ] Testes passam (`npm test`)
- [ ] TypeScript sem erros (`npx tsc --noEmit`)
- [ ] Apenas arquivos do escopo alterados
```

### 13.5 Exemplo Real de Referência (Gold Standard)

Título: `fix(security): torna bucket de fotos privado com proxy autenticado`

```markdown
## Resumo

Fecha o acesso público ao bucket `equipment-photos` no Supabase Storage via migrations `0004` e `0005`, adiciona o proxy autenticado `GET /api/photos/[...path]` com validação de titularidade por pasta do usuário e atualiza `EquipmentPhoto` e `/equipamentos` para consumir a nova rota privada.

## Tipo de Mudança

- [x] Fix
- [x] Test
- [x] Docs

## Changelog

### Fixes

- Torna o bucket `equipment-photos` privado e remove policies legadas permissivas
- Adiciona proxy autenticado em `/api/photos/[...path]` com verificação de ownership
- Atualiza `POST /api/upload` e `EquipmentPhoto` para usar caminhos internos privados

### Tests

- Adiciona cobertura de testes para proxy de fotos, upload e isolamento de titularidade

### Docs

- Atualiza runbook em `supabase/README.md` e documentação em `AGENTS.md`

## Como Testar

1. Rode `npm run dev`.
2. Acesse `/login`, entre na conta de demonstração e abra `/equipamentos`.
3. Cadastre ou edite um ativo enviando uma foto e confira a renderização via `/api/photos/...`.
4. Abra a URL da imagem em aba anônima (sem sessão) e confirme o retorno `401`.

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

- [ ] Gate da seção 10.1 concluído e validado pelo responsável?
- [ ] Mudança atômica (uma única responsabilidade)?
- [ ] Queries filtram `.eq('user_id', user.id)` e respeitam RLS?
- [ ] Sem `console.log`, `debugger` ou segredos em componentes client?
- [ ] Mensagem de commit segue Conventional Commits?

### 14.2 Antes do Push

- [ ] `npm run build` passou?
- [ ] `npm run lint` passou?
- [ ] `npm test` passou?
- [ ] `npx tsc --noEmit` passou?
- [ ] `git diff` contém apenas os arquivos esperados?

### 14.3 Antes do PR

- [ ] Checklist 14.2 completo (todos os comandos executados no terminal com exit code 0)
- [ ] Título no formato `tipo(escopo): descrição` (sem emojis)?
- [ ] Resumo de alta densidade (1 a 3 frases) citando módulos/rotas afetados?
- [ ] Tipo de Mudança listado verticalmente sem emojis?
- [ ] Changelog preenchido sem emojis e com verbos na 3ª pessoa do presente?
- [ ] Passos para teste claros e reprodutíveis (iniciando com `1. Rode npm run dev.`)?

---

## 15. Exemplos Completos

### 15.1 Filtrar Ordens de Serviço por Prazo

**Tarefa:** Adicionar filtro `next_7_days` na listagem de ordens de serviço

**Branch:** `feat/filtro-prazo-proximos-7-dias`

**Commits:**

```
feat(ordens): adiciona filtro de prazo para próximos 7 dias na listagem
test(ordens): cobre filtro next_7_days em deadlines e route handler
```

**Arquivos:** `src/features/service-orders/deadlines.ts` + `src/app/api/service-orders/route.ts` + `src/features/service-orders/__tests__/deadlines.test.ts`

**PR:**

```markdown
## Resumo

Adiciona o filtro de prazo `next_7_days` na toolbar de `/ordens` e no endpoint `GET /api/service-orders`, listando ordens abertas ou em andamento com vencimento entre amanhã e +7 dias no fuso `America/Sao_Paulo`.

## Tipo de Mudança

- [x] Feature
- [x] Test

## Changelog

### Features

- Adiciona opção "Próximos 7 dias" no seletor de prazo de `/ordens`
- Atualiza `GET /api/service-orders` para filtrar intervalo de datas futuras

### Tests

- Adiciona testes unitários para `next_7_days` em `deadlines.test.ts`

## Como Testar

1. Rode `npm run dev`.
2. Acesse `/ordens` e selecione o filtro de prazo "Próximos 7 dias" na toolbar.
3. Confira se apenas ordens não fechadas com vencimento nos próximos 7 dias são exibidas.

## Checklist

- [x] Build passa (`npm run build`)
- [x] Lint passa (`npm run lint`)
- [x] Testes passam (`npm test`)
- [x] TypeScript sem erros (`npx tsc --noEmit`)
- [x] Apenas arquivos do escopo alterados
```

---

> **Versão 3.1** · Fonte única de verdade para agentes de IA · Mantido por Tharcio Santos
>
> | Versão | Data     | Mudanças                                                                                                                                      |
> | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
> | 3.0    | Out/2026 | Consolida arquitetura CMMS, RLS/Storage privado, proxy autenticado de fotos e suíte de 207 testes                                             |
> | 3.1    | Out/2026 | Refina padrão de Pull Request com template limpo sem emojis, inclusão de verificação de formatação/tipos no checklist e exemplo Gold Standard |

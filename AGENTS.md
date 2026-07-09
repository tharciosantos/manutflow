# AGENTS.md — ManutFlow

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS | 4.x (@tailwindcss/postcss) |
| Banco/Auth | Supabase (SSR) | ^0.12.0 / ^2.106.2 |
| Gráficos | Recharts | ^3.9.2 |
| Testes | Vitest | ^4.1.10 |
| Linter | ESLint (flat config) | ^9 |
| TypeScript | strict: true | ^5 |
| Biblioteca UI nativa | `<dialog>` (modal), Tailwind v4 | — |
| Gráficos | Recharts | ^3.9.2 |

## Dependências

| Pacote | Versão | Finalidade |
|--------|--------|-----------|
| next | 16.2.6 | Framework |
| react / react-dom | 19.2.4 | UI |
| @supabase/ssr | ^0.12.0 | Supabase SSR (client + server) |
| @supabase/supabase-js | ^2.106.2 | Supabase core |
| recharts | ^3.9.2 | Gráfico de barras no dashboard |
| tailwindcss | ^4 | CSS utility-first |
| @tailwindcss/postcss | ^4 | PostCSS plugin para Tailwind v4 |
| typescript | ^5 | Type checking |
| vitest | ^4.1.10 | Test runner |
| @testing-library/react | ^16.3.2 | Testes de componente |
| @testing-library/jest-dom | ^6.9.1 | Matchers DOM para testes |
| jsdom | ^29.1.1 | Ambiente DOM para testes |
| eslint | ^9 | Linter (flat config) |
| eslint-config-next | 16.2.6 | Regras Next.js para ESLint |

## Comandos

```bash
npm run dev        # next dev
npm run build      # next build
npm run test       # vitest run        (24 testes, setup em src/__tests__/setup.ts)
npm run test:watch # vitest
npm run lint       # eslint            (flat config em eslint.config.mjs)
```

## Variáveis de ambiente (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # opcional, server-side
```

## Estrutura de pastas

```
src/
  __tests__/              setup + mocks globais
  app/
    api/                   8 rotas de API (App Router)
    (equipamentos|ordens|login|register|perfil)/  páginas "use client"
  components/
    layout/               AppShell, AppHeader
    ui/                   Modal (<dialog> nativo), StatusCard, Pagination, Breadcrumbs
  features/               Componentes de domínio (dashboard, equipments, service-orders)
  lib/                    auth.ts, rate-limit.ts, logger.ts, supabase/*
  types/                  equipment.ts, service-order.ts, profile.ts, equipment-details.ts
scripts/                  Migrations SQL de referência (gitignored)
docs/                     Planos de implementação (gitignored)
```

## Convenções não-óbvias

- **Todas as páginas são `"use client"`** — não há React Server Components neste projeto.
- **Toda API route exporta `export const dynamic = "force-dynamic"`** — nenhuma usa geração estática.
- **Respostas da API são sempre `wrapadas`** em objeto nomeado:
  - `GET list` → `{ equipments: [...], total, page, totalPages }` / `{ serviceOrders: [...], ... }`
  - `GET single` → `{ equipment: {...} }` / `{ serviceOrder: {...}, history: [...] }` / `{ profile: {...} }`
  - `POST` → `{ equipment: {...} }` (status 201) / `{ serviceOrder: {...} }` (status 201)
  - `PATCH` → `{ serviceOrder: {...} }`
  - `DELETE` → `{ message: "..." }`
  - `Erro` → `{ error: "mensagem" }` (status 4xx/5xx)
- **Status de equipamento**: `"active" | "inactive" | "maintenance"` — config central em `equipment-status-config.ts`.
- **Status de ordem**: `"open" | "in_progress" | "closed"` — config central em `service-order-config.ts`.
- **Prioridade de ordem**: `"low" | "medium" | "high" | "critical"` — mesma config.
- **Modal de confirmação** usa `<dialog>` nativo + `showModal()`, não biblioteca externa.
- **Tema escuro** com fundo `bg-slate-950` e texto `text-slate-100`. Gradiente via classe `bg-gradient-theme` no CSS.
- **Cores de status**: active=emerald, inactive=slate, maintenance=amber
- **Cores de prioridade**: low=slate, medium=yellow, high=orange, critical=red
- **Cores de ação**: teal (primário/criar), sky (editar), red (excluir/perigo)

## Auth & Segurança

- **Autenticação**: Supabase SSR (`@supabase/ssr`). Clientes separados: `server.ts` (server component / API route) e `client.ts` (browser).
- **Toda API route** extrai o usuário com `getUser()` de `@/lib/auth` — retorna 401 se não autenticado.
- **Toda query do banco** filtra por `user_id` — RLS no Supabase é redundância, mas a segurança é feita no código.
- **Trigger automático de profiles**: quando um usuário se cadastra no Supabase Auth, um trigger (DB webhook ou trigger nativo) cria automaticamente um registro em `profiles` com `id = auth.uid()` e `email = auth.email()`. Os campos `full_name`, `phone` e `role` são opcionais.
- **Rate limiter em memória** (30 req/min por usuário em POST/PATCH/DELETE) — **volátil**: reiniciar o servidor zera os contadores; não funciona em múltiplas instâncias.
- **Logging**: `logger('level', 'event', data?)` imprime JSON no stdout/stderr.

## Testes

**5 arquivos de teste (24 testes no total):**
```
src/app/api/health/__tests__/route.test.ts
src/app/api/equipments/__tests__/route.test.ts
src/app/api/service-orders/__tests__/route.test.ts
src/app/api/dashboard-summary/__tests__/route.test.ts
src/lib/__tests__/auth.test.ts
```

- Apenas **1 suíte de teste** para a API `dashboard-summary` — as demais APIs **não têm cobertura**.
- Mocks do Supabase são manuais (objeto `from()` encadeado com `.eq()`, `.order()`, `.limit()`).
- Setup em `src/__tests__/setup.ts` importa `@testing-library/jest-dom/vitest`.
- Sem testes E2E ou de componente no momento.

## Banco de Dados

Tabelas do Supabase (Postgres):
```
profiles
  id              uuid PK          = auth.uid()
  email           text             preenchido pelo trigger
  full_name       text | null      editável via /api/profile
  phone           text | null      editável via /api/profile
  role            text | null      editável via /api/profile
  avatar_url      text | null      (não usado no momento)
  created_at      timestamptz
  updated_at      timestamptz

equipments
  id              uuid PK
  name            text             obrigatório (max 255)
  patrimony_code  text             obrigatório (max 100, único por user_id)
  location        text             obrigatório (max 255)
  status          text             active | inactive | maintenance
  user_id         uuid FK → auth.users
  created_at      timestamptz
  updated_at      timestamptz

service_orders
  id              uuid PK
  title           text             obrigatório (max 255)
  description     text | null      opcional (max 2000)
  status          text             open | in_progress | closed
  priority        text             low | medium | high | critical
  equipment_id    uuid FK → equipments
  user_id         uuid FK → auth.users
  created_at      timestamptz

service_order_history
  id              uuid PK
  service_order_id uuid FK → service_orders
  user_id         uuid FK → auth.users
  event_type      text
  previous_status text | null
  new_status      text | null
  description     text | null
  created_at      timestamptz
```

## Limitações / Gotchas

- **Rate limiter**: em memória, perdido no restart. Não escala horizontalmente. `setInterval` de cleanup roda apenas em ambiente Node.js tradicional, não em serverless.
- **Sem middleware.ts**: não existe arquivo middleware — a SPA gerencia sessão via `createClient()` do lado do cliente.
- **`scripts/` e `docs/` estão no `.gitignore`**: migrations SQL e planos ficam só em disco como referência.
- **Migration manual necessária**: para ativar `phone` e `role` na tabela `profiles`, execute no SQL Editor do Supabase:
  ```sql
  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS role TEXT;
  ```
- **`next.config.ts`** com `output: "standalone"` — para build Docker/deploy autônomo.
- **Vitest v4** usa `environment: 'node'` (não `jsdom` para testes de API). O setup global só importa `@testing-library/jest-dom/vitest`.
- **Todas as queries do dashboard** disparam 12 `Promise.all` em paralelo — pode ser custoso com muitos dados.
- **TS strict mode** ativo — tipos `unknown` em alguns places (ex: `request.json()` com `as` cast).

## Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/). Exemplos reais do projeto:
```
feat: melhorias no dashboard com gráfico, atividades recentes e cards com insight
feat: criar perfil do usuário com API, página e link no header
feat: adicionar rate limiting e logging estruturado nas APIs
fix: remover detalhes de erro expostos nas APIs de equipamentos
fix: corrigir open redirect no auth callback validando parâmetro next
refactor: padronizar respostas da API de service-orders para formato wrapado
refactor: otimizar getUser() para retornar client Supabase e evitar criação dupla
docs: atualizar README com menções a segurança e acessibilidade
```

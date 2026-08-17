# AGENTS.md — ManutFlow

> Manual Operacional para Agentes de IA · v2.0

Este documento é a **fonte única de verdade** para agentes que trabalham no repositório **ManutFlow**.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Comandos e Scripts](#4-comandos-e-scripts)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)
6. [Autenticação e Sessão (Supabase SSR)](#6-autenticação-e-sessão-supabase-ssr)
7. [Banco de Dados e Schema](#7-banco-de-dados-e-schema)
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
| **Banco / Auth / Storage** | Supabase SSR (`@supabase/ssr`, `@supabase/supabase-js`) | PostgreSQL + Bucket `equipment-photos` |
| **Ícones** | Lucide React | ^1.16.x |
| **Gráficos** | Recharts | ^3.9.x (BarChart semestral) |
| **Testes Unitários** | Vitest + Testing Library | 15 arquivos / 161 testes / jsdom |
| **Linter** | ESLint (flat config) + eslint-config-next | 9.x / 16.3.x |

---

## 3. Estrutura do Projeto

```
manutflow/
├── src/
│   ├── __tests__/             # Setup global Vitest e mocks
│   ├── app/
│   │   ├── api/               # 8 rotas de API (App Router, dynamic: force-dynamic)
│   │   │   ├── dashboard-summary/ # Consolidação de KPIs, SLAs, gráfico e atividades
│   │   │   ├── equipments/    # CRUD de equipamentos com paginação e busca
│   │   │   ├── health/        # Health check
│   │   │   ├── profile/       # Perfil do usuário logado (nome, cargo, telefone)
│   │   │   ├── service-orders/# CRUD de ordens de serviço e filtros de SLA
│   │   │   └── upload/        # Upload de fotos de ativos no Supabase Storage
│   │   ├── auth/callback/     # Callback OAuth/Magic link com proteção contra open redirect
│   │   ├── equipamentos/      # Listagem de ativos e [id] para ficha técnica
│   │   ├── ordens/            # Listagem de ordens com Toolbar e [id] para detalhes/histórico
│   │   ├── login/ & register/ # Autenticação com credenciais Demo instantâneas
│   │   ├── perfil/            # Gestão de dados cadastrais do usuário
│   │   ├── page.tsx           # Landing Page (deslogado) ou Dashboard Operacional (logado)
│   │   ├── layout.tsx         # RootLayout
│   │   ├── proxy.ts           # Proxy Next.js 16 para renovação de sessão Supabase
│   │   └── globals.css        # Tailwind v4 directives e paleta dark
│   ├── components/
│   │   ├── landing/           # DemoMaintenanceFlow (simulador), LandingHeader, FeatureCard
│   │   ├── layout/            # AppShell, AppHeader (navegação desktop/mobile)
│   │   └── ui/                # Modal (<dialog> nativo), StatusCard, Pagination, Toolbar, Photo
│   ├── features/              # Módulos de domínio
│   │   ├── dashboard/         # DashboardOverview, KPIs, gráfico Recharts, SLA Badges
│   │   ├── equipments/        # EquipmentList, EquipmentForm, StatusConfig
│   │   └── service-orders/    # ServiceOrderList, ServiceOrderForm, Deadlines, Badges
│   ├── lib/                   # auth.ts, rate-limit.ts, logger.ts, supabase/(client|server).ts
│   └── types/                 # equipment.ts, service-order.ts, profile.ts
└── public/
    └── previews/              # 8 capturas de tela em alta definição
```

---

## 4. Comandos e Scripts

```bash
# Desenvolvimento local
npm run dev              # Inicia servidor Next.js em http://localhost:3000

# Validação e Testes
npm test                 # Executa os 161 testes com Vitest
npm run test:watch       # Modo watch interativo
npx tsc --noEmit         # Verificação estrita de tipagem TypeScript
npm run lint             # ESLint (flat config)

# Build de Produção
npm run build            # Gera build standalone otimizado
npm start                # Roda o servidor de produção
```

---

## 5. Variáveis de Ambiente (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://sua-instancia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key # opcional para scripts administrativos
```

---

## 6. Autenticação e Sessão (Supabase SSR)

- **Clientes separados**:
  - `src/lib/supabase/client.ts` → `createBrowserClient` (Browser).
  - `src/lib/supabase/server.ts` → `createServerClient` com manipulação assíncrona de cookies (`cookies()`).
- **Extração de Usuário**: Toda API route usa `getUser()` de `@/lib/auth`, garantindo verificação segura do JWT no servidor.
- **Conta de Demonstração**:
  - `demo@manutflow.com` / `demo1234` (Gestor de Manutenção).

---

## 7. Banco de Dados e Schema (Supabase PostgreSQL)

### Tabelas:
1. **`profiles`**: `id` (uuid PK = auth.uid), `email`, `full_name`, `phone`, `role`, `created_at`, `updated_at`.
2. **`equipments`**: `id` (uuid PK), `name`, `patrimony_code` (único por user_id), `location`, `status` (`active` | `inactive` | `maintenance`), `photo_url`, `user_id` (FK auth.users), timestamps.
3. **`service_orders`**: `id` (uuid PK), `title`, `description`, `status` (`open` | `in_progress` | `closed`), `priority` (`low` | `medium` | `high` | `critical`), `due_date`, `equipment_id` (FK equipments), `user_id` (FK auth.users), timestamps.
4. **`service_order_history`**: `id` (uuid PK), `service_order_id` (FK), `user_id`, `event_type`, `previous_status`, `new_status`, `description`, `created_at`.
5. **Storage**: Bucket `equipment-photos` para imagens de ativos industriais.

---

## 8. Regras de Negócio e Domínio

- **Prazos e SLAs de Ordens (`ServiceOrderDeadlineBadge`)**:
  - **Atrasadas (`overdue`)**: `due_date < hoje` e status !== `closed` → Destaque vermelho / alerta imediato.
  - **Vencem Hoje (`today`)**: `due_date === hoje` e status !== `closed` → Destaque dourado / ação imediata.
  - **Próximos 7 Dias (`next_7_days`)**: `due_date` entre amanhã e 7 dias → Destaque azul / programadas.
- **Convenções de Resposta da API**:
  - Todas as respostas são retornadas em objeto nomeado: `{ equipments: [...], total, page, totalPages }`, `{ serviceOrder: {...}, history: [...] }`, `{ error: "mensagem" }`.

---

## 9. APIs e Rotas

- `GET /api/dashboard-summary` — Agrega contadores de ativos, ordens abertas/fechadas, métricas de SLA, gráfico semestral e atividades recentes.
- `GET /api/equipments` & `POST /api/equipments` — Listagem com paginação e criação de ativos.
- `GET /api/equipments/[id]`, `PUT /api/equipments/[id]`, `DELETE /api/equipments/[id]` — Gestão completa do ativo.
- `GET /api/service-orders` & `POST /api/service-orders` — Listagem com filtros por status, prioridade, prazo e criação de ordens.
- `GET /api/service-orders/[id]`, `PATCH /api/service-orders/[id]`, `DELETE /api/service-orders/[id]` — Detalhes, transição de status com auditoria e exclusão.
- `POST /api/upload` — Upload multipart/form-data com validação de tipo de imagem e salvamento no bucket Supabase.
- `GET /api/profile` & `PUT /api/profile` — Consulta e atualização cadastral do perfil.

---

## 10. Testes e Validação

- **15 arquivos de teste (161 testes 100% passando)** cobrindo:
  - Validações de domínio, cálculos de prazos e badges de SLA.
  - API Routes de autenticação, perfil, equipamentos, ordens e upload.
  - Renderização e comportamento de componentes (Dashboard, Toolbar, Equipamentos, Ordens).

Execute `npm test && npx tsc --noEmit && npm run lint` antes de commits.

---

## 11. Padrões de Código e UI

- **Dashboard Sem Scroll**: Densidade visual equilibrada com layout de 2 colunas no desktop (`lg:col-span-2` para gráfico e urgências, `1/3` para prioridades e atividades).
- **Toolbar Simétrico**: Grid uniforme de 4 colunas para filtros (`Status`, `Prioridade`, `Prazo`, `Ordenar`).
- **Paleta Industrial**: Fundo `slate-950`, cards `slate-900/60`, bordas `slate-800` e acentos semânticos (`teal-500`, `amber-400`, `red-400`, `sky-400`, `emerald-400`).

---

## 12. Git Flow e Conventional Commits

- Branches temáticas: `feat/`, `fix/`, `refactor/`, `docs/`.
- Commits atômicos no padrão: `tipo(escopo): descrição concisa`.
- Pull Request obrigatório com CI verde antes do merge na `main`.

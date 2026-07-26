# ManutFlow

Sistema de Controle de Manutenção e Ordens de Serviço — full stack com Next.js, Supabase e TypeScript.

## Funcionalidades

### 📊 Dashboard
- Indicadores em tempo real: total de equipamentos, ordens abertas e concluídas
- Indicadores de prazo: ordens atrasadas, vencendo hoje e nos próximos 7 dias
- Atalhos dos indicadores para a listagem com o filtro de prazo aplicado
- Lista das 5 ordens com prazo mais urgente, com acesso aos detalhes
- **Gráfico de ordens por mês** (Recharts) — últimos 6 meses
- **Atividades recentes**: últimas 5 ordens e últimos 5 equipamentos
- Prioridades com barras de progresso visuais
- Taxa de conclusão (%) calculada automaticamente
- Auto-refresh ao voltar para a aba (`visibilitychange`)

### 🔧 Equipamentos
- CRUD completo: cadastro, edição, listagem e exclusão
- Busca textual por nome, patrimônio e localização
- Filtro por status (ativo, inativo, em manutenção)
- **Upload de foto** (JPEG/PNG/WebP até 5MB) via Supabase Storage
- Preview da imagem no formulário e thumbnail nos cards
- Página de detalhes com foto, breadcrumbs e ordens vinculadas
- Bloqueio de exclusão quando existem ordens vinculadas
- Paginação server-side com limite ajustável (10, 20, 50)

### 📋 Ordens de Serviço
- Cadastro vinculado a equipamentos, com prioridade e prazo opcional
- Busca textual por título e descrição
- Filtros combinados: status + prioridade + prazo
- Ordenação por data de criação ou vencimento
- Indicadores visuais para ordens atrasadas, vencendo hoje e próximas do prazo
- Alteração de status via dropdown inline
- Edição ou remoção do prazo na página de detalhes
- Histórico de alterações de status e prazo
- Página de detalhes com equipamento vinculado e histórico
- Paginação server-side com limite ajustável (10, 20, 50)

### 👤 Perfil do Usuário
- Página `/perfil` com nome, cargo e telefone (editáveis)
- Email e data de criação (read-only)
- Validação de tamanho dos campos (255/50/100 chars)

### 🛡️ Segurança
- Autenticação Supabase (email/senha) com JWT
- Proteção de páginas pelo `proxy.ts` do Next.js 16
- Isolamento de dados por `user_id` em todas as queries
- Rate limiting em memória (30 req/min em POST/PATCH/DELETE)
- Rate limit específico para upload e remoção de imagens (10 req/min)
- Proteção contra open redirect no callback de auth
- Validação de propriedade antes de remover fotos do Storage
- Validação de campos no servidor (tamanho máximo, tipos)
- Respostas de erro seguras (sem expor detalhes internos)
- Row Level Security (RLS) no Supabase

### 📝 Logging
- Logger estruturado em JSON (`logger('level', 'event', data)`)
- Logs de erro em todas as API routes
- Logs de rate limit excedido

## Preview

> As capturas abaixo são referências visuais. Os indicadores de prazo adicionados recentemente ainda não aparecem nas imagens atuais.

### Dashboard

<p align="center">
  <img src="public/previews/preview-dashboard.png" alt="Preview do dashboard do ManutFlow com indicadores de equipamentos e ordens de serviço" width="900" />
</p>

### Equipamentos

<p align="center">
  <img src="public/previews/preview-equipamentos.png" alt="Preview da tela de equipamentos do ManutFlow com cadastro, busca, filtros e listagem" width="900" />
</p>

### Detalhes do equipamento

<p align="center">
  <img src="public/previews/preview-equipamento-detalhes.png" alt="Preview da página de detalhes de equipamento do ManutFlow com informações gerais e ordens vinculadas" width="900" />
</p>

### Ordens de Serviço

<p align="center">
  <img src="public/previews/preview-ordens.png" alt="Preview da tela de ordens de serviço do ManutFlow com formulário, busca e filtros" width="900" />
</p>

### Detalhes da ordem de serviço

<p align="center">
  <img src="public/previews/preview-ordem-detalhes.png" alt="Preview da página de detalhes de ordem de serviço do ManutFlow com status, prioridade, histórico e equipamento vinculado" width="900" />
</p>

### Login e Cadastro

<p align="center">
  <img src="public/previews/preview-login.png" alt="Preview da tela de login do ManutFlow com formulário de email e senha, tema dark e gradiente teal" width="900" />
</p>

<p align="center">
  <img src="public/previews/preview-register.png" alt="Preview da tela de cadastro do ManutFlow com formulário de nome, email e senha" width="900" />
</p>

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Banco | PostgreSQL (Supabase) |
| Auth | Supabase Auth (SSR) |
| Storage | Supabase Storage |
| Gráficos | Recharts |
| Testes | Vitest |
| Linter | ESLint 9 (flat config) |
| TypeScript | strict mode |

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard com indicadores gerais e de prazo, gráfico, ordens urgentes e atividades recentes |
| `/equipamentos` | CRUD de equipamentos com busca, filtro, paginação e upload de foto |
| `/equipamentos/[id]` | Detalhes do equipamento com foto e ordens vinculadas |
| `/ordens` | CRUD de ordens com busca, filtros combinados, ordenação, prazos e paginação |
| `/ordens/[id]` | Detalhes da ordem com equipamento, edição de prazo e histórico |
| `/perfil` | Edição de nome, cargo e telefone |
| `/login` | Login com email e senha |
| `/register` | Cadastro com nome, email e senha |

## Rotas de API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/dashboard-summary` | Indicadores gerais e de prazo, gráfico e atividades do dashboard |
| `GET` | `/api/equipments` | Lista equipamentos (paginado, busca, filtro) |
| `POST` | `/api/equipments` | Cadastra equipamento |
| `GET` | `/api/equipments/[id]` | Detalhes do equipamento + ordens vinculadas |
| `PATCH` | `/api/equipments/[id]` | Edita equipamento (parcial) |
| `DELETE` | `/api/equipments/[id]` | Exclui equipamento (bloqueia se houver ordens) |
| `GET` | `/api/service-orders` | Lista ordens (paginado, busca, filtros e ordenação) |
| `POST` | `/api/service-orders` | Cadastra ordem com prazo opcional |
| `GET` | `/api/service-orders/[id]` | Detalhes da ordem + equipamento + histórico |
| `PATCH` | `/api/service-orders/[id]` | Altera status e/ou prazo com registro de histórico |
| `DELETE` | `/api/service-orders/[id]` | Exclui ordem |
| `GET` | `/api/profile` | Dados do perfil |
| `PATCH` | `/api/profile` | Atualiza perfil (nome, cargo, telefone) |
| `POST` | `/api/upload` | Upload de imagem (valida MIME, 5MB, rate limit 10/min) |
| `DELETE` | `/api/upload` | Remove uma imagem pertencente ao usuário |

### Filtros e ordenação de ordens

| Parâmetro | Valores |
|-----------|---------|
| `status` | `open / in_progress / closed` |
| `priority` | `low / medium / high / critical` |
| `deadline` | `overdue / today / next_7_days / without_due_date` |
| `sort` | `created_desc / created_asc / due_asc / due_desc` |

## Banco de Dados

### `profiles`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID PK | Vinculado a `auth.users.id` |
| `email` | text | Preenchido automaticamente |
| `full_name` | text \| null | Editável via perfil |
| `phone` | text \| null | Editável via perfil |
| `role` | text \| null | Editável via perfil |
| `avatar_url` | text \| null | (não usado) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `equipments`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID PK | |
| `name` | text | Obrigatório, máx 255 |
| `patrimony_code` | text | Obrigatório, único por user_id |
| `location` | text | Obrigatório, máx 255 |
| `status` | text | `active / inactive / maintenance` |
| `photo_url` | text \| null | URL da foto no Supabase Storage |
| `user_id` | UUID FK | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `service_orders`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID PK | |
| `title` | text | Obrigatório, máx 255 |
| `description` | text \| null | Máx 2000 |
| `status` | text | `open / in_progress / closed` |
| `priority` | text | `low / medium / high / critical` |
| `equipment_id` | UUID FK | → equipments |
| `user_id` | UUID FK | |
| `due_date` | date \| null | Prazo opcional da ordem |
| `created_at` | timestamptz | |

### `service_order_history`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID PK | |
| `service_order_id` | UUID FK | → service_orders |
| `user_id` | UUID FK | |
| `event_type` | text | Ex: `status_changed / due_date_changed` |
| `previous_status` | text \| null | |
| `new_status` | text \| null | |
| `description` | text \| null | |
| `created_at` | timestamptz | |

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Necessário no servidor para upload/remoção de imagens
```

## Como rodar localmente

```bash
git clone https://github.com/tharciosantos/manutflow.git
cd manutflow
npm install
cp .env.example .env.local        # Linux/macOS
Copy-Item .env.example .env.local # PowerShell
npm run dev                       # http://localhost:3000
```

## Testes

```bash
npm run test       # 153 testes (Vitest)
npm run test:watch # Modo watch
npm run lint       # ESLint (flat config)
npm run build      # Next build (standalone)
```

Cobertura atual: 13 arquivos de teste, incluindo APIs, autenticação, armazenamento de fotos, regras de prazo e componentes do dashboard/listagem.

| Área | Escopo |
|------|--------|
| API de saúde | Health check |
| APIs de equipamentos | Listagem, criação, detalhes, edição e exclusão |
| APIs de ordens | Listagem, criação, detalhes, status, prazo, histórico e exclusão |
| API do dashboard | Totais, prioridades, vencimentos e ordens urgentes |
| API de upload | Validação, upload, rate limit e remoção |
| Componentes | Dashboard e combinação de filtros da listagem de ordens |
| Utilitários | Auth, redirects seguros, Storage e regras de vencimento |

## Migrations SQL

Os scripts de referência ficam em `scripts/`, pasta ignorada pelo Git e mantida apenas no ambiente local. Eles não são incluídos automaticamente em um novo clone.

- `03-add-profile-fields.sql` — colunas `phone` e `role`
- `04-upload-imagens.sql` — bucket storage + photo_url
- `05-add-service-order-due-date.sql` — prazo opcional e índice de vencimento
- `seed-equipments.sql` — dados opcionais de equipamentos para desenvolvimento

Execute no SQL Editor do Supabase somente os scripts necessários para o ambiente. Em uma instalação nova, as tabelas base, os relacionamentos e as políticas RLS descritos neste README também precisam estar configurados previamente.

## Estrutura de pastas

```
src/
  __tests__/            setup + mocks globais
  app/
    api/                8 route handlers de API
    equipamentos/       listagem e detalhes
    ordens/             listagem e detalhes
    perfil/             página de perfil
    login/              login
    register/           cadastro
  components/
    layout/             AppShell, AppHeader
    ui/                 Modal (<dialog>), StatusCard, Pagination, Breadcrumbs
  features/
    dashboard/          indicadores, vencimentos, gráfico e atividades
    equipments/         form, list, search, filters, config
    service-orders/     form, list, prazos, filtros, badges e config
  lib/
    auth.ts             getUser() para API routes
    rate-limit.ts       rate limiter em memória
    logger.ts           logger estruturado JSON
    supabase/           client.ts, server.ts, middleware.ts
  types/                equipment.ts, service-order.ts, profile.ts
  proxy.ts              sessão SSR e proteção de rotas
```

## Deploy

### Vercel
1. Conecte o repositório no [vercel.com](https://vercel.com)
2. Configure as variáveis de ambiente no dashboard
3. Faça o deploy

### Pós-deploy
- Configure as **Redirect URLs** no Supabase (Authentication > URL Configuration)
- Adicione `https://seu-app.vercel.app/auth/callback`
- Configure `SUPABASE_SERVICE_ROLE_KEY` somente como variável server-side
- Se for usar upload, configure o bucket e a coluna `photo_url`
- Para prazos, garanta que a coluna `service_orders.due_date` e seu índice existam

## Fases implementadas

| # | Fase | Branch |
|:-:|------|--------|
| 0 | Hardening (validações, acessibilidade, segurança) | `fix/hardening-final` |
| 1 | Base inicial de testes automatizados (24 testes) | `feat/testes-automatizados` |
| 2 | Edição de equipamentos (PATCH + modal) | `feat/edicao-equipamentos` |
| 3 | Paginação + filtros server-side | `feat/paginacao` |
| 4 | Dashboard com gráfico Recharts + atividades | `feat/dashboard-melhorias` |
| 5 | Perfil do usuário (API + página + header) | `feat/perfil-usuario` |
| 6 | Rate limiting + logging estruturado | `feat/rate-limit-logs` |
| 7 | Upload de imagens (Supabase Storage) | `feat/upload-imagens` |
| 8 | Responsividade mobile e correções de tema escuro | `feat/melhorias-mobile` / `feat/correcoes-tema-escuro` |
| 9 | Filtros e ordenação da listagem de ordens | `feat/melhorias-listagem-ordens` |
| 10 | Redirects seguros e limpeza de fotos órfãs | `fix/validar-redirecionamento-login` / `fix/limpar-fotos-equipamentos-storage` |
| 11 | Cobertura adicional das APIs e validação de PRs no CI | `test/cobrir-api-*` / `ci/validar-pull-requests` |
| 12 | Prazo, vencimentos, filtros e histórico nas ordens | `feat/adicionar-prazo-ordens-api` / `feat/exibir-prazos-e-vencimentos` |
| 13 | Indicadores de prazo e ordens urgentes no dashboard | `feat/adicionar-indicadores-prazo-dashboard` |

## Aprendizados

- Organização por features (feature-first)
- CRUD completo com GET, POST, PATCH, DELETE
- Paginação server-side com LIMIT/OFFSET
- Busca textual com ILIKE no PostgreSQL
- Filtros e ordenação combinados por query string
- Regras de vencimento consistentes no fuso `America/Sao_Paulo`
- Upload de arquivos com FormData + Supabase Storage
- Rate limiting em memória com cleanup
- Logger estruturado em JSON
- Testes com Vitest + mocks manuais do Supabase
- Git flow: branch → commit → PR → merge → limpeza
- Segurança em camadas: JWT → user_id → RLS
- Proteção de rotas com o Proxy do Next.js 16
- Acessibilidade: labels, aria-*, required
- Tema escuro com Tailwind CSS v4
- Modal com `<dialog>` nativo

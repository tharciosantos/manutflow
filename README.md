# ManutFlow

Sistema de Controle de Manutenção e Ordens de Serviço desenvolvido como projeto full stack de estudo, com foco em organização de código, banco de dados, boas práticas e deploy.

## Objetivo do projeto

O ManutFlow tem como objetivo simular um sistema usado por empresas para controlar equipamentos, ordens de manutenção, responsáveis, prioridades e histórico de atendimento.

A ideia do projeto é aprender desenvolvimento full stack construindo uma aplicação real do zero, passando por front-end, back-end, banco de dados, autenticação, testes, logs e deploy.

## Tecnologias utilizadas até o momento

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase
* PostgreSQL
* Git
* GitHub

## O que já foi implementado

* Criação do projeto com Next.js, TypeScript e Tailwind CSS
* Configuração inicial da estrutura de pastas
* Criação da página inicial do sistema
* Criação de componentes reutilizáveis
* Criação do cabeçalho da aplicação
* Criação de rotas para Dashboard, Equipamentos e Ordens
* Criação de uma API de health check
* Configuração do Supabase no projeto
* Criação da tabela `equipments` no banco de dados
* Configuração de Row Level Security no Supabase
* Criação de policy para permitir leitura dos equipamentos
* Listagem dos equipamentos cadastrados no Supabase dentro da aplicação

## Estrutura inicial do projeto

```text
src/
├─ app/
│  ├─ api/
│  │  └─ health/
│  ├─ equipamentos/
│  ├─ ordens/
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ layout/
│  └─ ui/
├─ features/
│  ├─ dashboard/
│  ├─ equipments/
│  └─ work-orders/
├─ lib/
└─ types/
```

## Principais páginas

### `/`

Página inicial do sistema, funcionando como dashboard inicial.

### `/equipamentos`

Página responsável por listar os equipamentos cadastrados no banco de dados.

### `/ordens`

Página reservada para futuramente criar, listar e acompanhar ordens de serviço.

### `/api/health`

Rota de API criada para verificar se o back-end da aplicação está respondendo corretamente.

## Banco de dados

Até o momento, foi criada a tabela `equipments`.

Campos principais:

* `id`
* `name`
* `patrimony_code`
* `location`
* `status`
* `created_at`
* `updated_at`

Status possíveis:

* `active`
* `inactive`
* `maintenance`

Na interface, esses status são exibidos em português:

* `active` → Ativo
* `inactive` → Inativo
* `maintenance` → Em manutenção

## Segurança

O projeto utiliza Row Level Security no Supabase.

Como o RLS estava ativado, foi necessário criar uma policy permitindo a leitura pública da tabela `equipments`.

Essa configuração permite que a aplicação liste os equipamentos cadastrados no banco.

Mais para frente, as permissões serão ajustadas para funcionar com autenticação e controle de usuários.

## Variáveis de ambiente

O projeto utiliza variáveis de ambiente para conectar com o Supabase.

Exemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

O arquivo `.env.local` não deve ser enviado para o GitHub.

## Como rodar o projeto localmente

Instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse no navegador:

```text
http://localhost:3000
```

## Status atual

O projeto já possui uma base inicial funcional, com interface, rotas, conexão com Supabase e listagem de equipamentos.

Próximos passos:

* Criar formulário de cadastro de equipamentos
* Criar validações básicas
* Criar tabela de ordens de serviço
* Relacionar ordens com equipamentos
* Criar histórico de alterações
* Implementar autenticação
* Criar testes automatizados
* Fazer deploy em produção

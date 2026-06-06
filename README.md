# ManutFlow

Sistema de Controle de Manutenção e Ordens de Serviço desenvolvido como projeto full stack de estudo, com foco em organização de código, banco de dados, boas práticas e evolução incremental.

O projeto está sendo construído do zero como parte de um desafio prático de aprendizado, evoluindo etapa por etapa com foco em entendimento real dos conceitos aplicados.

## Preview

### Equipamentos

<p align="center">
  <img src="./docs/preview-equipamentos.png" alt="Preview da tela de equipamentos do ManutFlow" width="900" />
</p>

### Ordens de Serviço

<p align="center">
  <img src="./docs/preview-ordens.png" alt="Preview da tela de ordens de serviço do ManutFlow" width="900" />
</p>

## Objetivo do projeto

O ManutFlow tem como objetivo simular um sistema usado por empresas para controlar equipamentos, ordens de manutenção, prioridades, status e histórico de atendimento.

A ideia do projeto é aprender desenvolvimento full stack construindo uma aplicação real, passando por front-end, back-end, banco de dados, autenticação, testes, logs e deploy.

## Tecnologias utilizadas até o momento

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase
* PostgreSQL
* Git
* GitHub

## Funcionalidades implementadas

### Estrutura inicial

* Criação do projeto com Next.js, TypeScript e Tailwind CSS
* Configuração inicial da estrutura de pastas
* Criação da página inicial do sistema
* Criação de componentes reutilizáveis
* Criação do cabeçalho da aplicação
* Criação de navegação entre páginas
* Criação das rotas de Dashboard, Equipamentos e Ordens

### API

* Criação da rota `/api/health` para verificar se a API está funcionando
* Criação da rota `/api/equipments`
* Implementação do método `GET` para listar equipamentos
* Implementação do método `POST` para cadastrar equipamentos
* Criação da rota `/api/service-orders`
* Implementação do método `GET` para listar ordens de serviço
* Implementação do método `POST` para cadastrar ordens de serviço
* Criação da rota `/api/service-orders/[id]`
* Implementação do método `DELETE` para excluir ordens de serviço
* Validação dos dados no servidor antes de salvar no banco
* Tratamento de erro para código de patrimônio duplicado
* Tratamento de erro para campos obrigatórios e prioridades inválidas

### Equipamentos

* Criação da tabela `equipments` no Supabase
* Listagem de equipamentos cadastrados no banco de dados
* Cadastro de novos equipamentos pela interface
* Exibição de mensagens de sucesso e erro
* Atualização automática da lista após cadastrar um equipamento
* Tradução dos status técnicos do banco para textos amigáveis na interface

### Ordens de Serviço

* Criação da tabela `service_orders` no Supabase
* Relacionamento entre ordens de serviço e equipamentos
* Cadastro de ordens de serviço pela interface
* Seleção de equipamento ao abrir uma nova ordem
* Definição de prioridade da ordem de serviço
* Listagem de ordens cadastradas
* Exibição do equipamento vinculado à ordem
* Exibição de status e prioridade com textos amigáveis
* Exclusão de ordens de serviço
* Atualização automática da lista após cadastrar ou excluir uma ordem
* Estilização da tela de ordens com tema escuro e cards organizados

### Segurança e banco de dados

* Configuração do Supabase no projeto
* Uso de PostgreSQL como banco de dados
* Configuração de Row Level Security no Supabase
* Criação de policies iniciais para leitura e cadastro de equipamentos
* Criação de policies iniciais para leitura, cadastro e exclusão de ordens de serviço
* Uso de relacionamento entre tabelas com chave estrangeira

> As permissões atuais são temporárias para desenvolvimento. Futuramente, elas serão ajustadas com autenticação e controle de acesso por usuário.

## Estrutura inicial do projeto

```text
src/
├─ app/
│  ├─ api/
│  │  ├─ equipments/
│  │  ├─ health/
│  │  └─ service-orders/
│  │     ├─ [id]/
│  │     └─ route.ts
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
│  └─ service-orders/
├─ lib/
└─ types/
```

## Principais páginas

### `/`

Página inicial do sistema, funcionando como dashboard inicial.

### `/equipamentos`

Página responsável por cadastrar e listar os equipamentos da empresa.

### `/ordens`

Página responsável por criar, listar e excluir ordens de serviço vinculadas aos equipamentos cadastrados.

### `/api/health`

Rota de API criada para verificar se o back-end da aplicação está respondendo corretamente.

### `/api/equipments`

Rota de API responsável por listar e cadastrar equipamentos.

Métodos disponíveis:

```text
GET  /api/equipments
POST /api/equipments
```

### `/api/service-orders`

Rota de API responsável por listar e cadastrar ordens de serviço.

Métodos disponíveis:

```text
GET  /api/service-orders
POST /api/service-orders
```

### `/api/service-orders/[id]`

Rota de API responsável por excluir uma ordem de serviço específica.

Método disponível:

```text
DELETE /api/service-orders/[id]
```

## Banco de dados

Até o momento, foram criadas as tabelas `equipments` e `service_orders`.

### Tabela `equipments`

Campos principais:

* `id`
* `name`
* `patrimony_code`
* `location`
* `status`
* `created_at`
* `updated_at`

Status possíveis no banco:

* `active`
* `inactive`
* `maintenance`

Na interface, esses status são exibidos em português:

* `active` → Ativo
* `inactive` → Inativo
* `maintenance` → Em manutenção

### Tabela `service_orders`

Campos principais:

* `id`
* `title`
* `description`
* `status`
* `priority`
* `equipment_id`
* `created_at`

Status possíveis no banco:

* `open`
* `in_progress`
* `closed`

Na interface, esses status são exibidos em português:

* `open` → Aberta
* `in_progress` → Em andamento
* `closed` → Fechada

Prioridades possíveis no banco:

* `low`
* `medium`
* `high`
* `critical`

Na interface, essas prioridades são exibidas em português:

* `low` → Baixa
* `medium` → Média
* `high` → Alta
* `critical` → Crítica

## Relacionamento entre tabelas

Uma ordem de serviço pertence a um equipamento.

```text
equipments.id
     ↓
service_orders.equipment_id
```

Esse relacionamento permite listar uma ordem de serviço junto com os dados do equipamento vinculado, como nome, código de patrimônio e localização.

## Fluxo atual de cadastro de equipamento

```text
Usuário preenche o formulário
        ↓
Front-end envia uma requisição POST para /api/equipments
        ↓
API valida os dados recebidos
        ↓
API salva o equipamento no Supabase
        ↓
Banco aplica regras como unique e check
        ↓
API retorna sucesso ou erro
        ↓
Interface exibe a mensagem correta
        ↓
Lista de equipamentos é atualizada automaticamente
```

## Fluxo atual de abertura de ordem de serviço

```text
Usuário preenche o formulário de nova ordem
        ↓
Seleciona um equipamento cadastrado
        ↓
Define a prioridade
        ↓
Front-end envia uma requisição POST para /api/service-orders
        ↓
API valida os dados recebidos
        ↓
API salva a ordem no Supabase
        ↓
Ordem é vinculada ao equipamento pelo equipment_id
        ↓
API retorna sucesso ou erro
        ↓
Interface exibe a mensagem correta
        ↓
Lista de ordens é atualizada automaticamente
```

## Validações atuais

A API valida os seguintes campos antes de cadastrar um equipamento:

* nome do equipamento obrigatório;
* código de patrimônio obrigatório;
* localização obrigatória;
* status válido.

A API valida os seguintes campos antes de cadastrar uma ordem de serviço:

* título obrigatório;
* equipamento obrigatório;
* prioridade válida.

O banco também possui regras importantes:

* `patrimony_code` deve ser único;
* `status` de equipamento aceita apenas valores permitidos;
* `status` da ordem aceita apenas valores permitidos;
* `priority` da ordem aceita apenas valores permitidos;
* toda ordem de serviço precisa estar vinculada a um equipamento existente.

## Variáveis de ambiente

O projeto utiliza variáveis de ambiente para conectar com o Supabase.

Exemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

O arquivo `.env.local` não deve ser enviado para o GitHub.

## Como rodar o projeto localmente

Clone o repositório:

```bash
git clone https://github.com/tharciosantos/manutflow.git
```

Entre na pasta do projeto:

```bash
cd manutflow
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env.local` na raiz do projeto e configure as variáveis do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
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

O projeto está em desenvolvimento.

Atualmente, o sistema já possui:

* base visual criada;
* navegação entre páginas;
* conexão com Supabase;
* API interna para equipamentos;
* API interna para ordens de serviço;
* listagem de equipamentos;
* cadastro de equipamentos;
* listagem de ordens de serviço;
* cadastro de ordens de serviço;
* exclusão de ordens de serviço;
* relacionamento entre ordens e equipamentos;
* validação no servidor;
* tratamento de erros básicos;
* Row Level Security configurado de forma inicial.

## Próximos passos

* Implementar alteração de status da ordem de serviço
* Criar histórico de alterações
* Melhorar o dashboard inicial com indicadores reais
* Implementar autenticação
* Melhorar regras de permissão no Supabase
* Criar testes automatizados
* Adicionar logs básicos
* Fazer deploy em produção

## Aprendizados aplicados

Até o momento, o projeto já passou por conceitos como:

* estrutura de rotas no Next.js;
* componentes reutilizáveis;
* organização por features;
* Client Components;
* Server/API Routes;
* consumo de API com `fetch`;
* métodos HTTP `GET`, `POST` e `DELETE`;
* validação no servidor;
* integração com Supabase;
* uso de variáveis de ambiente;
* modelagem de tabelas no PostgreSQL;
* relacionamento entre tabelas;
* chaves estrangeiras;
* Row Level Security;
* policies no Supabase;
* tratamento de erro;
* atualização automática da interface após ações do usuário;
* versionamento com Git e GitHub.

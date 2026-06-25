# ManutFlow

Sistema de Controle de Manutenção e Ordens de Serviço desenvolvido como projeto full stack de estudo, com foco em organização de código, banco de dados, boas práticas, documentação técnica e evolução incremental.

O projeto está sendo construído do zero como parte de um desafio prático de aprendizado, evoluindo etapa por etapa com foco em entendimento real dos conceitos aplicados em uma aplicação full stack.

## Preview

### Dashboard

<p align="center">
  <img src="./docs/preview-dashboard.png" alt="Preview do dashboard do ManutFlow com indicadores de equipamentos e ordens de serviço" width="900" />
</p>

### Equipamentos

<p align="center">
  <img src="./docs/preview-equipamentos.png" alt="Preview da tela de equipamentos do ManutFlow com cadastro, busca, filtros e listagem" width="900" />
</p>

### Detalhes do equipamento

<p align="center">
  <img src="./docs/preview-equipamento-detalhes.png" alt="Preview da página de detalhes de equipamento do ManutFlow com informações gerais e ordens vinculadas" width="900" />
</p>

### Ordens de Serviço

<p align="center">
  <img src="./docs/preview-ordens.png" alt="Preview da tela de ordens de serviço do ManutFlow com formulário, busca e filtros" width="900" />
</p>

<p align="center">
  <img src="./docs/preview-ordens2.png" alt="Preview da listagem de ordens de serviço do ManutFlow com status, prioridades e equipamentos vinculados" width="900" />
</p>

## Objetivo do projeto

O ManutFlow tem como objetivo simular um sistema usado por empresas para controlar equipamentos, ordens de manutenção, prioridades, status e histórico de atendimento.

A ideia do projeto é aprender desenvolvimento full stack construindo uma aplicação real, passando por front-end, back-end, banco de dados, validações, regras de negócio, documentação, autenticação futura, testes, logs e deploy.

## Tecnologias utilizadas até o momento

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase
* PostgreSQL
* Git
* GitHub

## Status atual & Funcionalidades

O projeto está em desenvolvimento e atualmente possui:

### Dashboard

* Indicadores reais consumidos do Supabase
* Total de equipamentos cadastrados
* Total de ordens de serviço
* Contagem de ordens abertas, em andamento e fechadas
* Interface em tema dark com identidade visual em teal

### Equipamentos

* Cadastro, listagem e exclusão de equipamentos
* Validação de campos obrigatórios
* Tratamento para código de patrimônio duplicado
* Busca textual por nome, código de patrimônio, localização e status
* Filtro por status: ativo, inativo e em manutenção
* Status exibidos com textos amigáveis e badges visuais
* Página de detalhes do equipamento
* Exibição de ordens de serviço vinculadas ao equipamento
* Bloqueio de exclusão para equipamentos com ordens de serviço vinculadas
* Atualização automática da lista após cadastro ou exclusão
* Estado vazio para busca e filtros sem resultado

### Ordens de Serviço

* Cadastro de ordens vinculadas a equipamentos
* Listagem de ordens com dados do equipamento relacionado
* Alteração de status pela interface
* Exclusão de ordens de serviço
* Busca textual por título, descrição, equipamento, patrimônio e local
* Filtro por status: abertas, em andamento e fechadas
* Estados vazios para busca e filtros sem resultado
* Atualização automática da lista após cadastro, exclusão ou alteração de status

### Back-end e Banco de Dados

* API interna para dashboard, equipamentos e ordens de serviço
* Validação dos dados no servidor antes de salvar no banco
* Integração com Supabase e PostgreSQL
* Relacionamento entre `equipments` e `service_orders`
* Rota dinâmica para buscar detalhes de um equipamento
* Rota dinâmica para excluir equipamentos com validação de vínculo
* Bloqueio de exclusão de equipamentos com ordens vinculadas
* Row Level Security configurado inicialmente
* Policies provisórias para ambiente de desenvolvimento

> As permissões atuais são temporárias para desenvolvimento. Futuramente, elas serão ajustadas com autenticação e controle de acesso por usuário.

## Estrutura do projeto

```text
src/
├─ app/
│  ├─ api/
│  │  ├─ dashboard-summary/
│  │  ├─ equipments/
│  │  │  ├─ [id]/
│  │  │  └─ route.ts
│  │  ├─ health/
│  │  └─ service-orders/
│  │     ├─ [id]/
│  │     └─ route.ts
│  ├─ equipamentos/
│  │  ├─ [id]/
│  │  └─ page.tsx
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

Página inicial do sistema, funcionando como dashboard com indicadores reais de equipamentos e ordens de serviço.

### `/equipamentos`

Página responsável por cadastrar, listar, buscar, filtrar e excluir equipamentos da empresa.

### `/equipamentos/[id]`

Página responsável por exibir os detalhes de um equipamento específico, incluindo dados gerais e ordens de serviço vinculadas.

### `/ordens`

Página responsável por criar, listar, buscar, filtrar, atualizar status e excluir ordens de serviço vinculadas aos equipamentos cadastrados.

## Rotas de API

### `/api/health`

Rota criada para verificar se o back-end da aplicação está respondendo corretamente.

```text
GET /api/health
```

### `/api/dashboard-summary`

Rota responsável por retornar os indicadores do dashboard.

```text
GET /api/dashboard-summary
```

Retorna informações como total de equipamentos, total de ordens de serviço e contagem de ordens por status.

### `/api/equipments`

Rota responsável por listar e cadastrar equipamentos.

```text
GET  /api/equipments
POST /api/equipments
```

### `/api/equipments/[id]`

Rota responsável por buscar detalhes ou excluir um equipamento específico.

```text
GET    /api/equipments/[id]
DELETE /api/equipments/[id]
```

A exclusão de equipamentos valida se existem ordens de serviço vinculadas. Caso existam vínculos, a exclusão é bloqueada para preservar a integridade dos dados.

### `/api/service-orders`

Rota responsável por listar e cadastrar ordens de serviço.

```text
GET  /api/service-orders
POST /api/service-orders
```

### `/api/service-orders/[id]`

Rota responsável por atualizar ou excluir uma ordem de serviço específica.

```text
PATCH  /api/service-orders/[id]
DELETE /api/service-orders/[id]
```

## Banco de dados

Até o momento, foram criadas as tabelas `equipments` e `service_orders`.

### `equipments`

Campos principais:

* `id`
* `name`
* `patrimony_code`
* `location`
* `status`
* `created_at`
* `updated_at`

Status possíveis:

* `active` → Ativo
* `inactive` → Inativo
* `maintenance` → Em manutenção

### `service_orders`

Campos principais:

* `id`
* `title`
* `description`
* `status`
* `priority`
* `equipment_id`
* `created_at`

Status possíveis:

* `open` → Aberta
* `in_progress` → Em andamento
* `closed` → Fechada

Prioridades possíveis:

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

Também permite exibir, na página de detalhes do equipamento, as ordens de serviço vinculadas a ele.

## Fluxos principais

### Cadastro de equipamento

```text
Usuário preenche o formulário
        ↓
Front-end envia POST para /api/equipments
        ↓
API valida os dados
        ↓
API salva no Supabase
        ↓
Banco aplica regras como unique e check
        ↓
Interface exibe sucesso ou erro
        ↓
Lista de equipamentos é atualizada
```

### Busca e filtro de equipamentos

```text
Usuário digita um termo de busca ou seleciona um status
        ↓
Front-end filtra os equipamentos já carregados
        ↓
Lista exibe apenas os equipamentos compatíveis
        ↓
Caso não existam resultados, a interface exibe um estado vazio específico
```

### Detalhes do equipamento

```text
Usuário acessa os detalhes de um equipamento
        ↓
Front-end requisita GET /api/equipments/[id]
        ↓
API busca os dados do equipamento
        ↓
API busca as ordens de serviço vinculadas ao equipamento
        ↓
Interface exibe informações gerais e histórico vinculado
```

### Exclusão de equipamento

```text
Usuário solicita a exclusão de um equipamento
        ↓
Interface pede confirmação
        ↓
Front-end envia DELETE para /api/equipments/[id]
        ↓
API verifica se existem ordens de serviço vinculadas
        ↓
Se houver vínculo, a exclusão é bloqueada
        ↓
Se não houver vínculo, o equipamento é removido
        ↓
Lista de equipamentos é atualizada
```

### Abertura de ordem de serviço

```text
Usuário preenche o formulário
        ↓
Seleciona um equipamento cadastrado
        ↓
Define a prioridade
        ↓
Front-end envia POST para /api/service-orders
        ↓
API valida os dados
        ↓
API salva a ordem no Supabase
        ↓
Ordem é vinculada ao equipamento pelo equipment_id
        ↓
Interface exibe sucesso ou erro
        ↓
Lista de ordens é atualizada
```

### Alteração de status da ordem

```text
Usuário altera o status na interface
        ↓
Front-end envia PATCH para /api/service-orders/[id]
        ↓
API valida se o status é permitido
        ↓
API atualiza a ordem no Supabase
        ↓
Interface recarrega a lista
        ↓
Status atualizado aparece na tela
```

## Validações atuais

A API valida os dados antes de salvar, atualizar ou excluir registros.

### Equipamentos

* nome obrigatório;
* código de patrimônio obrigatório;
* localização obrigatória;
* status válido;
* código de patrimônio único;
* bloqueio de exclusão quando existem ordens vinculadas.

### Ordens de serviço

* título obrigatório;
* equipamento obrigatório;
* prioridade válida;
* status válido ao atualizar;
* vínculo obrigatório com um equipamento existente.

Além das validações da API, o banco também possui regras para limitar valores aceitos em campos como `status` e `priority`.

## Interface e identidade visual

A interface utiliza tema dark com base em tons de slate e destaques em teal.

A paleta visual segue uma separação entre cores de identidade e cores semânticas:

* `teal` para ações principais, links, filtros ativos e badges informativos;
* `emerald` para estados positivos, como ativo ou fechado;
* `amber` para manutenção ou andamento;
* `yellow`, `orange` e `red` para níveis de prioridade;
* `red` para erros e ações destrutivas;
* `slate` e `white` para base visual, textos e superfícies.

O objetivo é manter uma aparência consistente, discreta e próxima de um sistema real de uso interno.

## Variáveis de ambiente

O projeto utiliza variáveis de ambiente para conectar com o Supabase.

As variáveis necessárias estão documentadas no arquivo `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Para rodar o projeto localmente, copie o arquivo `.env.example` para `.env.local` e preencha com os dados do seu projeto no Supabase.

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

Copie o arquivo de exemplo das variáveis de ambiente:

```bash
cp .env.example .env.local
```

No Windows PowerShell, você também pode usar:

```powershell
Copy-Item .env.example .env.local
```

Depois, preencha o arquivo `.env.local` com os dados do seu projeto no Supabase.

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse no navegador:

```text
http://localhost:3000
```

## Próximos passos

* Criar página de detalhes da ordem de serviço
* Criar histórico de alterações da ordem
* Melhorar o dashboard com indicadores adicionais
* Implementar autenticação
* Melhorar regras de permissão no Supabase
* Criar testes automatizados
* Adicionar logs básicos
* Fazer deploy em produção

## Aprendizados aplicados

Até o momento, o projeto já passou por conceitos importantes de desenvolvimento full stack.

### Front-end

* estrutura de rotas no Next.js;
* componentes reutilizáveis;
* organização por features;
* Client Components;
* consumo de API com `fetch`;
* estado de carregamento, erro e lista vazia;
* busca e filtro no front-end;
* rotas dinâmicas;
* páginas de detalhes;
* atualização automática da interface após ações do usuário;
* identidade visual consistente com Tailwind CSS.

### Back-end e API

* Server/API Routes;
* métodos HTTP `GET`, `POST`, `PATCH` e `DELETE`;
* rotas dinâmicas de API;
* validação no servidor;
* tratamento de erro;
* bloqueio de ações com base em relacionamento entre tabelas;
* separação entre interface, API e banco de dados.

### Banco de dados e segurança

* integração com Supabase;
* uso de variáveis de ambiente;
* modelagem de tabelas no PostgreSQL;
* relacionamento entre tabelas;
* chaves estrangeiras;
* Row Level Security;
* policies no Supabase;
* preservação de integridade ao impedir exclusão de equipamentos vinculados a ordens.

### Processo de desenvolvimento

* versionamento com Git e GitHub;
* fluxo de branch, commit, Pull Request, merge e limpeza de branches;
* evolução incremental por pequenas tarefas;
* auditoria visual com apoio de agente de código;
* revisão de alterações antes do commit;
* documentação técnica do projeto.

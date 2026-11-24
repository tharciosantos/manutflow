## Resumo

<!-- 1 a 3 frases diretas citando nominalmente os módulos, rotas ou componentes afetados e o impacto concreto. -->

## Tipo de Mudança

- [ ] Feature
- [ ] Fix
- [ ] Refactor
- [ ] Docs
- [ ] Test
- [ ] Chore

## Changelog

<!-- Agrupe apenas pelas categorias presentes (Features, Fixes, Refactor, Tests, Docs, Chore).
     Cada item começa com verbo no presente do indicativo: Adiciona, Atualiza, Corrige, Remove, Sincroniza, Concentra, Extrai. -->

### Features

- Adiciona

### Fixes

- Corrige

## Como Testar

1. Rode `npm run dev`.
2. Abra `<!-- rota ou página (ex: /equipamentos ou /ordens) -->` e confira `<!-- comportamento esperado -->`.
3. Repita com uma sessão sem autenticação e confirme `<!-- redirecionamento ou 401 esperado -->`.

## Checklist

- [ ] Build passa (`npm run build`)
- [ ] Lint passa (`npm run lint`)
- [ ] Testes passam (`npm test`)
- [ ] TypeScript sem erros (`npx tsc --noEmit`)
- [ ] Apenas arquivos do escopo alterados
- [ ] Sem segredos em componente client (`"use client"`)
- [ ] Queries filtram `.eq('user_id', user.id)`
- [ ] Migration aplicada, se houver mudança de schema
- [ ] Docs sincronizadas (`AGENTS.md` / `README.md` / `supabase/README.md`)

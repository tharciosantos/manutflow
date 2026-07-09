## Correções de Tema Escuro

Correções visuais para consistência do tema escuro e melhorias de UX no Dashboard, Header e CSS global.

### Mudanças

#### 🎨 CSS Global (`globals.css`)
- `--background`: `#ffffff` → `#020617` (slate-950) — elimina flash branco no carregamento
- `--foreground`: `#171717` → `#f1f5f9` (slate-100) — texto escuro legível
- Removido `@media (prefers-color-scheme: dark)` — tema escuro agora é o padrão

#### 📊 Dashboard — Tooltip do gráfico (`dashboard-overview.tsx`)
- Adicionado `cursor={{ fill: '#1e293b' }}` — hover do gráfico escuro em vez de branco
- Adicionado `itemStyle={{ color: '#cbd5e1' }}` — texto do tooltip legível

#### 🧭 Header — Layout shift (`app-header.tsx`)
- Substituído `{userEmail && <span>}` por `visibility: visible/invisible`
- Espaço do email sempre reservado, evitando que "Meu Perfil" e "Sair" dancem ao navegar entre páginas

### Preview

| Antes | Depois |
|-------|--------|
| Flash branco ao carregar a página | Fundo escuro desde o primeiro frame |
| Tooltip do gráfico com hover branco | Hover escuro (#1e293b) |
| Header "dança" quando email carrega | Espaço reservado, sem movimento |

### Checklist

- [ ] Verificar flash branco no carregamento inicial
- [ ] Passar mouse sobre o gráfico do dashboard
- [ ] Navegar entre páginas e observar o header

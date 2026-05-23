# Guia da Estrutura Atual do Projeto

## Estado atual

O projeto nao usa mais catalogo local em `src/data/*.js` como fonte principal.

Hoje a aplicacao roda em:

- `React + Vite` no frontend
- `Supabase Auth` para login, cadastro, OAuth e reset de senha
- `Supabase Postgres` para catalogo, progresso de leitura, metas, ranking e gamificacao

## Estrutura relevante

```text
src/
  components/        layout e componentes reutilizaveis
  pages/             telas da aplicacao
  services/          integracao com Supabase e regras de negocio
  data/
    categoriesNav.js unico arquivo de apoio local ainda usado pela navbar
  lib/supabase.js    cliente Supabase
  App.jsx            shell da SPA

supabase/
  migrations/        schema e seed do banco
```

## Fluxo de dados

### Catalogo

- `CatalogService.js`
- Tabelas: `categorias`, `filtros_categoria`, `livros`

### Auth

- `AuthService.js`
- Supabase Auth + tabela `usuarios`

### Leitura e progresso

- `ReadingService.js`
- Tabelas: `progresso_leitura`, `sessoes_leitura`, `estatisticas_usuario`, `eventos_gamificacao`

### Metas

- `GoalsService.js`
- Tabela `metas_leitura`
- Views `progresso_metas`, `ranking_geral`, `ranking_semanal`

### Experiencia das telas

- `ExperienceService.js`
- Sugestoes, quiz, historico recente e registro manual de leitura

## Como adicionar ou editar livros agora

Nao edite mais arquivos JS locais com arrays de livros.

Use uma destas opcoes:

1. Painel admin da aplicacao
2. SQL/migrations em `supabase/migrations`
3. Supabase Studio

## Observacao

Se algum guia antigo mencionar `data/database.js` ou arrays locais por categoria, considere esse trecho legado.

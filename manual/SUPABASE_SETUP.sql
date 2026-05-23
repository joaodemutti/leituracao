-- ============================================================
--  SUPABASE SETUP — LeiturAção
--  Execute este script no SQL Editor do seu painel Supabase:
--  painel → SQL Editor → New query → cole e clique em Run
-- ============================================================

-- 1. Cria a tabela de usuários
create table if not exists public.usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  username    text not null unique,
  email       text not null unique,
  created_at  timestamptz not null default now()
);

-- 2. Ativa segurança por linha (RLS)
--    Garante que cada usuário só acessa os próprios dados.
alter table public.usuarios enable row level security;

-- 3. Política: usuário lê apenas o próprio perfil
create policy "Usuário lê próprio perfil"
  on public.usuarios
  for select
  using (auth.uid() = id);

-- 4. Política: usuário insere apenas o próprio perfil
create policy "Usuário insere próprio perfil"
  on public.usuarios
  for insert
  with check (auth.uid() = id);

-- 5. Política: usuário atualiza apenas o próprio perfil
create policy "Usuário atualiza próprio perfil"
  on public.usuarios
  for update
  using (auth.uid() = id);

-- ============================================================
--  Pronto! Agora abra o arquivo services/supabase.js e
--  substitua SUPABASE_URL e SUPABASE_KEY pelos valores do
--  seu projeto em: painel → Settings → API
-- ============================================================

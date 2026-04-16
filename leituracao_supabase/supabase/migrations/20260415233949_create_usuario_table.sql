-- Apaga a tabela antiga e recria corretamente
drop table if exists public.usuarios;

create table public.usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  username    text not null unique,
  email       text not null unique,
  created_at  timestamptz not null default now()
);

alter table public.usuarios enable row level security;

create policy "Usuário lê próprio perfil"
  on public.usuarios for select
  using (auth.uid() = id);

create policy "Usuário insere próprio perfil"
  on public.usuarios for insert
  with check (auth.uid() = id);

create policy "Usuário atualiza próprio perfil"
  on public.usuarios for update
  using (auth.uid() = id);